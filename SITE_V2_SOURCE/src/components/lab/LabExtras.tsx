import { useState } from 'react';
import { decide, utilities, FROZEN, fmt, type Action } from '../../domain/decisionModel';
import { initialFlow, startFlow, stepFlow, SEGMENT_SECONDS } from '../../simulation/requestFlow';
import type { LabScenario } from '../../simulation/scenarioGenerator';
import { Gauge } from '../ui/Gauge';

const names = { es: { act: 'Actuar', ask: 'Preguntar', abstain: 'Abstenerse' }, en: { act: 'Act', ask: 'Ask', abstain: 'Abstain' } };
export function DecisionFeedback({ choice, best, u, lang }: { choice: Action; best: Action; u: Record<Action, number>; lang: 'es' | 'en' }) {
  const gap = Math.max(0, u[best] - u[choice]);
  return <div role="status"><p>{lang === 'es' ? 'Comparación matemática hipotética' : 'Hypothetical mathematical comparison'}</p>
    <p>{names[lang][choice]}: {fmt(u[choice], 3, lang)} · {lang === 'es' ? 'Máxima utilidad esperada' : 'Maximum expected utility'}: {fmt(u[best], 3, lang)}.</p>
    <p>{lang === 'es' ? 'Costo de oportunidad' : 'Opportunity cost'}: {fmt(gap, 3, lang)}. {gap <= 1e-12
      ? (lang === 'es' ? 'Su elección alcanza la máxima utilidad esperada; puede haber empate.' : 'Your choice achieves maximum expected utility; ties are possible.')
      : (lang === 'es' ? `Con estos supuestos, ${names[lang][best].toLowerCase()} ofrece mayor utilidad esperada. La diferencia expresa utilidad que se dejaría de obtener en promedio, no una pérdida ocurrida.` : `Under these assumptions, ${names[lang][best].toLowerCase()} offers higher expected utility. The difference represents foregone average utility, not a loss that occurred.`)}</p></div>;
}
export function LabExtras({ scenario: s, lang }: { scenario: LabScenario; lang: 'es' | 'en' }) {
  const es = lang === 'es';
  const stages = [{id:'input',node:'pedido'}, {id:'context',node:'contexto'}, {id:'confidence',node:'supuesto'}, {id:'rule',node:'regla'}, {id:'decision',node:'$outcome'}];
  // The lab displays the utility policy. The default illustrative veto in the existing brain is unchanged.
  const makeFlow = () => startFlow(initialFlow(), { ...s, id: String(s.seed) }, stages, false);
  const [flow, setFlow] = useState(makeFlow);
  const labels: Record<string,string> = { pedido: es ? 'Pedido' : 'Request', contexto: es ? 'Contexto' : 'Context', supuesto: es ? 'p supuesto' : 'Assumed p', regla: es ? 'Utilidades' : 'Utilities', actuar: names[lang].act, preguntar: names[lang].ask, abstenerse: names[lang].abstain, humano: es ? 'Intervención humana' : 'Human involvement' };
  const base = FROZEN[s.riskClass];
  const [p, setP] = useState(s.p);
  const [c, setC] = useState(base.c);
  const [k, setK] = useState(base.k);
  const params = { ...base, c, k };
  const action = decide(p, params);
  const u = utilities(p, params);
  return <>
    <section className="card lab-block"><h2>{es ? 'Recorrido hipotético de la regla' : 'Hypothetical policy flow'}</h2>
      <p>{es ? 'Derivado del mismo escenario y de los parámetros congelados. No representa ejecución ni calibración real. Los vetos se explican por separado.' : 'Derived from the same scenario and frozen parameters. It does not represent execution or real calibration. Vetoes are explained separately.'}</p>
      <svg className="lab-flow" viewBox={`0 0 520 ${flow.steps.length * 56}`} role="img" aria-label={flow.steps.map(x=>labels[x.node]).join(' → ')}>
        {flow.steps.map((step,i)=><g key={`${step.node}-${i}`}><line x1="28" y1={i*56+24} x2="28" y2={i*56+70} stroke="currentColor" visibility={i === flow.steps.length-1 ? 'hidden' : 'visible'}/><circle cx="28" cy={i*56+24} r="12" fill={i<=flow.index ? 'var(--act)' : 'var(--surface)'} stroke="currentColor"/><text x="55" y={i*56+30} fill="currentColor">{i+1}. {labels[step.node]}{i===flow.index ? ' ←' : ''}</text></g>)}
      </svg>
      <p aria-live="polite">{es ? 'Paso' : 'Step'} {flow.index+1}/{flow.steps.length}: {labels[flow.steps[flow.index]!.node]}</p>
      <div className="lab-choices"><button className="btn" disabled={flow.status==='done'} onClick={()=>setFlow(f=>stepFlow(f, SEGMENT_SECONDS))}>{es ? 'Siguiente paso' : 'Next step'}</button><button className="btn" onClick={()=>setFlow(makeFlow())}>{es ? 'Reiniciar recorrido' : 'Reset flow'}</button></div>
    </section>
    <details className="card lab-block"><summary>{es ? '¿Qué cambiaría esta decisión?' : 'What would change this decision?'}</summary>
      <p>{es ? 'Exploración hipotética: estos controles no cambian el escenario ni los parámetros congelados de la política publicada. p representa comprensión, no éxito al ejecutar. Costos en unidades de utilidad.' : 'Hypothetical exploration: these controls do not change the scenario or the published policy’s frozen parameters. p represents understanding, not execution success. Costs are in utility units.'}</p>
      {([{id:'p',label:es?'Confianza supuesta p':'Assumed confidence p',value:p,max:1,step:.001,set:setP},{id:'c',label:es?'Costo de equivocarse c':'Error cost c',value:c,max:8,step:.1,set:setC},{id:'k',label:es?'Costo de preguntar k':'Question cost k',value:k,max:2,step:.01,set:setK}]).map(x=><label className="lab-slider" key={x.id}>{x.label}: {fmt(x.value,3,lang)}<input type="range" min="0" max={x.max} step={x.step} value={x.value} onChange={e=>x.set(Number(e.target.value))}/></label>)}
      <div className="lab-gauge-wrap"><Gauge params={params} p={p} action={action} label={es?'Sensibilidad hipotética':'Hypothetical sensitivity'} ticks lang={lang}/></div>
      <p aria-live="polite">{es?'Decisión exploratoria':'Exploratory decision'}: {names[lang][action]}. {Object.entries(u).map(([a,v])=>`${names[lang][a as Action]}: ${fmt(v,3,lang)}`).join(' · ')}</p>
      <button className="btn" onClick={()=>{setP(s.p);setC(base.c);setK(base.k);}}>{es?'Restablecer supuestos':'Reset assumptions'}</button>
    </details>
  </>;
}
