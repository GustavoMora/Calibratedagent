import { useMemo } from 'react';
import { regions, thresholds, type Action, type Params } from '../../domain/decisionModel';

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
}

/**
 * Instrumento: semicírculo de 0 a 1 con las zonas de decisión del modelo (argmax) y una aguja en p.
 * Los colores salen de los tokens CSS; la forma de cada zona, de decisionModel.regions().
 */
export function Gauge({ params, p, action, label }: Props) {
  const regs = useMemo(() => regions(params, 500), [params]);
  const th = thresholds(params);
  const star = th.pStar > 0 && th.pStar < 1 ? th.pStar : null;
  const [sx0, sy0] = star !== null ? pt(star, R + 9) : [0, 0];
  const [sx1, sy1] = star !== null ? pt(star, R + 17) : [0, 0];
  return (
    <svg className="gauge" viewBox="0 0 200 112" role="img" aria-label={label}>
      {regs.map((r) => (
        <path key={`${r.action}-${r.from}`} d={arc(r.from, r.to)} className={`gauge-zone gauge-${r.action}`} />
      ))}
      {star !== null && <line x1={sx0} y1={sy0} x2={sx1} y2={sy1} className="gauge-star" />}
      <g className="gauge-needle" style={{ transform: `rotate(${((Math.min(1, Math.max(0, p)) - 0.5) * 180).toFixed(2)}deg)` }}>
        <line x1={CX} y1={CY} x2={CX} y2={CY - R + 16} />
        <circle cx={CX} cy={CY - R + 16} r="3.4" className={`gauge-tip gauge-tip-${action}`} />
      </g>
      <circle cx={CX} cy={CY} r="4.5" className="gauge-hub" />
    </svg>
  );
}
