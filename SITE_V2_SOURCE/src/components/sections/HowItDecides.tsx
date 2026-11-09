import { useEffect, useMemo, useState } from 'react';
import { useLang, useT } from '../../app/i18n';
import { scenarioById } from '../../data';
import { FROZEN, decide, fmt, thresholds, type Params } from '../../domain/decisionModel';
import { useStore } from '../../store/navigation';
import { ThresholdChart } from '../threshold/ThresholdChart';
import { ActionChip } from '../ui/ActionChip';
import '../threshold/threshold.css';

interface SliderProps {
  id: string;
  label: string;
  help: string;
  cause: string;
  value: number;
  min: number;
  max: number;
  step: number;
  frozen: number;
  onChange: (v: number) => void;
  lang: 'es' | 'en';
}

function Slider({ id, label, help, cause, value, min, max, step, frozen, onChange, lang }: SliderProps) {
  const changed = Math.abs(value - frozen) > 1e-9;
  return (
    <div className={`th-slider ${changed ? 'is-changed' : ''}`}>
      <div className="th-slider-head">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className="mono th-val">
          {fmt(value, step < 0.1 ? 2 : 1, lang)}
        </output>
      </div>
      <p className="note th-help" id={`${id}-help`}>
        {help} <span className="th-frozen">({lang === 'es' ? 'congelado' : 'frozen'}: {fmt(frozen, step < 0.1 ? 2 : 1, lang)})</span>
      </p>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-describedby={`${id}-help ${id}-cause`}
        aria-valuetext={fmt(value, 2, lang)}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="th-scale note" aria-hidden="true">
        <span>{fmt(min, step < 0.1 ? 2 : 1, lang)}</span>
        <span>{fmt(max, step < 0.1 ? 2 : 1, lang)}</span>
      </div>
      <p className="th-cause" id={`${id}-cause`}>
        <span aria-hidden="true">→ </span>
        {cause}
      </p>
    </div>
  );
}

export function HowItDecides() {
  const t = useT();
  const lang = useLang();
  const caseId = useStore((s) => s.caseId);
  const setCase = useStore((s) => s.setCase);
  const sc = scenarioById(caseId);
  const frozen = FROZEN[sc.riskClass];
  const [k, setK] = useState(frozen.k);
  const [c, setC] = useState(frozen.c);

  // al cambiar de caso, volver a los valores congelados de su clase
  useEffect(() => {
    setK(frozen.k);
    setC(frozen.c);
  }, [frozen]);

  const params: Params = useMemo(() => ({ b: frozen.b, r: frozen.r, k, c }), [frozen, k, c]);
  const th = thresholds(params);
  const base = thresholds(frozen);
  const action = decide(sc.p, params);
  const moved = Math.abs(th.pStar - base.pStar) > 5e-4;

  return (
    <section id="como-decide" className="chapter chapter-how">
      <div className="wrap">
        <header className="chapter-head">
          <span className="kicker">{t.howKicker}</span>
          <h2>{t.howTitle}</h2>
        </header>

        {/* navegación visible de capítulo: tres tarjetas, nada escondido */}
        <nav className="how-cards" aria-label={t.nav.how}>
          {(['idea', 'try', 'assume'] as const).map((key, i) => (
            <a key={key} className="how-card card" href={`#how-${key}`}>
              <span className="how-num mono">0{i + 1}</span>
              <span className="how-name">{t.howTabs[key]}</span>
              <span className="note">{t.howTabsSub[key]}</span>
            </a>
          ))}
        </nav>

        <div className="how-grid">
          <article id="how-idea" className="how-idea">
            <h3>{t.howTabs.idea}</h3>
            <p>{t.ideaP1}</p>
            <p>{t.ideaP2}</p>
            <p>{t.ideaP3}</p>
            <ul className="th-legend" aria-label="Leyenda">
              {(['act', 'ask', 'abstain'] as const).map((a) => (
                <li key={a} data-a={a}>
                  <span className="sw" aria-hidden="true" />
                  <strong>{t.legend[a][0]}</strong> <span className="note">{t.legend[a][1]}</span>
                </li>
              ))}
            </ul>
          </article>

          <article id="how-try" className="how-try card">
            <div className="th-head">
              <h3>
                {t.howTabs.try}
                <span className="tag tag-hypo th-tag">{t.hypothetical}</span>
              </h3>
              <div className="th-case-pick" role="group" aria-label={t.brainCase}>
                {(['redondear', 'compras', 'escritura'] as const).map((id) => {
                  const s = scenarioById(id);
                  return (
                    <button key={id} type="button" className="btn btn-sm" aria-pressed={id === caseId} onClick={() => setCase(id)}>
                      {s.label[lang]}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="th-for">
              {t.thTitleFor} <strong>{t.thClass[sc.riskClass]}</strong> · {t.thFixed(fmt(frozen.b, 0, lang), fmt(frozen.r, 3, lang))}
            </p>

            <ThresholdChart params={params} baseline={frozen} caseP={sc.p} caseLabel={sc.label[lang]} caseAction={action} />

            <div className="th-readout" aria-live="polite">
              <div className="th-ba">
                <div>
                  <span className="note">{t.thBefore}</span>
                  <span className="mono th-big th-dim">p* = {fmt(base.pStar, 3, lang)}</span>
                </div>
                <span className="th-ba-arrow" aria-hidden="true">
                  {moved ? (th.pStar > base.pStar ? '↗' : '↘') : '→'}
                </span>
                <div>
                  <span className="note">{t.thAfter}</span>
                  <span className="mono th-big">p* = {th.pStar > 0 && th.pStar < 1 ? fmt(th.pStar, 3, lang) : fmt(th.pStar, 2, lang)}</span>
                </div>
              </div>
              <p className="th-moved">
                {moved ? t.thMoved(fmt(base.pStar, 3, lang), fmt(th.pStar, 3, lang), th.pStar > base.pStar) : t.thNoMove}
              </p>
              <p className="th-case-says">
                {t.thCaseSays(sc.label[lang], fmt(sc.p, 2, lang), '')} <ActionChip action={action} />
              </p>
              {!th.hasAbstainZone && <p className="note">{t.thNoAbstain}</p>}
            </div>

            <div className="th-controls">
              <Slider
                id="sl-k"
                label={t.thK}
                help={t.thKHelp}
                cause={t.thKCause}
                value={k}
                min={0.02}
                max={0.6}
                step={0.01}
                frozen={frozen.k}
                onChange={setK}
                lang={lang}
              />
              <Slider
                id="sl-c"
                label={t.thC}
                help={t.thCHelp}
                cause={t.thCCause}
                value={c}
                min={0.5}
                max={8}
                step={0.1}
                frozen={frozen.c}
                onChange={setC}
                lang={lang}
              />
            </div>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => {
                setK(frozen.k);
                setC(frozen.c);
              }}
              disabled={k === frozen.k && c === frozen.c}
            >
              ↺ {t.thReset}
            </button>
          </article>

          <article id="how-assume" className="how-assume">
            <h3>{t.howTabs.assume}</h3>
            <ul>
              {t.assumeItems.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <a className="btn" href="./investigacion/#modelo">
              {t.assumeGo} →
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
