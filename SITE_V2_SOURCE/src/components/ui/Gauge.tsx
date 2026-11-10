import { useMemo } from 'react';
import { fmt, regions, thresholds, type Action, type Params } from '../../domain/decisionModel';

const CX = 100;
const CY = 100;
const R = 82;
const pt = (p: number, r = R): [number, number] => {
  const a = Math.PI + Math.min(1, Math.max(0, p)) * Math.PI;
  return [CX + Math.cos(a) * r, CY + Math.sin(a) * r];
};
const arc = (from: number, to: number) => {
  const [x0, y0] = pt(from);
  const [x1, y1] = pt(to);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};

interface Props {
  params: Params;
  p: number;
  action: Action;
  label: string;
  /** Marcas de p* y pₐ, con el mismo formato que el resto del sitio. */
  ticks?: boolean;
  lang?: 'es' | 'en';
}

/**
 * Instrumento: semicírculo de 0 a 1 con las zonas de decisión del modelo (argmax) y una aguja en p.
 * Los colores salen de los tokens CSS; la forma de cada zona, de decisionModel.regions().
 */
export function Gauge({ params, p, action, label, ticks = false, lang = 'es' }: Props) {
  const regs = useMemo(() => regions(params, 500), [params]);
  const th = thresholds(params);
  const star = th.pStar > 0 && th.pStar < 1 ? th.pStar : null;
  const marks = ticks
    ? [
        ...(th.hasAbstainZone ? [{ p: th.pA, text: `pₐ ${fmt(th.pA, 3, lang)}`, above: true }] : []),
        ...(star !== null ? [{ p: star, text: `p* ${fmt(star, 3, lang)}`, above: false }] : []),
      ]
    : [];
  const deg = ((Math.min(1, Math.max(0, p)) - 0.5) * 180).toFixed(2);
  return (
    <svg className="gauge" viewBox={ticks ? '0 -18 200 150' : '0 0 200 112'} width={ticks ? '100%' : undefined} height={ticks ? 'auto' : undefined} role="img" aria-label={label}>
      {regs.map((r) => (
        <path key={`${r.action}-${r.from}`} d={arc(r.from, r.to)} className={`gauge-zone gauge-${r.action}`} />
      ))}
      {marks.map((m) => {
        const [x0, y0] = pt(m.p, R - 2);
        const [x1, y1] = pt(m.p, R + 8);
        const [lx, ly] = pt(m.p, m.above ? R + 16 : R - 28);
        return (
          <g key={m.text}>
            <line x1={x0} y1={y0} x2={x1} y2={y1} className="gauge-star" />
            <text x={lx} y={m.above ? ly : ly + 4} textAnchor="middle" className="gauge-tick">
              {m.text}
            </text>
          </g>
        );
      })}
      {!ticks && star !== null && <line x1={pt(star, R + 9)[0]} y1={pt(star, R + 9)[1]} x2={pt(star, R + 17)[0]} y2={pt(star, R + 17)[1]} className="gauge-star" />}
      <g className="gauge-needle" style={ticks ? undefined : { transform: `rotate(${deg}deg)` }} transform={ticks ? `rotate(${deg} 100 100)` : undefined}>
        <line x1={CX} y1={CY} x2={CX} y2={CY - R + 16} />
        <circle cx={CX} cy={CY - R + 16} r="3.4" className={`gauge-tip gauge-tip-${action}`} />
      </g>
      <circle cx={CX} cy={CY} r="4.5" className="gauge-hub" />
    </svg>
  );
}
