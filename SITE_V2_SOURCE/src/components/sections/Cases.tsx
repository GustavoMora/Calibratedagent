import { scenarios } from '../../data';
import { useLang, useT } from '../../app/i18n';
import { useStore } from '../../store/navigation';
import { fmt } from '../../domain/decisionModel';
import { decideScenario } from '../../simulation/requestFlow';
import { ActionChip } from '../ui/ActionChip';

export function Cases() {
  const t = useT();
  const lang = useLang();
  const caseId = useStore((s) => s.caseId);
  const setCase = useStore((s) => s.setCase);

  return (
    <section id="casos" className="chapter">
      <div className="wrap">
        <header className="chapter-head">
          <span className="kicker">{t.casesKicker}</span>
          <h2>{t.casesTitle}</h2>
          <p className="lead">{t.casesLead}</p>
        </header>

        <ol className="cases">
          {scenarios.map((s, i) => {
            const { action } = decideScenario(s);
            const selected = s.id === caseId;
            return (
              <li key={s.id} className={`case card ${selected ? 'is-selected' : ''}`} data-a={action}>
                <div className="case-top">
                  <span className="case-n" aria-hidden="true">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="case-risk">{t.thClass[s.riskClass]}</span>
                </div>
                <h3 className="case-title">{s.label[lang]}</h3>
                <dl className="case-steps">
                  <div>
                    <dt>{t.caseFields.request}</dt>
                    <dd className="case-quote">«{s.request[lang].replace(/[«»“”]/g, '')}»</dd>
                  </div>
                  <div>
                    <dt>{t.caseFields.knows}</dt>
                    <dd>{s.knows[lang]}</dd>
                  </div>
                  <div>
                    <dt>{t.caseFields.risk}</dt>
                    <dd>{s.risk[lang]}</dd>
                  </div>
                  <div className="case-decision">
                    <dt>{t.caseFields.decides}</dt>
                    <dd>
                      <ActionChip action={action} />
                      <span className="case-p mono">
                        p = {fmt(s.p, 2, lang)} <span className="note">· {t.hypoP}</span>
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>{t.caseFields.why}</dt>
                    <dd>
                      {s.why[lang]} {s.consequence[lang]}
                    </dd>
                  </div>
                  {s.irreversible && (
                    <div>
                      <dd className="case-veto">⚠ {t.veto}</dd>
                    </div>
                  )}
                  <div className="case-change">
                    <dt>{t.caseFields.change}</dt>
                    <dd>{s.wouldChange[lang]}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  className="btn btn-sm case-use"
                  aria-pressed={selected}
                  onClick={() => setCase(s.id)}
                >
                  {selected ? `✓ ${t.caseInUse}` : t.caseUse}
                </button>
              </li>
            );
          })}
        </ol>
        <p className="note cases-note">
          <span className="tag tag-hypo">{t.hypothetical}</span> {t.hypoNote}
        </p>
      </div>
    </section>
  );
}
