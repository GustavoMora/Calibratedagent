import { useT } from '../../app/i18n';

const TAG: Record<string, string> = { derived: 'tag-int', simulated: 'tag-sim', protocol: 'tag-int', pending: 'tag-pending' };
const ICON: Record<string, string> = { derived: '∑', simulated: '≈', protocol: '§', pending: '…' };

export function Evidence() {
  const t = useT();
  return (
    <section id="evidencia" className="chapter">
      <div className="wrap">
        <header className="chapter-head">
          <span className="kicker">{t.evKicker}</span>
          <h2>{t.evTitle}</h2>
          <p className="lead">{t.evLead}</p>
        </header>
        <ol className="ev-grid">
          {t.ev.map(([key, state, what, desc]) => (
            <li key={key} className={`ev card ev-${key}`}>
              <span className="ev-icon" aria-hidden="true">
                {ICON[key!]}
              </span>
              <span className={`tag ${TAG[key!]}`}>{state}</span>
              <h3>{what}</h3>
              <p>{desc}</p>
            </li>
          ))}
        </ol>
        <p className="pilot card">
          <span className="tag tag-pilot">{t.pilotTag}</span> <span>{t.pilot}</span>
        </p>
        <a className="btn" href="./investigacion/#limites">
          {t.evCta} →
        </a>
      </div>
    </section>
  );
}

export function Author() {
  const t = useT();
  return (
    <footer className="author" id="autor">
      <div className="wrap author-grid">
        <div>
          <span className="kicker">{t.authorKicker}</span>
          <h2 className="author-name">Gustavo Mora</h2>
          <p className="note">{t.authorRole}</p>
          <p>
            <a href="https://orcid.org/0009-0004-5276-3066" target="_blank" rel="noopener noreferrer">
              ORCID 0009-0004-5276-3066 ↗
            </a>
          </p>
          <p className="note">{t.authorTeam}</p>
        </div>
        <div>
          <h3 className="author-h">{t.cite}</h3>
          <p className="cite mono">{t.citeText}</p>
          <p className="paper-pending" aria-disabled="true">
            <span className="tag tag-pending">PREPRINT</span> {t.paper}
          </p>
          <a className="btn btn-primary" href="./investigacion/">
            {t.nav.research} →
          </a>
        </div>
      </div>
      <p className="wrap note foot">{t.footer}</p>
    </footer>
  );
}
