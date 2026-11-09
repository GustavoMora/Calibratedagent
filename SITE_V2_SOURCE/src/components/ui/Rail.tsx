import { useMemo } from 'react';
import { useLang, useT } from '../../app/i18n';
import { SECTIONS, useActiveSection, type SectionId } from '../../app/useActiveSection';
import { scenarioById, scenarios } from '../../data';
import { FROZEN, fmt, regions, thresholds } from '../../domain/decisionModel';
import { decideScenario } from '../../simulation/requestFlow';
import { useStore } from '../../store/navigation';
import { ActionChip } from './ActionChip';
import './rail.css';

const H = 168;
const y = (p: number) => H - Math.min(1, Math.max(0, p)) * H;

/**
 * Riel de decisión: instrumento fijo a la derecha (escritorio) o barra inferior (móvil).
 * Muestra siempre el caso en uso sobre la escala 0–1 de su clase de riesgo, el selector de caso,
 * el capítulo actual y el tipo de evidencia de lo que se está leyendo.
 */
export function Rail() {
  const t = useT();
  const lang = useLang();
  const active = useActiveSection();
  const caseId = useStore((s) => s.caseId);
  const setCase = useStore((s) => s.setCase);
  const sc = scenarioById(caseId);
  const P = FROZEN[sc.riskClass];
  const regs = useMemo(() => regions(P, 400), [P]);
  const th = thresholds(P);
  const { action } = decideScenario(sc);
  const labels: Record<SectionId, string> = {
    inicio: t.nav.home,
    casos: t.nav.cases,
    'como-decide': t.nav.how,
    cerebro: t.nav.brain,
    evidencia: t.nav.evidence,
  };
  const seal = t.railSeal[active] ?? ['', ''];

  const picker = (
    <div className="rail-cases" role="group" aria-label={t.brainCase}>
      {scenarios.map((s, i) => (
        <button key={s.id} type="button" aria-pressed={s.id === caseId} aria-label={s.label[lang]} title={s.label[lang]} onClick={() => setCase(s.id)}>
          <span className="rail-letter" aria-hidden="true">
            {String.fromCharCode(65 + i)}
          </span>
          <span className="rail-x">{s.label[lang]}</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      <aside className="rail" aria-label={t.railTitle}>
        <p className="rail-title rail-x">{t.railTitle}</p>
        <div className="rail-meter">
          <svg viewBox={`-4 -8 40 ${H + 16}`} width="40" height={H + 16} role="img" aria-label={t.railMeterAlt(sc.label[lang], fmt(sc.p, 2, lang), t.act[action] ?? action)}>
            {regs.map((r) => (
              <rect key={`${r.action}-${r.from}`} x="10" width="8" y={y(r.to)} height={Math.max(0, y(r.from) - y(r.to))} className={`rail-zone rail-zone-${r.action}`} />
            ))}
            {th.pStar > 0 && th.pStar < 1 && <line x1="4" x2="24" y1={y(th.pStar)} y2={y(th.pStar)} className="rail-pstar" />}
            <circle cx="14" cy={y(sc.p)} r="6" className={`rail-dot rail-dot-${action}`} style={{ transition: 'cy 0.6s cubic-bezier(0.22,0.61,0.36,1)' }} />
            <text x="30" y={y(1) + 4} className="rail-tick">
              1
            </text>
            <text x="30" y={y(0) + 4} className="rail-tick">
              0
            </text>
          </svg>
          <div className="rail-read rail-x">
            <span className="mono rail-p">p {fmt(sc.p, 2, lang)}</span>
            <ActionChip action={action} />
            <span className="mono note">p* {fmt(th.pStar, 3, lang)}</span>
            <span className="note">{t.thClass[sc.riskClass]}</span>
          </div>
        </div>
        {picker}
        <nav className="rail-nav" aria-label={t.railChapters}>
          <ol>
            {SECTIONS.map((id) => (
              <li key={id}>
                <a href={`#${id}`} aria-current={active === id ? 'true' : undefined} aria-label={labels[id]} title={labels[id]}>
                  <span className="rail-pip" aria-hidden="true" />
                  <span className="rail-x">{labels[id]}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <p className="rail-seal rail-x">
          <span className="tag">{seal[0]}</span>
          <span className="note">{seal[1]}</span>
        </p>
      </aside>

      <div className={`dock ${active === 'inicio' ? 'is-hidden' : ''}`} role="region" aria-label={t.railTitle}>
        {picker}
        <span className="mono dock-p">p {fmt(sc.p, 2, lang)}</span>
        <ActionChip action={action} />
      </div>
    </>
  );
}
