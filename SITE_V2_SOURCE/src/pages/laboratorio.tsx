import { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/global.css';
import './laboratorio.css';
import { FROZEN, decide, fmt, regions, thresholds, utilities, type Action, type RiskClass } from '../domain/decisionModel';
import { useT } from '../app/i18n';
import { useStore } from '../store/navigation';
import { ActionChip } from '../components/ui/ActionChip';
import { Gauge } from '../components/ui/Gauge';
import { decideScenario } from '../simulation/requestFlow';
import { LAB_VERSION, generateScenario, isRiskClass, type LabScenario } from '../simulation/scenarioGenerator';

const ACTS: Action[] = ['act', 'ask', 'abstain'];

export function parseLabSearch(search: string): { warning: boolean; scenario: LabScenario | null; lang: 'es' | 'en' } {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const lang = q.get('lang') === 'en' ? 'en' : 'es';
  const has = q.has('s') || q.has('v') || q.has('pol') || q.has('riesgo');
  if (!has) return { warning: false, scenario: null, lang };
  const version = q.get('v');
  const seedRaw = q.get('s');
  const pol = q.get('pol');
  const riesgo = q.get('riesgo');
  if (version !== String(LAB_VERSION) || pol !== 'manuscrito' || seedRaw === null || !/^\d+$/.test(seedRaw)) {
    return { warning: true, scenario: null, lang };
  }
  if (riesgo !== null && !isRiskClass(riesgo)) return { warning: true, scenario: null, lang };
  return { warning: false, scenario: generateScenario(Number(seedRaw), riesgo ?? undefined), lang };
}

export function labHref(s: LabScenario, lang: 'es' | 'en'): string {
  const q = new URLSearchParams();
  q.set('s', String(s.seed));
  q.set('v', String(s.version));
  q.set('pol', 'manuscrito');
  q.set('riesgo', s.riskClass);
  if (lang === 'en') q.set('lang', 'en');
  return `?${q.toString()}`;
}

function isFrontier(value: number, cuts: number[]): boolean {
  return cuts.some((c) => Math.abs(c - value) <= 1 / 500 + 1e-9);
}

const copy = {
  es: {
    title: 'Laboratorio de decisiones · Calibrated Agent',
    band: 'Laboratorio de decisiones · ESCENARIOS SINTÉTICOS. Las situaciones y sus números son inventados por un generador con semilla. Sirven para entender la regla; no prueban que funcione ni que un agente real esté calibrado.',
    back: 'Volver a Cómo decide',
    generate: 'Generar situación',
    seed: 'Semilla',
    warning: 'Este enlace se generó con otra versión del generador. No se reinterpreta.',
    how: 'Primero se genera una situación con semilla. Después usted elige actuar, preguntar o abstenerse. Recién entonces aparece la decisión de la regla, el instrumento y la expectativa matemática.',
    situation: 'Situación',
    scenarioWord: 'Escenario',
    hypo: 'HIPOTÉTICO',
    knows: 'Qué se sabe',
    risk: 'Clase de riesgo',
    reversible: 'Reversible',
    yes: 'sí',
    no: 'no',
    askTitle: '¿Qué decidiría usted?',
    skip: 'Ver sin elegir',
    yourChoice: 'Su elección',
    coincides: 'Su elección coincide con la regla.',
    differs: 'Su elección difiere de la regla.',
    decision: 'Decisión de la regla',
    chip: 'POLÍTICA DEL MANUSCRITO',
    policy: 'Regla usada: la del modelo del manuscrito (§3). Si la pregunta no aclara, el agente actúa igual.',
    abstainWhy: 'Se abstiene porque, con esta regla, si la pregunta no aclara se actúa igual, y con riesgo alto eso no compensa.',
    reopt: '¿Y si después de una pregunta fallida reconsiderara? Es otra política: ver Investigación',
    veto: 'Veto del manuscrito (§3.6): la acción es irreversible, así que antes de actuar se pediría confirmación. El laboratorio muestra la regla de utilidad sin aplicar los vetos.',
    instruments: 'Instrumentos',
    pName: 'p · probabilidad de haber entendido bien el pedido · supuesto del generador',
    fixed: 'Parámetros fijos de la clase, sin controles.',
    actFrom: 'Actuar exige p mayor que este umbral',
    thisP: 'Esta situación tiene',
    utilities: 'Expectativa matemática · supuestos del generador · no ocurrió',
    notYet: 'Recorrido en el cerebro: próxima versión.',
    hidden: 'Qué no muestra este laboratorio',
    magnitudes: [
      'Confianza declarada: en este laboratorio se supone igual a p. La fija el generador.',
      'No hay un calibrador entrenado ni evaluado.',
      'p es la probabilidad de haber entendido bien el pedido. No es la probabilidad de que el resultado salga bien.',
      'Éxito al ejecutar: no modelado. Se supone que entender bien implica ejecutar bien.',
      'La decisión es la acción de mayor utilidad esperada con estos costos. No es una garantía.',
      'El bloque de utilidades es una expectativa matemática. No ocurrió.',
      'No hay resultados empíricos en este laboratorio. El único registro del proyecto es un piloto de 8 decisiones, autoevaluado.',
      'El veto de §3.6, que exige probabilidad calibrada y validada, alcanzaría a todos los escenarios, porque el laboratorio no tiene calibrador.',
    ],
    evidenceLink: 'Ver Evidencia.',
    record: 'Registro',
    copyLink: 'Copiar enlace',
    copied: 'Enlace copiado',
    policyName: 'Política: del manuscrito (§3)',
    classes: { bajo: 'riesgo bajo', medio: 'riesgo medio', alto: 'riesgo alto' } as Record<RiskClass, string>,
  },
  en: {
    title: 'Decision lab · Calibrated Agent',
    band: 'Decision lab · SYNTHETIC SCENARIOS. Situations and numbers are generated from a seed. They explain the rule; they do not show that it works or that any real agent is calibrated.',
    back: 'Back to How it decides',
    generate: 'Generate a situation',
    seed: 'Seed',
    warning: 'This link was generated with another version of the generator. It is not reinterpreted.',
    how: 'First a seeded situation is generated. Then you choose to act, ask or abstain. Only then do the rule’s decision, the instrument and the mathematical expectation appear.',
    situation: 'Situation',
    scenarioWord: 'Scenario',
    hypo: 'HYPOTHETICAL',
    knows: 'What is known',
    risk: 'Risk class',
    reversible: 'Reversible',
    yes: 'yes',
    no: 'no',
    askTitle: 'What would you decide?',
    skip: 'See without choosing',
    yourChoice: 'Your choice',
    coincides: 'Your choice coincides with the rule.',
    differs: 'Your choice differs from the rule.',
    decision: 'Decision of the rule',
    chip: 'MANUSCRIPT POLICY',
    policy: 'Rule used: the one in the manuscript model (§3). If the question does not clarify, the agent acts anyway.',
    abstainWhy: 'It abstains because, under this rule, if the question does not clarify the agent acts anyway, and at high risk that does not pay off.',
    reopt: 'What if it reconsidered after a failed question? That is another policy: see Research',
    veto: 'Manuscript veto (§3.6): the action is irreversible, so confirmation would be requested before acting. The lab shows the utility rule without applying vetoes.',
    instruments: 'Instruments',
    pName: 'p · probability of having understood the request · generator assumption',
    fixed: 'Parameters fixed for the class, with no controls.',
    actFrom: 'Acting requires p greater than this threshold',
    thisP: 'This situation has',
    utilities: 'Mathematical expectation · generator assumptions · it did not happen',
    notYet: 'Path through the brain: a later version.',
    hidden: 'What this lab does not show',
    magnitudes: [
      'Declared confidence: in this lab it is assumed equal to p. The generator sets it.',
      'There is no trained or evaluated calibrator.',
      'p is the probability of having understood the request. It is not the probability that the outcome goes well.',
      'Success when executing: not modeled. Understanding well is assumed to mean executing well.',
      'The decision is the action with the highest expected utility at these costs. It is not a guarantee.',
      'The utility block is a mathematical expectation. It did not happen.',
      'There are no empirical results in this lab. The only project record is a self-evaluated pilot of 8 decisions.',
      'The §3.6 veto, which requires calibrated and validated probability, would apply to every scenario, because the lab has no calibrator.',
    ],
    evidenceLink: 'See Evidence.',
    record: 'Record',
    copyLink: 'Copy link',
    copied: 'Link copied',
    policyName: 'Policy: manuscript (§3)',
    classes: { bajo: 'low risk', medio: 'medium risk', alto: 'high risk' } as Record<RiskClass, string>,
  },
};

function Utilities({ u, best, lang }: { u: Record<Action, number>; best: Action; lang: 'es' | 'en' }) {
  const names = lang === 'es' ? { act: 'Actuar', ask: 'Preguntar', abstain: 'Abstenerse' } : { act: 'Act', ask: 'Ask', abstain: 'Abstain' };
  const max = Math.max(1e-6, ...ACTS.map((a) => Math.abs(u[a])));
  return (
    <svg className="lab-bars" viewBox="0 0 360 120" role="img" aria-label={ACTS.map((a) => `${names[a]} ${fmt(u[a], 3, lang)}`).join(', ')}>
      {ACTS.map((a, i) => {
        const w = (Math.abs(u[a]) / max) * 220;
        const y = 16 + i * 36;
        return (
          <g key={a}>
            <text x="0" y={y + 14} className="lab-bar-label">
              {names[a]}
            </text>
            <rect x="108" y={y} width={w} height="18" className={`lab-bar lab-bar-${a}${a === best ? ' is-best' : ''}`} />
            <text x={116 + w} y={y + 14} className="lab-bar-num">
              {fmt(u[a], 3, lang)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function LabView({
  scenario,
  lang,
  warning,
  choice,
  revealed,
  onGenerate,
  onChoose,
  onSkip,
  onCopy,
  copied,
}: {
  scenario: LabScenario | null;
  lang: 'es' | 'en';
  warning: boolean;
  choice: Action | null;
  revealed: boolean;
  onGenerate: () => void;
  onChoose: (a: Action) => void;
  onSkip: () => void;
  onCopy: () => void;
  copied: boolean;
}) {
  const t = copy[lang];
  const site = useT();
  const show = scenario !== null && revealed;
  const params = scenario ? FROZEN[scenario.riskClass] : null;
  const action = scenario && params ? decide(scenario.p, params) : null;
  const veto = scenario ? decideScenario({ p: scenario.p, riskClass: scenario.riskClass, irreversible: scenario.irreversible }).veto : false;
  const th = params ? thresholds(params) : null;
  const cuts = useMemo(() => (params ? regions(params, 500).flatMap((r) => [r.from, r.to]) : []), [params]);
  const u = scenario && params ? utilities(scenario.p, params) : null;
  return (
    <div className="lab-root">
      <a className="skip" href="#main">
        {site.skip}
      </a>
      <header className="site-header">
        <div className="hdr-inner">
          <a className="brand" href="../">
            Calibrated Agent
          </a>
          <a className="btn btn-sm" href="../#como-decide">
            {t.back}
          </a>
        </div>
      </header>
      <main id="main" className="lab-main">
        <p className="lab-band" role="note">
          {t.band}
        </p>
        <p>{t.how}</p>
        <form
          className="lab-gen"
          onSubmit={(e) => {
            e.preventDefault();
            onGenerate();
          }}
        >
          <button type="submit" className="btn btn-primary">
            {t.generate}
          </button>
        </form>
        {warning && (
          <p className="lab-warning" role="alert">
            {t.warning}
          </p>
        )}
        {scenario && (
          <div className="lab-grid">
            <section className="card lab-block" aria-labelledby="lab-a">
              <p className="kicker">
                <span className="tag tag-hypo">{t.hypo}</span>
              </p>
              <h1 id="lab-a">{t.situation}</h1>
              <p className="mono lab-id">
                {t.scenarioWord} #s={scenario.seed} · gen v{scenario.version}
              </p>
              <h2>{scenario.label[lang]}</h2>
              <p>{scenario.request[lang]}</p>
              <p>
                <span className="note">{t.knows}. </span>
                {scenario.knows[lang]}
              </p>
              <p>
                {t.risk}: {t.classes[scenario.riskClass]}. {t.reversible}: {scenario.irreversible ? t.no : t.yes}.
              </p>
              <p className="mono">{t.pName}: {fmt(scenario.p, 3, lang)}</p>
            </section>

            <section className="card lab-block" aria-labelledby="lab-b">
              <h2 id="lab-b">{t.askTitle}</h2>
              <div className="lab-choices" role="group" aria-label={t.askTitle}>
                {ACTS.map((a) => (
                  <button key={a} type="button" className="btn" aria-pressed={choice === a} onClick={() => onChoose(a)} disabled={choice !== null}>
                    <ActionChip action={a} />
                  </button>
                ))}
              </div>
              <button type="button" className="btn btn-sm" onClick={onSkip}>
                {t.skip}
              </button>
              {choice && show && action && <p>{choice === action ? t.coincides : t.differs}</p>}
            </section>

            {show && action && params && th && u && (
              <>
                <section className="card lab-block" aria-labelledby="lab-c">
                  <h2 id="lab-c">{t.decision}</h2>
                  <p className="lab-policy">
                    <span className="tag">{t.chip}</span> {t.policy}
                  </p>
                  <p>
                    <ActionChip action={action} />
                  </p>
                  {action === 'abstain' && <p>{t.abstainWhy}</p>}
                  <p>
                    <a href="../investigacion/#modelo">{t.reopt}</a>
                  </p>
                  {veto && <p className="lab-veto">{t.veto}</p>}
                </section>

                <section className="card lab-block" aria-labelledby="lab-d">
                  <h2 id="lab-d">{t.instruments}</h2>
                  <Gauge params={params} p={scenario.p} action={action} label={`${t.pName} ${fmt(scenario.p, 3, lang)}`} />
                  <p>{t.pName}</p>
                  <ul>
                    {isFrontier(th.pStar, cuts) && (
                      <li>
                        p* = {fmt(th.pStar, 3, lang)}. {t.actFrom}. {t.thisP} p = {fmt(scenario.p, 3, lang)}.
                      </li>
                    )}
                    {th.hasAbstainZone && isFrontier(th.pA, cuts) && <li>pₐ = {fmt(th.pA, 3, lang)}.</li>}
                  </ul>
                  <p className="note">
                    {t.fixed} b = {fmt(params.b, 0, lang)}, c = {fmt(params.c, 0, lang)}, k = {fmt(params.k, 1, lang)}, r = {fmt(params.r, 3, lang)}.
                  </p>
                </section>

                <section className="card lab-block" aria-labelledby="lab-f">
                  <p className="kicker">
                    <span className="tag tag-hypo">{t.hypo}</span>
                  </p>
                  <h2 id="lab-f">{t.utilities}</h2>
                  <p>{t.pName}</p>
                  <Utilities u={u} best={action} lang={lang} />
                </section>
              </>
            )}
          </div>
        )}
        <p className="note">{t.notYet}</p>
        <details className="lab-foot" open>
          <summary>{t.hidden}</summary>
          <ul>
            {t.magnitudes.map((m, i) => (
              <li key={m}>
                {m}
                {i === 6 ? (
                  <>
                    {' '}
                    <a href="../#evidencia">{t.evidenceLink}</a>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        </details>
        {scenario && show && action && params && (
          <section className="card lab-record" aria-labelledby="lab-reg">
            <h2 id="lab-reg">{t.record}</h2>
            <pre className="mono">{`s=${scenario.seed} v=${scenario.version} pol=manuscrito riesgo=${scenario.riskClass}
${t.policyName}
p=${fmt(scenario.p, 3, lang)} ${site.act[action]}
U(act)=${fmt(utilities(scenario.p, params).act, 3, lang)} U(ask)=${fmt(utilities(scenario.p, params).ask, 3, lang)} U(abstain)=0`}</pre>
            <button type="button" className="btn" onClick={onCopy}>
              {copied ? t.copied : t.copyLink}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

function LabPage() {
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);
  const [warning, setWarning] = useState(false);
  const [scenario, setScenario] = useState<LabScenario | null>(null);
  const [choice, setChoice] = useState<Action | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const parsed = parseLabSearch(window.location.search);
    setWarning(parsed.warning);
    setScenario(parsed.scenario);
    setRevealed(parsed.scenario !== null);
    if (parsed.lang === 'en') setLang('en');
    document.title = copy[parsed.lang === 'en' ? 'en' : lang].title;
  }, [setLang, lang]);

  function publish(next: LabScenario, nextLang: 'es' | 'en') {
    const href = labHref(next, nextLang);
    window.history.replaceState(null, '', href);
    setScenario(next);
    setWarning(false);
    setChoice(null);
    setRevealed(false);
    setCopied(false);
  }

  return (
    <LabView
      scenario={scenario}
      lang={lang}
      warning={warning}
      choice={choice}
      revealed={revealed}
      copied={copied}
      onGenerate={() => {
        const seed = Math.floor(Math.random() * 0x7fffffff);
        publish(generateScenario(seed), lang);
      }}
      onChoose={(a) => {
        setChoice(a);
        setRevealed(true);
      }}
      onSkip={() => setRevealed(true)}
      onCopy={() => {
        if (!scenario) return;
        const url = new URL(labHref(scenario, lang), window.location.href).toString();
        void navigator.clipboard?.writeText(url).then(() => setCopied(true));
      }}
    />
  );
}

export function LabRoot() {
  return <LabPage />;
}

if (typeof document !== 'undefined') {
  const el = document.getElementById('root');
  if (el) {
    createRoot(el).render(
      <StrictMode>
        <LabRoot />
      </StrictMode>,
    );
  }
}
