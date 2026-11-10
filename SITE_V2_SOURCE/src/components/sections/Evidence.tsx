import { useT } from '../../app/i18n';
import { PILOT_EVALUABLE, PILOT_TOTAL, PREPRINT_PDF, SHOW_PREPRINT_PDF } from '../../app/site';
import { useReveal } from '../../app/useReveal';

const TAG: Record<string, string> = { derived: 'tag-int', simulated: 'tag-sim', protocol: 'tag-int', pending: 'tag-pending' };
const ICON: Record<string, string> = { derived: '∑', simulated: '≈', protocol: '§', pending: '…' };

export function Evidence() {
  const t = useT();
  const [gridRef, seen] = useReveal<HTMLOListElement>();
  const [pilotRef, pilotSeen] = useReveal<HTMLDivElement>();
  return (
    <section id="evidencia" className="chapter">
      <div className="wrap">
        <header className="chapter-head">
          <span className="kicker">{t.evKicker}</span>
          <h2>{t.evTitle}</h2>
          <p className="lead">{t.evLead}</p>
        </header>
        <ol className={`ev-grid reveal ${seen ? 'is-in' : ''}`} ref={gridRef}>
          {t.ev.map(([key, state, what, desc], i) => (
            <li key={key} className={`ev card ev-${key}`} style={{ ['--i' as string]: i }}>
              <span className="ev-icon" aria-hidden="true">
                {ICON[key!]}
              </span>
              <span className={`tag ${TAG[key!]}`}>{state}</span>
              <h3>{what}</h3>
              <p>{desc}</p>
            </li>
          ))}
        </ol>
        <div className={`pilot card ${pilotSeen ? 'is-in' : ''}`} ref={pilotRef}>
          <div className="pilot-grid" role="img" aria-label={t.pilotGridAlt}>
            {Array.from({ length: PILOT_TOTAL }, (_, i) => (
              <span key={i} className={i < PILOT_EVALUABLE ? 'is-on' : ''} style={{ ['--i' as string]: i }} />
            ))}
          </div>
          <div className="pilot-text">
            <p className="pilot-num mono">
              {PILOT_EVALUABLE}
              <span className="note"> / {PILOT_TOTAL}</span>
            </p>
            <p className="note">{t.pilotLabel}</p>
            <p className="pilot-legend note" aria-hidden="true">
              <span className="pilot-key is-on" /> {t.pilotLegend[0]}
              <span className="pilot-key" /> {t.pilotLegend[1]}
            </p>
            <p>
              <span className="tag tag-pilot">{t.pilotTag}</span> {t.pilot}
            </p>
          </div>
        </div>
        <a className="btn" href="./investigacion/#limites">
          {t.evCta} →
        </a>
      </div>
    </section>
  );
}

export function Author({ page = 'explorar' }: { page?: 'explorar' | 'investigacion' }) {
  const t = useT();
  const base = page === 'explorar' ? './' : '../';
  return (
    <footer className="author" id="autor">
      <div className="wrap author-grid">
        <div>
          <span className="kicker">{t.authorKicker}</span>
          <h2 className="author-name">Gustavo Mora</h2>
          <p className="note">{t.authorBioTitle}</p>
          {t.authorBio.map((paragraph) => (
            <p className="note" key={paragraph}>
              {paragraph}
            </p>
          ))}
          <p className="note">{t.authorRole}</p>
          <p>
            <a href="https://orcid.org/0009-0004-5276-3066" target="_blank" rel="noopener noreferrer">
              ORCID 0009-0004-5276-3066 ↗
            </a>
          </p>
          <p>
            <a href="https://www.linkedin.com/in/gustavomora23/" target="_blank" rel="noopener noreferrer">
              {t.authorLinkedIn}
            </a>
          </p>
          <p className="note">{t.authorTeam}</p>
        </div>
        <div>
          <h3 className="author-h">{t.cite}</h3>
          <p className="cite mono">{t.citeText}</p>
          <p className="paper-pending">
            <span className="tag tag-pending">PREPRINT</span> {t.paper}
          </p>
          <div className="author-ctas">
            {SHOW_PREPRINT_PDF && (
              <a className="btn btn-primary" href={`${base}${PREPRINT_PDF}`}>
                {t.paperPdf} <span aria-hidden="true">↓</span>
              </a>
            )}
            {page === 'explorar' && (
              <a className="btn" href="./investigacion/">
                {t.nav.research} →
              </a>
            )}
          </div>
        </div>
      </div>
      <p className="wrap note foot">{t.footer}</p>
    </footer>
  );
}
