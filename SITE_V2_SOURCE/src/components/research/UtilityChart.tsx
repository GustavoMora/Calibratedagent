import { useMemo, useState } from 'react';
import { FROZEN, fmt, regions, thresholds, uAct, uAsk, type Params, type RiskClass } from '../../domain/decisionModel';
import { useLang } from '../../app/i18n';

const W = 640;
const H = 340;
const PAD = { l: 48, r: 16, t: 16, b: 40 };

/** Tres rectas de utilidad esperada según p. Gana la más alta; sus cruces son los umbrales. HIPOTÉTICO. */
export function UtilityChart() {
  const lang = useLang();
  const [cls, setCls] = useState<RiskClass>('medio');
  const [P, setP] = useState<Params>({ ...FROZEN.medio });
  const th = thresholds(P);
  const regs = useMemo(() => regions(P, 600), [P]);

  const yMin = Math.min(-P.c, uAsk(0, P), -0.2) - 0.1;
  const yMax = Math.max(P.b, 0.2) + 0.1;
  const x = (p: number) => PAD.l + p * (W - PAD.l - PAD.r);
  const y = (u: number) => PAD.t + ((yMax - u) / (yMax - yMin)) * (H - PAD.t - PAD.b);
  const line = (f: (p: number) => number) => `M${x(0)},${y(f(0))} L${x(1)},${y(f(1))}`;

  const pick = (c: RiskClass) => {
    setCls(c);
    setP({ ...FROZEN[c] });
  };
  const L = (es: string, en: string) => (lang === 'es' ? es : en);

  const slider = (key: keyof Params, label: string, min: number, max: number, step: number) => (
    <label className="uc-slider">
      <span>
        {label} <output className="mono">{fmt(P[key], step < 0.01 ? 3 : 2, lang)}</output>
      </span>
      <input type="range" min={min} max={max} step={step} value={P[key]} onChange={(e) => setP({ ...P, [key]: Number(e.target.value) })} />
    </label>
  );

  return (
    <div className="uc card">
      <div className="uc-head">
        <div role="group" aria-label={L('Clase de riesgo', 'Risk class')} className="case-pick">
          {(['bajo', 'medio', 'alto'] as const).map((c) => (
            <button key={c} type="button" className="btn btn-sm" aria-pressed={cls === c} onClick={() => pick(c)}>
              {L(`Riesgo ${c}`, { bajo: 'Low risk', medio: 'Medium risk', alto: 'High risk' }[c])}
            </button>
          ))}
        </div>
        <span className="tag tag-hypo">{L('HIPOTÉTICO', 'HYPOTHETICAL')}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="uc-svg" role="img" aria-label={L('Utilidad esperada de actuar, preguntar y abstenerse según p', 'Expected utility of acting, asking and abstaining as a function of p')}>
        {regs.map((r) => (
          <rect
            key={r.action + r.from}
            x={x(r.from)}
            y={PAD.t}
            width={x(r.to) - x(r.from)}
            height={H - PAD.t - PAD.b}
            fill={{ act: 'rgba(111,194,139,0.07)', ask: 'rgba(126,182,232,0.07)', abstain: 'rgba(232,138,122,0.07)' }[r.action]}
          />
        ))}
        <line x1={x(0)} x2={x(1)} y1={y(0)} y2={y(0)} stroke="#3A3E46" />
        {[0, 0.5, 1].map((v) => (
          <text key={v} x={x(v)} y={H - 14} textAnchor="middle" className="uc-tick">
            {fmt(v, v === 0.5 ? 1 : 0, lang)}
          </text>
        ))}
        <text x={x(0.5)} y={H - 1} textAnchor="middle" className="uc-tick">
          p
        </text>
        <path d={line((p) => uAct(p, P))} stroke="#6FC28B" strokeWidth="2.5" fill="none" />
        <path d={line((p) => uAsk(p, P))} stroke="#7EB6E8" strokeWidth="2.5" fill="none" strokeDasharray="7 4" />
        <path d={`M${x(0)},${y(0)} L${x(1)},${y(0)}`} stroke="#E88A7A" strokeWidth="2.5" fill="none" strokeDasharray="2 4" />
        {th.pStar > 0 && th.pStar < 1 && (
          <g>
            <line x1={x(th.pStar)} x2={x(th.pStar)} y1={PAD.t} y2={H - PAD.b} stroke="#F0D48F" strokeWidth="1.5" />
            <text x={x(th.pStar) - 4} y={PAD.t + 14} textAnchor="end" className="uc-lbl" fill="#F0D48F">
              p* {fmt(th.pStar, 3, lang)}
            </text>
          </g>
        )}
        {th.hasAbstainZone && (
          <g>
            <line x1={x(th.pA)} x2={x(th.pA)} y1={PAD.t} y2={H - PAD.b} stroke="#E88A7A" strokeWidth="1.5" />
            <text x={x(th.pA) + 4} y={PAD.t + 14} className="uc-lbl" fill="#E88A7A">
              pₐ {fmt(th.pA, 3, lang)}
            </text>
          </g>
        )}
        {th.p0 > 0 && th.p0 < 1 && (
          <text x={x(th.p0)} y={y(0) - 8} textAnchor="middle" className="uc-lbl" fill="#B9B3A6">
            p₀ {fmt(th.p0, 3, lang)}
          </text>
        )}
      </svg>
      <ul className="uc-legend">
        <li>
          <span className="sw" style={{ borderTop: '3px solid #6FC28B' }} /> U({L('actuar', 'act')}) = p·b − (1−p)·c
        </li>
        <li>
          <span className="sw" style={{ borderTop: '3px dashed #7EB6E8' }} /> U({L('preguntar', 'ask')}) = −k + r·b + (1−r)·U({L('actuar', 'act')})
        </li>
        <li>
          <span className="sw" style={{ borderTop: '3px dotted #E88A7A' }} /> U({L('abstenerse', 'abstain')}) = 0
        </li>
      </ul>
      <div className="uc-sliders">
        {slider('b', L('Beneficio de acertar (b)', 'Benefit of being right (b)'), 0.2, 3, 0.05)}
        {slider('c', L('Costo de errar (c)', 'Cost of being wrong (c)'), 0.2, 8, 0.1)}
        {slider('k', L('Costo de preguntar (k)', 'Cost of asking (k)'), 0, 1, 0.01)}
        {slider('r', L('Chance de que la pregunta aclare (r)', 'Chance the question clarifies (r)'), 0.05, 1, 0.001)}
      </div>
      <p className="note">
        {th.hasAbstainZone
          ? L(
              `Cruces: pₐ = ${fmt(th.pA, 3, lang)} (preguntar–abstenerse), p* = ${fmt(th.pStar, 3, lang)} (actuar–preguntar), p₀ = ${fmt(th.p0, 3, lang)} (actuar–abstenerse).`,
              `Crossings: pₐ = ${fmt(th.pA, 3, lang)} (ask–abstain), p* = ${fmt(th.pStar, 3, lang)} (act–ask), p₀ = ${fmt(th.p0, 3, lang)} (act–abstain).`,
            )
          : L(
              `pₐ = ${fmt(th.pA, 3, lang)} queda fuera de [0, 1]: abstenerse nunca gana. p* = ${fmt(th.pStar, 3, lang)}, p₀ = ${fmt(th.p0, 3, lang)}.`,
              `pₐ = ${fmt(th.pA, 3, lang)} falls outside [0, 1]: abstaining never wins. p* = ${fmt(th.pStar, 3, lang)}, p₀ = ${fmt(th.p0, 3, lang)}.`,
            )}{' '}
        {L(
          'Las zonas de color salen del argmax de utilidades, válido también fuera de los parámetros congelados.',
          'The coloured zones come from the utility argmax, valid also outside the frozen parameters.',
        )}
      </p>
      <button type="button" className="btn btn-sm" onClick={() => pick(cls)}>
        ↺ {L('Restaurar valores congelados', 'Restore frozen values')}
      </button>
    </div>
  );
}
