import { useMemo } from 'react';
import { regions, type Action, type Params, thresholds, fmt } from '../../domain/decisionModel';
import { useLang, useT } from '../../app/i18n';
import { actionColor, usePalette } from '../../app/theme';

interface Props {
  params: Params;
  baseline: Params;
  caseP: number;
  caseLabel: string;
  caseAction: Action;
}

const W = 1000;
const H = 310;
const X0 = 30;
const X1 = 970;
const BAND_Y = 96;
const BAND_H = 64;
const x = (p: number) => X0 + Math.min(1, Math.max(0, p)) * (X1 - X0);

const FILL: Record<Action, string> = { act: 'url(#pat-act)', ask: 'url(#pat-ask)', abstain: 'url(#pat-abs)' };

export function ThresholdChart({ params, baseline, caseP, caseLabel, caseAction }: Props) {
  const t = useT();
  const lang = useLang();
  const pal = usePalette();
  const COLOR: Record<Action, string> = { act: actionColor(pal, 'act'), ask: actionColor(pal, 'ask'), abstain: actionColor(pal, 'abstain') };
  const regs = useMemo(() => regions(params, 1000), [params]);
  const th = thresholds(params);
  const base = thresholds(baseline);
  const moved = Math.abs(th.pStar - base.pStar) > 5e-4;
  const visibleStar = th.pStar > 0 && th.pStar < 1;

  return (
    <figure className="th-figure">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="th-svg-title th-svg-desc" className="th-svg">
        <title id="th-svg-title">{t.thAxis}</title>
        <desc id="th-svg-desc">
          {regs.map((r) => `${t.act[r.action]}: ${fmt(r.from, 2, lang)}–${fmt(r.to, 2, lang)}`).join('; ')}
        </desc>
        <defs>
          <pattern id="pat-act" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill={COLOR.act} fillOpacity="0.32" />
          </pattern>
          <pattern id="pat-ask" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="10" height="10" fill={COLOR.ask} fillOpacity="0.2" />
            <line x1="0" y1="0" x2="0" y2="10" stroke={COLOR.ask} strokeOpacity="0.55" strokeWidth="3" />
          </pattern>
          <pattern id="pat-abs" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill={COLOR.abstain} fillOpacity="0.18" />
            <circle cx="5" cy="5" r="1.8" fill={COLOR.abstain} fillOpacity="0.75" />
          </pattern>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={pal.accent} />
          </marker>
        </defs>

        {/* regiones */}
        {regs.map((r) => (
          <g key={`${r.action}-${r.from}`}>
            <rect
              x={x(r.from)}
              y={BAND_Y}
              width={Math.max(0, x(r.to) - x(r.from))}
              height={BAND_H}
              fill={FILL[r.action]}
              stroke={COLOR[r.action]}
              strokeOpacity="0.5"
            />
            {x(r.to) - x(r.from) > 150 ? (
              <text x={(x(r.from) + x(r.to)) / 2} y={BAND_Y + BAND_H / 2 + 6} textAnchor="middle" className="th-zone-label" fill={COLOR[r.action]}>
                {t.act[r.action]}
              </text>
            ) : (
              x(r.to) - x(r.from) > 6 && (
                <text
                  x={r.to > 0.8 ? x(r.to) : r.from < 0.2 ? x(r.from) : (x(r.from) + x(r.to)) / 2}
                  y={BAND_Y + BAND_H + 66}
                  textAnchor={r.to > 0.8 ? 'end' : r.from < 0.2 ? 'start' : 'middle'}
                  className="th-zone-label th-zone-out"
                  fill={COLOR[r.action]}
                >
                  {t.act[r.action]}
                </text>
              )
            )}
          </g>
        ))}

        {/* eje */}
        <line x1={X0} x2={X1} y1={BAND_Y + BAND_H + 12} y2={BAND_Y + BAND_H + 12} stroke={pal.line} />
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={v}>
            <line x1={x(v)} x2={x(v)} y1={BAND_Y + BAND_H + 8} y2={BAND_Y + BAND_H + 16} stroke={pal.muted} />
            <text x={x(v)} y={BAND_Y + BAND_H + 42} textAnchor="middle" className="th-tick">
              {fmt(v, v % 1 === 0 ? 0 : 2, lang)}
            </text>
          </g>
        ))}

        {/* p₀ referencia */}
        {th.p0 > 0 && th.p0 < 1 && (
          <g>
            <line x1={x(th.p0)} x2={x(th.p0)} y1={BAND_Y - 4} y2={BAND_Y + BAND_H + 4} stroke={pal.ink2} strokeDasharray="4 4" strokeOpacity="0.7" />
            <text x={x(th.p0)} y={BAND_Y - 12} textAnchor="middle" className="th-p0">
              p₀ {fmt(th.p0, 3, lang)}
            </text>
          </g>
        )}

        {/* antes (congelado) */}
        {moved && base.pStar > 0 && base.pStar < 1 && (
          <g opacity="0.55">
            <line x1={x(base.pStar)} x2={x(base.pStar)} y1={BAND_Y - 14} y2={BAND_Y + BAND_H} stroke={pal.accent} strokeDasharray="3 3" />
          </g>
        )}
        {moved && base.pStar > 0 && base.pStar < 1 && visibleStar && (
          <line
            x1={x(base.pStar)}
            x2={x(th.pStar) + (th.pStar > base.pStar ? -6 : 6)}
            y1={BAND_Y - 22}
            y2={BAND_Y - 22}
            stroke={pal.accent}
            strokeWidth="1.5"
            markerEnd="url(#arrow)"
          />
        )}

        {/* p* */}
        {visibleStar && (
          <g>
            <line x1={x(th.pStar)} x2={x(th.pStar)} y1={BAND_Y - 34} y2={BAND_Y + BAND_H + 4} stroke={pal.accent} strokeWidth="2.5" />
            <circle cx={x(th.pStar)} cy={BAND_Y - 36} r="6" fill="none" stroke={pal.accent} strokeWidth="2" />
            <text x={Math.min(X1, x(th.pStar) + 40)} y={BAND_Y - 52} textAnchor="end" className="th-pstar">
              p* = {fmt(th.pStar, 3, lang)}
            </text>
          </g>
        )}

        {/* pₐ */}
        {th.hasAbstainZone && (
          <g>
            <line x1={x(th.pA)} x2={x(th.pA)} y1={BAND_Y - 14} y2={BAND_Y + BAND_H + 4} stroke={COLOR.abstain} strokeWidth="2" />
            <text x={x(th.pA)} y={BAND_Y - 46} textAnchor="middle" className="th-pa">
              pₐ = {fmt(th.pA, 3, lang)}
            </text>
          </g>
        )}

        {/* caso seleccionado */}
        <g>
          <circle cx={x(caseP)} cy={BAND_Y + BAND_H / 2} r="9" fill={pal.bg} stroke={COLOR[caseAction]} strokeWidth="3" />
          <circle cx={x(caseP)} cy={BAND_Y + BAND_H / 2} r="3.5" fill={pal.ink} />
        </g>
        <text x={x(caseP)} y={BAND_Y + BAND_H + 100} textAnchor={caseP > 0.8 ? 'end' : caseP < 0.2 ? 'start' : 'middle'} className="th-case">
          {caseLabel} · p = {fmt(caseP, 2, lang)}
        </text>
      </svg>
      <figcaption className="sr-only">{t.thAxis}</figcaption>
    </figure>
  );
}
