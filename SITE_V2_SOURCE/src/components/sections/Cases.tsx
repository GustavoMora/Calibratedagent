import { scenarios } from '../../data';
import { useLang, useT } from '../../app/i18n';
import { useReveal } from '../../app/useReveal';
import { useStore } from '../../store/navigation';
import { FROZEN, fmt } from '../../domain/decisionModel';
import { decideScenario } from '../../simulation/requestFlow';
import { ActionChip } from '../ui/ActionChip';
import { Gauge } from '../ui/Gauge';

export function Cases() {
  const t = useT();
  const lang = useLang();
  const caseId = useStore((s) => s.caseId);
  const setCase = useStore((s) => s.setCase);
  const [listRef, seen] = useReveal<HTMLOListElement>();
  const [outRef, outSeen] = useReveal<HTMLDivElement>();
  const quote = (text: string) => {
    const clean = text.replace(/[«»“”]/g, '');
    return lang === 'es' ? `«${clean}»` : `“${clean}”`;
  };

  return (
    <section id="casos" className="chapter">
      <div className="wrap">
        <header className="chapter-head">
          <span className="kicker">{t.casesKicker}</span>
          <h2>{t.casesTitle}</h2>
          <p className="lead">{t.casesLead}</p>
        </header>

        <ol className={`cases reveal ${seen ? 'is-in' : ''}`} ref={listRef}>
          {scenarios.map((s, i) => {
            const { action } = decideScenario(s);
            const selected = s.id === caseId;
            return (
              <li key={s.id} className={`case card ${selected ? 'is-selected' : ''}`} data-a={action} style={{ ['--i' as string]: i }}>
                <div className="case-top">
                  <span className="case-n" aria-hidden="true">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="case-risk">{t.thClass[s.riskClass]}</span>
                </div>
                <h3 className="case-title">{s.label[lang]}</h3>
                <p className="case-quote">{quote(s.request[lang])}</p>

                <div className="case-gauge">
                  {/* la aguja parte de 0 y viaja a p cuando la tarjeta entra en pantalla */}
                  <Gauge
                    params={FROZEN[s.riskClass]}
                    p={seen ? s.p : 0}
                    action={action}
                    label={t.railMeterAlt(s.label[lang], fmt(s.p, 2, lang), t.act[action] ?? action)}
                  />
                  <div className="case-verdict">
                    <span className="case-p mono">
                      <span className="note">p</span> {fmt(s.p, 2, lang)}
                    </span>
                    <ActionChip action={action} />
                    <span className="note case-hypo">{t.hypoP}</span>
                  </div>
                </div>

                <p className="case-why">
                  {s.why[lang]} {s.consequence[lang]}
                </p>

                <details className="case-more">
                  <summary>{t.caseMore}</summary>
                  <dl className="case-steps">
                    <div>
                      <dt>{t.caseFields.knows}</dt>
                      <dd>{s.knows[lang]}</dd>
                    </div>
                    <div>
                      <dt>{t.caseFields.risk}</dt>
                      <dd>{s.risk[lang]}</dd>
                    </div>
                    {s.irreversible && (
                      <div>
                        <dd className="case-veto">⚠ {t.veto}</dd>
                      </div>
                    )}
                    <div>
                      <dt>{t.caseFields.change}</dt>
                      <dd>{s.wouldChange[lang]}</dd>
                    </div>
                  </dl>
                </details>

                <button type="button" className="btn btn-sm case-use" aria-pressed={selected} onClick={() => setCase(s.id)}>
                  {selected ? `✓ ${t.caseInUse}` : t.caseUse}
                </button>
              </li>
            );
          })}
        </ol>
        <p className="note cases-note">
          <span className="tag tag-hypo">{t.hypothetical}</span> {t.hypoNote}
        </p>

        <div className={`outputs reveal ${outSeen ? 'is-in' : ''}`} ref={outRef}>
          <span className="kicker">{t.outKicker}</span>
          <h3 className="outputs-title">{t.outTitle}</h3>
          <p className="note outputs-lead">{t.outLead}</p>
          <ul className="outputs-list">
            {t.outputs.map(([key, name, desc, status], i) => (
              <li key={key} className={`output ${status ? 'is-paper' : ''}`} data-o={key} style={{ ['--i' as string]: i }}>
                <span className="output-dot" aria-hidden="true" />
                <strong>{name}</strong>
                <span className="output-desc">{desc}</span>
                {status && <span className="tag tag-pending">{status}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
