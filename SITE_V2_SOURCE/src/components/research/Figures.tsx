/**
 * Figuras de Investigación. Ninguna introduce datos nuevos:
 *  - DecisionMap y AuditBands se calculan con decisionModel y los parámetros congelados (DERIVADO);
 *  - SplitBar dibuja conteos que ya figuran en el texto (SIMULADO).
 */
import { useMemo } from 'react';
import { FROZEN, fmt, regions, thresholds, type Action, type RiskClass } from '../../domain/decisionModel';

type Lang = 'es' | 'en';
const CLASSES: RiskClass[] = ['bajo', 'medio', 'alto'];
const NAME: Record<RiskClass, [string, string]> = { bajo: ['Bajo', 'Low'], medio: ['Medio', 'Medium'], alto: ['Alto', 'High'] };
const ACT: Record<Action, [string, string]> = { act: ['Actuar', 'Act'], ask: ['Preguntar', 'Ask'], abstain: ['Abstenerse', 'Abstain'] };

/** Mapa de decisión: para cada clase, qué elige el argmax a lo largo de p ∈ [0, 1]. */
export function DecisionMap({ lang }: { lang: Lang }) {
  const L = (p: [string, string]) => (lang === 'es' ? p[0] : p[1]);
  const rows = useMemo(() => CLASSES.map((c) => ({ c, regs: regions(FROZEN[c], 1000), th: thresholds(FROZEN[c]) })), []);
  const X0 = 86;
  const X1 = 590;
  const x = (p: number) => X0 + p * (X1 - X0);
  const desc = rows
    .map((r) => `${L(NAME[r.c])}: ${r.regs.map((g) => `${L(ACT[g.action])} ${fmt(g.from, 3, lang)}–${fmt(g.to, 3, lang)}`).join(', ')}`)
    .join('. ');
  return (
    <figure className="rs-fig">
      <svg viewBox="0 0 620 196" role="img" aria-label={desc} className="rs-fig-svg">
        {rows.map((r, i) => {
          const yy = 22 + i * 46;
          return (
            <g key={r.c}>
              <text x={X0 - 12} y={yy + 17} textAnchor="end" className="fig-label">
                {L(NAME[r.c])}
              </text>
              {r.regs.map((g) => (
                <rect key={g.action} x={x(g.from)} y={yy} width={Math.max(0, x(g.to) - x(g.from) - 1.5)} height="24" rx="3" className={`fig-zone fig-${g.action}`} />
              ))}
              <line x1={x(r.th.pStar)} x2={x(r.th.pStar)} y1={yy - 5} y2={yy + 29} className="fig-star" />
              <text x={x(r.th.pStar)} y={yy - 8} textAnchor="middle" className="fig-num">
                p* {fmt(r.th.pStar, 3, lang)}
              </text>
              {r.th.hasAbstainZone && (
                <text x={x(r.th.pA)} y={yy - 8} textAnchor="middle" className="fig-num">
                  pₐ {fmt(r.th.pA, 3, lang)}
                </text>
              )}
            </g>
          );
        })}
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={v}>
            <line x1={x(v)} x2={x(v)} y1="150" y2="156" className="fig-axis" />
            <text x={x(v)} y="172" textAnchor="middle" className="fig-tick">
              {fmt(v, v % 1 === 0 ? 0 : 2, lang)}
            </text>
          </g>
        ))}
        <line x1={X0} x2={X1} y1="150" y2="150" className="fig-axis" />
        <text x={(X0 + X1) / 2} y="192" textAnchor="middle" className="fig-tick">
          p
        </text>
      </svg>
      <figcaption className="note">
        <span className="fig-key fig-abstain" /> {L(ACT.abstain)} <span className="fig-key fig-ask" /> {L(ACT.ask)} <span className="fig-key fig-act" /> {L(ACT.act)}
        {' · '}
        {lang === 'es'
          ? 'Decisión por argmax de utilidad esperada con los parámetros congelados. No es una medición.'
          : 'Decision by argmax of expected utility with the frozen parameters. Not a measurement.'}
      </figcaption>
    </figure>
  );
}

/** Barra apilada de conteos ya publicados en el texto. */
export function SplitBar({ parts, total, lang }: { parts: { action: Action; n: number }[]; total: number; lang: Lang }) {
  const label = parts.map((p) => `${lang === 'es' ? ACT[p.action][0] : ACT[p.action][1]}: ${p.n}`).join(', ');
  return (
    <div className="rs-split" role="img" aria-label={label}>
      {parts
        .filter((p) => p.n > 0)
        .map((p) => (
          <span key={p.action} className={`fig-${p.action}`} style={{ flexGrow: p.n / total }} />
        ))}
    </div>
  );
}

/** Franjas de auditoría: los dos puntos de la grilla de 0,05 que rodean p* en cada clase. */
export function AuditBands({ lang }: { lang: Lang }) {
  const L = (p: [string, string]) => (lang === 'es' ? p[0] : p[1]);
  const A = 0.8;
  const B = 1;
  const X0 = 86;
  const X1 = 590;
  const x = (p: number) => X0 + ((p - A) / (B - A)) * (X1 - X0);
  const rows = CLASSES.map((c) => {
    const ps = thresholds(FROZEN[c]).pStar;
    const lo = Math.floor(ps / 0.05 + 1e-9) * 0.05;
    return { c, ps, lo, hi: lo + 0.05 };
  });
  const grid = [0.8, 0.85, 0.9, 0.95, 1];
  const desc = rows.map((r) => `${L(NAME[r.c])}: p* ${fmt(r.ps, 3, lang)}, g⁻ ${fmt(r.lo, 2, lang)}, g⁺ ${fmt(r.hi, 2, lang)}`).join('. ');
  return (
    <figure className="rs-fig">
      <svg viewBox="0 0 620 176" role="img" aria-label={desc} className="rs-fig-svg">
        {rows.map((r, i) => {
          const yy = 30 + i * 40;
          return (
            <g key={r.c}>
              <text x={X0 - 12} y={yy + 5} textAnchor="end" className="fig-label">
                {L(NAME[r.c])}
              </text>
              <line x1={X0} x2={X1} y1={yy} y2={yy} className="fig-axis" />
              <rect x={x(r.lo)} y={yy - 9} width={x(r.hi) - x(r.lo)} height="18" rx="9" className="fig-band" />
              {grid.map((g) => (
                <circle key={g} cx={x(g)} cy={yy} r={Math.abs(g - r.lo) < 1e-6 || Math.abs(g - r.hi) < 1e-6 ? 5 : 2.5} className={Math.abs(g - r.lo) < 1e-6 || Math.abs(g - r.hi) < 1e-6 ? 'fig-g-on' : 'fig-g'} />
              ))}
              <line x1={x(r.ps)} x2={x(r.ps)} y1={yy - 14} y2={yy + 14} className="fig-star" />
              <text x={x(r.ps)} y={yy - 17} textAnchor="middle" className="fig-num">
                p* {fmt(r.ps, 3, lang)}
              </text>
            </g>
          );
        })}
        {grid.map((g) => (
          <text key={g} x={x(g)} y="160" textAnchor="middle" className="fig-tick">
            {fmt(g, 2, lang)}
          </text>
        ))}
      </svg>
      <figcaption className="note">
        {lang === 'es'
          ? 'Puntos grandes: g⁻ y g⁺, los dos valores de la grilla de 0,05 que rodean p*. La auditoría compara cuántas declaraciones caen en cada uno.'
          : 'Large dots: g⁻ and g⁺, the two 0.05 grid values around p*. The audit compares how many declarations fall on each.'}
      </figcaption>
    </figure>
  );
}
