import { StrictMode, useEffect, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/global.css';
import '../components/sections/sections.css';
import '../components/research/research.css';
import { Header } from '../components/ui/Header';
import { DataErrors } from '../components/ui/DataErrors';
import { UtilityChart } from '../components/research/UtilityChart';
import { AuditBands, DecisionMap, SplitBar } from '../components/research/Figures';
import { PREPRINT_DATE, PREPRINT_PDF, PREPRINT_TITLE, PREPRINT_VERSION, SHOW_PREPRINT_PDF } from '../app/site';
import { useStore } from '../store/navigation';
import { useLang } from '../app/i18n';
import { FROZEN, fmt, pAbstain, pStar, pZero, type RiskClass } from '../domain/decisionModel';
import { Author } from '../components/sections/Evidence';

type Lang = 'es' | 'en';
const Tag = ({ k, children }: { k: 'hypo' | 'sim' | 'pilot' | 'pending' | 'int'; children: ReactNode }) => <span className={`tag tag-${k}`}>{children}</span>;

const TOC: [string, string, string][] = [
  ['resumen', 'Resumen', 'Summary'],
  ['modelo', 'El modelo', 'The model'],
  ['clases', 'Tres clases de riesgo', 'Three risk classes'],
  ['supuestos', 'Supuestos y alcance', 'Assumptions and scope'],
  ['calibracion', 'Calibración', 'Calibration'],
  ['inflacion', 'Inflación y auditoría', 'Inflation and audit'],
  ['simulaciones', 'Simulaciones', 'Simulations'],
  ['protocolos', 'Protocolos y preregistro', 'Protocols and preregistration'],
  ['hipotesis', 'Hipótesis', 'Hypotheses'],
  ['limites', 'Límites y pendientes', 'Limits and open issues'],
  ['fuentes', 'Fuentes y cita', 'Sources and citation'],
  ['glosario', 'Glosario', 'Glossary'],
];

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="rs-section" aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`}>
        <a href={`#${id}`} className="rs-anchor" aria-hidden="true" tabIndex={-1}>
          #
        </a>
        {title}
      </h2>
      {children}
    </section>
  );
}

function ClassesTable({ lang }: { lang: Lang }) {
  const L = (es: string, en: string) => (lang === 'es' ? es : en);
  const name: Record<RiskClass, string> = { bajo: L('Bajo', 'Low'), medio: L('Medio', 'Medium'), alto: L('Alto', 'High') };
  return (
    <div className="rs-table-wrap">
      <table className="rs-table">
        <caption className="note">
          {L('Parámetros congelados del preregistro: b = 1 y k = 0,2 en las tres clases.', 'Frozen preregistration parameters: b = 1 and k = 0.2 in all three classes.')} <Tag k="hypo">{L('HIPOTÉTICO', 'HYPOTHETICAL')}</Tag>
        </caption>
        <thead>
          <tr>
            <th scope="col">{L('Clase', 'Class')}</th>
            <th scope="col">c</th>
            <th scope="col">r</th>
            <th scope="col">p₀</th>
            <th scope="col">p*</th>
            <th scope="col">pₐ</th>
            <th scope="col">{L('Zona de abstención', 'Abstain zone')}</th>
          </tr>
        </thead>
        <tbody>
          {(['bajo', 'medio', 'alto'] as const).map((c) => {
            const P = FROZEN[c];
            const pa = pAbstain(P);
            return (
              <tr key={c}>
                <th scope="row">{name[c]}</th>
                <td className="mono">{fmt(P.c, 0, lang)}</td>
                <td className="mono">{fmt(P.r, 3, lang)}</td>
                <td className="mono">{fmt(pZero(P), 3, lang)}</td>
                <td className="mono">{fmt(pStar(P), 3, lang)}</td>
                <td className="mono">{fmt(pa, 3, lang)}</td>
                <td>{pa > 0 ? L('Sí, debajo de pₐ', 'Yes, below pₐ') : L('No (pₐ < 0)', 'No (pₐ < 0)')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Timeline({ lang }: { lang: Lang }) {
  const rows: [string, string, string][] = [
    ['Versión 1.0', 'Version 1.0', '01/11/2026 18:30'],
    ['Enmienda 1', 'Amendment 1', '01/11/2026 18:34'],
    ['Enmienda 2', 'Amendment 2', '01/11/2026 18:42'],
    ['Enmienda 3', 'Amendment 3', '01/11/2026 18:45'],
    ['Fe de erratas', 'Erratum', '01/11/2026 20:25'],
  ];
  return (
    <ol className="rs-timeline">
      {rows.map(([es, en, t]) => (
        <li key={es}>
          <span className="mono">{t} h</span> <strong>{lang === 'es' ? es : en}</strong>
        </li>
      ))}
    </ol>
  );
}

const BIB = `@article{pauker1980,
  author = {Pauker, S. G. and Kassirer, J. P.}, year = {1980},
  title = {The Threshold Approach to Clinical Decision Making},
  journal = {New England Journal of Medicine}, volume = {302}, number = {20}, pages = {1109--1117},
  doi = {10.1056/NEJM198005153022003}
}
@article{chow1970,
  author = {Chow, C. K.}, year = {1970},
  title = {On optimum recognition error and reject tradeoff},
  journal = {IEEE Transactions on Information Theory}, volume = {16}, number = {1}, pages = {41--46},
  doi = {10.1109/TIT.1970.1054406}
}
@inproceedings{dong2026,
  author = {Dong, Y. R. and Hu, T. and Hui, Z. and Zhang, C. and Vuli{\'c}, I. and Bobu, A. and Collier, N.},
  year = {2026},
  title = {Value of information: A framework for human--agent communication},
  booktitle = {Proceedings of ACL 2026 (Long Papers)},
  pages = {42879--42896},
  url = {https://doi.org/10.18653/v1/2026.acl-long.1987}
}
@misc{loven2026,
  author = {Lov{\\'e}n, L. and Do, N. and Mehmood, H. and Sah, D. K. and Tarkoma, S.}, year = {2026},
  title = {The Behavioral Credibility Trilemma: When Calibrated Autonomy Becomes Impossible},
  howpublished = {arXiv preprint arXiv:2605.25739}, doi = {10.48550/arXiv.2605.25739}
}
@misc{mora2026orquestacion,
  author = {Mora, Gustavo}, year = {2026},
  title = {Orquestaci{\\'o}n condicionada con decisi{\\'o}n calibrada: cu{\\'a}ndo actuar, preguntar, escalar, abstenerse o recordar},
  url = {https://gustavomora.github.io/Calibratedagent/},
  note = {Versi{\\'o}n 4.2 candidata editorial. Preprint no revisado por pares}
}`;

function CopyBib({ lang }: { lang: Lang }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-sm"
      onClick={() => {
        navigator.clipboard?.writeText(BIB).then(
          () => setOk(true),
          () => setOk(false),
        );
      }}
    >
      {ok ? (lang === 'es' ? '✓ Copiado' : '✓ Copied') : lang === 'es' ? 'Copiar BibTeX' : 'Copy BibTeX'}
    </button>
  );
}

function Research() {
  const lang = useLang();
  const L = (es: ReactNode, en: ReactNode) => (lang === 'es' ? es : en);
  const [active, setActive] = useState('resumen');

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === 'es' ? 'Investigación completa · Calibrated Agent' : 'Full research · Calibrated Agent';
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        lang === 'es'
          ? 'Modelo, supuestos, simulaciones, protocolos, hipótesis, límites y fuentes de «Orquestación condicionada con decisión calibrada». Preprint v4.2 candidata, sin revisión por pares; experimentos no ejecutados.'
          : 'Model, assumptions, simulations, protocols, hypotheses, limits and sources of “Orquestación condicionada con decisión calibrada”. Preprint v4.2 candidate, not peer reviewed; experiments not run.',
      );
  }, [lang]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );
    document.querySelectorAll('.rs-section').forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const SIM = <Tag k="sim">{L('SIMULADO', 'SIMULATED')}</Tag>;
  const HYP = <Tag k="hypo">{L('HIPOTÉTICO', 'HYPOTHETICAL')}</Tag>;
  const PEND = <Tag k="pending">{L('PENDIENTE', 'PENDING')}</Tag>;
  const INT = <Tag k="int">{L('DOCUMENTO INTERNO', 'INTERNAL DOCUMENT')}</Tag>;

  return (
    <>
      <Header page="investigacion" />
      <main id="main" className="rs">
        <DataErrors />
        <div className="wrap rs-hero">
          <a href="../" className="rs-back">
            ← {L('Volver a Explorar', 'Back to Explore')}
          </a>
          <span className="kicker">{L('Investigación completa', 'Full research')}</span>
          <h1>{L('Orquestación condicionada con decisión calibrada: método, supuestos y evidencia', 'Conditioned orchestration with calibrated decision: method, assumptions and evidence')}</h1>
          <p className="lead">
            {L(
              `Todo el detalle técnico en un solo lugar: ecuaciones, simulaciones, protocolos, límites y fuentes. Manuscrito v${PREPRINT_VERSION} candidata editorial (${PREPRINT_DATE}): no depositado, sin DOI y sin revisión por pares. No hay resultados empíricos confirmatorios.`,
              `All the technical detail in one place: equations, simulations, protocols, limits and sources. Manuscript v${PREPRINT_VERSION}, editorial candidate (${PREPRINT_DATE}): not deposited, no DOI, not peer reviewed. There are no confirmatory empirical results.`,
            )}
          </p>
          {SHOW_PREPRINT_PDF && (
            <p>
              <a className="btn btn-primary" href={`../${PREPRINT_PDF}`}>
                {L('Leer el manuscrito (PDF, 22 páginas, en revisión)', 'Read the manuscript (PDF, 22 pages, under review)')} <span aria-hidden="true">↓</span>
              </a>
            </p>
          )}
        </div>

        <div className="wrap rs-layout">
          <nav className="rs-toc" aria-label={L('Índice', 'Contents') as string}>
            <span className="kicker">{L('Índice', 'Contents')}</span>
            <ol>
              {TOC.map(([id, es, en]) => (
                <li key={id}>
                  <a href={`#${id}`} aria-current={active === id ? 'true' : undefined}>
                    {lang === 'es' ? es : en}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="rs-body">
            <Section id="resumen" title={L('Resumen', 'Summary') as string}>
              <p>
                {L(
                  'Un agente que recibe un pedido puede actuar, preguntar o abstenerse. Actuar siempre convierte malas interpretaciones en errores costosos; preguntar siempre interrumpe sin aportar. La propuesta compara las tres acciones por utilidad esperada, usando la confianza calibrada p de haber entendido el pedido, el costo de equivocarse y el costo y la capacidad de aclaración de una pregunta.',
                  'An agent receiving a request can act, ask or abstain. Always acting turns misreadings into costly errors; always asking interrupts without adding information. The proposal compares the three actions by expected utility, using the calibrated confidence p of having understood the request, the cost of being wrong and the cost and clarifying power of a question.',
                )}
              </p>
              <h3>{L('Qué aporta', 'What it contributes')}</h3>
              <p>
                {L(
                  'La regla de umbral es clásica (Pauker y Kassirer, 1980; Chow, 1970) y ya se aplica a agentes de lenguaje. No se reclama novedad matemática. El manuscrito propone tres elementos de integración y de diseño de evaluación:',
                  'The threshold rule is classical (Pauker and Kassirer, 1980; Chow, 1970) and is already applied to language agents. No mathematical novelty is claimed. The manuscript proposes three elements of integration and evaluation design:',
                )}
              </p>
              <ol className="rs-contrib">
                <li>
                  <strong>{L('Recordar como parte de la regla.', 'Reminding as part of the rule.')}</strong>{' '}
                  {L('Mostrarle al usuario un recurso propio se trata dentro de la misma decisión, con sus interacciones de utilidad declaradas.', 'Showing the user a resource of their own is handled inside the same decision, with its utility interactions stated.')}
                </li>
                <li>
                  <strong>{L('Separar discriminación de calibración.', 'Separating discrimination from calibration.')}</strong>{' '}
                  {L('Con presupuesto de interrupciones igualado, recalibrar no cambia ninguna decisión. Por eso la calibración se evalúa con umbrales derivados de costos y se mide como regret.', 'With a matched interruption budget, recalibrating changes no decision. So calibration is evaluated with cost-derived thresholds and measured as regret.')}
                </li>
                <li>
                  <strong>{L('Proteger la probabilidad que entra a la decisión.', 'Protecting the probability that enters the decision.')}</strong>{' '}
                  {L('Separación de roles y una auditoría de acumulación en el umbral, ante el riesgo de que un componente premiado por autonomía infle su confianza.', 'Role separation and an audit of accumulation at the threshold, against the risk that a component rewarded for autonomy inflates its confidence.')}
                </li>
              </ol>
              <p className="note">
                {L(
                  'Esta página desarrolla en detalle la regla actuar / preguntar / abstenerse. Escalar y recordar están formalizadas en el manuscrito (§3.5) y no se simulan aquí.',
                  'This page develops in detail the act / ask / abstain rule. Escalating and reminding are formalized in the manuscript (§3.5) and are not simulated here.',
                )}
              </p>
              <ul className="rs-status">
                <li>
                  <Tag k="int">{L('DERIVADO', 'DERIVED')}</Tag> {L('Modelo matemático y umbrales.', 'Mathematical model and thresholds.')}
                </li>
                <li>
                  {SIM} {L('Simulaciones ilustrativas con datos generados.', 'Illustrative simulations with generated data.')}
                </li>
                <li>
                  <Tag k="int">{L('FIJADO LOCALMENTE', 'FIXED LOCALLY')}</Tag> {L('Preregistro y plan de análisis, sin depósito público.', 'Preregistration and analysis plan, not publicly deposited.')}
                </li>
                <li>
                  <Tag k="pilot">{L('OBSERVADO EN PILOTO', 'OBSERVED IN PILOT')}</Tag> {L('25 decisiones registradas. 8 evaluables · 17 fuera del análisis principal. Exploratorio y autoevaluado.', '25 decisions recorded. 8 evaluable · 17 outside the main analysis. Exploratory and self-evaluated.')}
                </li>
                <li>
                  {PEND} {L('El diseño general y el protocolo operativo no se ejecutaron.', 'The general design and the operational protocol have not been run.')}
                </li>
              </ul>
            </Section>

            <Section id="modelo" title={L('El modelo', 'The model') as string}>
              <p>{L('Definiciones (manuscrito §3.2; en este sitio las calcula un único módulo, decisionModel.ts):', 'Definitions (manuscript §3.2; on this site a single module, decisionModel.ts, computes them):')}</p>
              <dl className="rs-defs">
                <dt>p</dt>
                <dd>{L('P(Y₁ = 1 | x): probabilidad de interpretar bien los atributos críticos del pedido con la información disponible. No es la probabilidad de que el entregable final salga bien (Y).', 'P(Y₁ = 1 | x): probability of correctly interpreting the request’s critical attributes with the available information. It is not the probability of the final deliverable going well (Y).')}</dd>
                <dt>b</dt>
                <dd>{L('beneficio si la ejecución es correcta', 'benefit if execution is correct')}</dd>
                <dt>c</dt>
                <dd>{L('pérdida si es errónea', 'loss if it is wrong')}</dd>
                <dt>k</dt>
                <dd>{L('costo de preguntar', 'cost of asking')}</dd>
                <dt>r</dt>
                <dd>{L('probabilidad de que la aclaración resuelva la ambigüedad', 'probability that clarification resolves the ambiguity')}</dd>
              </dl>
              <div className="rs-eq mono">
                <p>U({L('abstenerse', 'abstain')}) = 0</p>
                <p>U({L('actuar', 'act')}) = p·b − (1−p)·c</p>
                <p>U({L('preguntar', 'ask')}) = [p + (1−p)·r]·b − (1−p)·(1−r)·c − k</p>
                <p>p₀ = c / (b + c)</p>
                <p>p* = 1 − k / [r·(b + c)]</p>
                <p>pₐ = 1 − (b − k) / [(b + c)·(1 − r)]</p>
              </div>
              <p className="note">
                {L(
                  'pₐ es una derivación desde §3.4; no figura literal en la propuesta. La decisión en vivo usa el argmax de utilidades: la regla por umbrales coincide con él en las tres clases congeladas (0 desacuerdos en pasos de 0,0001), pero no en toda combinación de parámetros (nota metodológica interna, §6).',
                  'pₐ is derived from §3.4; it does not appear verbatim in the proposal. The live decision uses the utility argmax: the threshold rule matches it in the three frozen classes (0 disagreements in 0.0001 steps), but not for every parameter combination (NOTA_METODOLOGICA §6).',
                )}
              </p>
              <h3>{L('Probar las rectas', 'Try the lines')}</h3>
              <UtilityChart />
            </Section>

            <Section id="clases" title={L('Tres clases de riesgo', 'Three risk classes') as string}>
              <p>
                {L(
                  'Misma regla en las tres. Cambian el costo de errar c y la chance de que preguntar aclare r. En bajo y medio preguntar casi siempre aclara, así que pₐ < 0 y abstenerse nunca es óptimo. En alto, r = 0,646: debajo de pₐ = 0,548 conviene abstenerse.',
                  'Same rule in all three. What changes is the cost of being wrong c and the chance that asking clarifies r. At low and medium risk asking almost always clarifies, so pₐ < 0 and abstaining is never optimal. At high risk, r = 0.646: below pₐ = 0.548 abstaining pays off.',
                )}
              </p>
              <ClassesTable lang={lang} />
              <DecisionMap lang={lang} />
              <p className="note">
                {L(
                  'El banco cuenta 62/67, 60/67 y 62/96 aclaraciones; el preregistro congela el redondeo a tres decimales (0,925 / 0,896 / 0,646), no la fracción. El banco de alto incluye 30 pedidos irreducibles, sin acción correcta.',
                  'The bank counts 62/67, 60/67 and 62/96 clarifications; the preregistration freezes the three-decimal rounding (0.925 / 0.896 / 0.646), not the fraction. The high-risk bank includes 30 irreducible requests with no correct action.',
                )}{' '}
                {INT}
              </p>
            </Section>

            <Section id="supuestos" title={L('Supuestos y alcance', 'Assumptions and scope') as string}>
              <h3>{L('Comprensión no es ejecución', 'Understanding is not execution')}</h3>
              <p>
                {L(
                  'Las rectas usan p como si fuera la probabilidad de un buen resultado. Eso vale bajo la idealización e₁ = 1 (entender bien implica ejecutar bien) y e₀ = 0. En general, P(Y = 1 | x, actuar) = p·e₁ + (1 − p)·e₀: es un análisis de sensibilidad. Con e₁ − e₀ < 1 una pregunta rinde menos y p* baja: p* = 1 − k / [r(b + c)(e₁ − e₀)]. Los umbrales de la página usan la idealización.',
                  'The lines use p as if it were the probability of a good outcome. That holds under the idealization e₁ = 1 (understanding correctly implies executing correctly) and e₀ = 0. In general, P(Y = 1 | x, act) = p·e₁ + (1 − p)·e₀: a sensitivity analysis. With e₁ − e₀ < 1 a question is worth less and p* goes down: p* = 1 − k / [r(b + c)(e₁ − e₀)]. The page thresholds use the idealization.',
                )}
              </p>
              <h3>{L('Ventaja de preguntar ≠ valor de la información', 'Advantage of asking ≠ value of information')}</h3>
              <p>
                {L(
                  'La ventaja de preguntar que se ve entre las rectas, r(1 − p)(b + c), se mide contra actuar con la interpretación inicial. No es el valor de la información frente a la mejor política: debajo de p₀, donde abstenerse le gana a actuar, la ventaja real es menor. Ejemplo, riesgo alto con p = 0,40: 1,938 frente a 0,646.',
                  'The advantage of asking seen between the lines, r(1 − p)(b + c), is measured against acting on the initial interpretation. It is not the value of information against the best policy: below p₀, where abstaining beats acting, the real advantage is smaller. Example, high risk with p = 0.40: 1.938 versus 0.646.',
                )}
              </p>
              <h3>{L('Preguntar y re-optimizar', 'Ask, then re-optimize')}</h3>
              <p>
                {L(
                  'La zona de abstención depende de suponer que, si la pregunta no aclara, se actúa igual. Si tras una pregunta fallida se re-optimiza (actuar o abstenerse), con estos parámetros preguntar domina a abstenerse para toda p. Es otra política; su tratamiento queda para la revisión científica. No se cambió el modelo.',
                  'The abstain zone relies on assuming that, if the question does not clarify, the agent acts anyway. If after a failed question it re-optimizes (act or abstain), with these parameters asking dominates abstaining for every p. That is a different policy; its treatment is left to scientific review. The model was not changed.',
                )}{' '}
                {PEND}
              </p>
              <p className="note">
                {L('b, c, k, r y los umbrales pertenecen a esta parametrización: no son constantes universales ni garantías para cualquier agente.', 'b, c, k, r and the thresholds belong to this parametrization: they are not universal constants or guarantees for any agent.')}
              </p>
            </Section>

            <Section id="calibracion" title={L('Calibración', 'Calibration') as string}>
              <p>
                {L(
                  'El agente declara una confianza; un calibrador isotónico la corrige ordenándola para que no baje al crecer (cada paso fusiona dos bloques vecinos). El número que decide es el corregido. Se ajusta solo con la mitad de ajuste y se evalúa en la de prueba.',
                  'The agent declares a confidence; an isotonic calibrator corrects it by ordering it so it never decreases (each step merges two neighbouring blocks). The number that decides is the corrected one. It is fitted only on the fitting half and evaluated on the test half.',
                )}
              </p>
              <p>
                {L('ECE en 200 casos de prueba (semilla 20261102): 0,131 con la p cruda y 0,109 con el calibrador', 'ECE on 200 test cases (seed 20261102): 0.131 with raw p and 0.109 with the calibrator')} {SIM}
              </p>
              <p className="note">
                {L(
                  '400 casos simulados, semilla 20261102, verdad Bernoulli(p^1,8), p declarada = 0,35 + 0,65·√U. En la mitad de ajuste el mismo calibrador baja de 0,149 a 0,014: esa cifra in-sample no se usa. Calibrar no garantiza discriminación, ejecución correcta ni seguridad.',
                  '400 simulated cases, seed 20261102, truth Bernoulli(p^1.8), declared p = 0.35 + 0.65·√U. On the fitting half the same calibrator goes from 0.149 to 0.014: that in-sample figure is not used. Calibration does not guarantee discrimination, correct execution or safety.',
                )}
              </p>
            </Section>

            <Section id="inflacion" title={L('Inflación y auditoría', 'Inflation and audit') as string}>
              <p>
                {L(
                  'Si se premia al agente por no interrumpir, puede declarar justo un poco más que su umbral. La auditoría compara, contra un grupo de control sin incentivo, cuántas declaraciones caen en el punto de grilla justo abajo (g⁻) y justo arriba (g⁺) de p*. Un exceso arriba es compatible con inflación (mecanismo de Lovén et al., 2026).',
                  'If the agent is rewarded for not interrupting, it may declare just a bit more than its threshold. The audit compares, against a control group without incentive, how many declarations fall on the grid point just below (g⁻) and just above (g⁺) p*. An excess above is consistent with inflation (mechanism from Lovén et al., 2026).',
                )}
              </p>
              <p className="mono rs-inline">δ = √(λ_I·R*/w_C)</p>
              <p className="note">
                {L(
                  'Supone compuerta escalón, regla de Brier, R* homogéneo y conocido, régimen no saturado y λ_I·R*/w_C conocido. λ_I cumple el papel de w_A de Lovén et al. (2026), Teorema 29(ii).',
                  'Assumes a step gate, Brier rule, homogeneous and known R*, non-saturated regime and known λ_I·R*/w_C. λ_I plays the role of w_A in Lovén et al. (2026), Theorem 29(ii).',
                )}
              </p>
              <p>
                {L('Franjas con los r congelados: bajo {0,85; 0,90}, medio {0,90; 0,95}, alto {0,90; 0,95}. Ningún p* cae en un punto de la grilla de 0,05.', 'Bands with the frozen r: low {0.85; 0.90}, medium {0.90; 0.95}, high {0.90; 0.95}. No p* falls on a 0.05 grid point.')}
              </p>
              <AuditBands lang={lang} />
              <p>
                {L('Para detectar un paso de 0,50 a 0,65 arriba del umbral (unilateral, α = 0,05, potencia 0,8) hacen falta unos 131 casos por brazo dentro de la franja.', 'To detect a shift from 0.50 to 0.65 above the threshold (one-sided, α = 0.05, power 0.8) about 131 cases per arm inside the band are needed.')} {HYP}
              </p>
              <p className="note">
                {L(
                  'Ese 131 no es un N global ni la suma de brazos. Bajo escenarios supuestos (uniforme, o la forma del generador de la página) cada clase queda muy por debajo de 131 por brazo: «no detectado» no significaría «no existe». El N se fija por enmienda tras el piloto.',
                  'That 131 is not a global N nor the sum of arms. Under assumed scenarios (uniform, or the shape of the page generator) each class falls far below 131 per arm: “not detected” would not mean “does not exist”. N is set by amendment after the pilot.',
                )}
              </p>
            </Section>

            <Section id="simulaciones" title={L('Simulaciones', 'Simulations') as string}>
              <p>{L('Ninguna de estas cifras es una medición. Cada una indica de qué generador sale.', 'None of these figures is a measurement. Each states which generator it comes from.')}</p>
              <div className="rs-sims">
                <div className="card rs-sim">
                  {SIM}
                  <h3>{L('Qué decide la regla', 'What the rule decides')}</h3>
                  <p>{L('Riesgo medio: pregunta 4.378 de 5.000 (88 %), actúa 622 (12 %), se abstiene 0.', 'Medium risk: asks 4,378 of 5,000 (88%), acts 622 (12%), abstains 0.')}</p>
                  <SplitBar lang={lang} total={5000} parts={[{ action: 'ask', n: 4378 }, { action: 'act', n: 622 }, { action: 'abstain', n: 0 }]} />
                  <p className="note">
                    {L(
                      'Semilla 20261025, N = 5000, b = 1, c = 2, k = 0,2, r = 0,896, δ = 0, calibrador activo. p latente Beta(3; 1,3). No es «preguntar siempre»: eso sería 100 % e incluiría casos donde actuar conviene.',
                      'Seed 20261025, N = 5000, b = 1, c = 2, k = 0.2, r = 0.896, δ = 0, calibrator on. Latent p Beta(3, 1.3). It is not “always ask”: that would be 100% and include cases where acting pays off.',
                    )}
                  </p>
                </div>
                <div className="card rs-sim">
                  {SIM}
                  <h3>{L('Qué cuenta el 97 % de «aciertos» simulados', 'What the simulated 97% “hit rate” counts')}</h3>
                  <p>{L('Suma aciertos al actuar (haber entendido) o al preguntar (entender o que la pregunta aclare).', 'Adds successes when acting (understood) or asking (understood or the question clarified).')}</p>
                  <p className="note">{L('Abstenerse queda afuera. No es P(Y = 1), ni acierto de la acción, ni ejecución, ni seguridad.', 'Abstaining is excluded. It is not P(Y = 1), nor action correctness, execution or safety.')}</p>
                </div>
                <div className="card rs-sim">
                  {SIM}
                  <h3>{L('Pérdida de la regla ingenua', 'Loss of the naive rule')}</h3>
                  <p>
                    0,43 [0,27; 0,60] {L('de utilidad por pedido frente a «actuar si p > 0,5; si no, preguntar».', 'utility per request versus “act if p > 0.5, otherwise ask”.')}
                  </p>
                  <p className="note">{L('Otro cálculo: Beta(4, 2), n = 200, 2.000 réplicas bootstrap; usa la p latente, no la declarada ni el calibrador.', 'A different computation: Beta(4, 2), n = 200, 2,000 bootstrap replicates; uses latent p, not declared p or the calibrator.')}</p>
                </div>
                <div className="card rs-sim">
                  {SIM}
                  <h3>{L('Auditoría sin incentivo', 'Audit without incentive')}</h3>
                  <p>{L('Fisher exacto unilateral p = 0,571: sin exceso detectable arriba del umbral (incentivo 506/447, control 501/448).', 'One-sided Fisher exact p = 0.571: no detectable excess above the threshold (incentive 506/447, control 501/448).')}</p>
                  <p className="note">{L('δ = 0: no hay inflación programada. El control usa semilla + 2: son dos muestras independientes, no el diseño pareado.', 'δ = 0: no programmed inflation. The control uses seed + 2: two independent samples, not the paired design.')}</p>
                </div>
                <div className="card rs-sim">
                  <Tag k="hypo">{L('DATOS HIPOTÉTICOS', 'HYPOTHETICAL DATA')}</Tag>
                  <h3>{L('Ruteo de modelos', 'Model routing')}</h3>
                  <p>{L('Doce modelos inventados. Costo ruteado: 21,78 % del costo de mandar todo al modelo más capaz (lo ahorrado sería 78,22 %).', 'Twelve invented models. Routed cost: 21.78% of sending everything to the most capable model (savings would be 78.22%).')}</p>
                  <p className="note">{L('60 pedidos, semilla 20261103. Suma tarifas por millón de tokens, no tokens reales. Hipótesis H6.', '60 requests, seed 20261103. Adds per-million-token rates, not real tokens. Hypothesis H6.')}</p>
                </div>
                <div className="card rs-sim">
                  {SIM}
                  <h3>{L('Memoria en un día delegado', 'Memory in a delegated day')}</h3>
                  <p>{L('En la jornada simulada, un recuerdo ahorra 2 preguntas brutas y 1 neta. Pasar de abstenerse a preguntar no es una pregunta ahorrada.', 'In the simulated day, a memory saves 2 gross questions and 1 net. Going from abstain to ask is not a saved question.')}</p>
                  <p className="note">{L('m = 0,5 y el 10 % residual son supuestos. Semilla 20261102. Hipótesis H7.', 'm = 0.5 and the 10% residual are assumptions. Seed 20261102. Hypothesis H7.')}</p>
                </div>
              </div>
            </Section>

            <Section id="protocolos" title={L('Protocolos y preregistro', 'Protocols and preregistration') as string}>
              <div className="rs-table-wrap">
                <table className="rs-table">
                  <thead>
                    <tr>
                      <th scope="col">{L('Plan', 'Plan')}</th>
                      <th scope="col">{L('Objeto', 'Object')}</th>
                      <th scope="col">{L('Pregunta principal', 'Main question')}</th>
                      <th scope="col">{L('Escala', 'Scale')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">{L('Diseño general', 'General design')}</th>
                      <td>{L('Diseño general del paper', 'General design of the paper')}</td>
                      <td>{L('H1b: ¿la calibración reduce el regret con umbrales derivados de costos?', 'H1b: does calibration reduce regret with cost-derived thresholds?')}</td>
                      <td>{L('650–700 casos propuestos', '650–700 proposed cases')}</td>
                    </tr>
                    <tr>
                      <th scope="row">{L('Protocolo operativo', 'Operational protocol')}</th>
                      <td>{L('Protocolo operativo derivado', 'Derived operational protocol')}</td>
                      <td>{L('H1: ¿un incentivo de autonomía infla la confianza declarada?', 'H1: does an autonomy incentive inflate declared confidence?')}</td>
                      <td>{L('430 pedidos', '430 requests')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="note">{L('Ambos son planes. Ejecutar el protocolo operativo no valida por sí solo la pregunta de regret, y ninguno produjo resultados confirmatorios.', 'Both are plans. Running the operational protocol does not by itself validate the regret question, and neither has produced confirmatory results.')}</p>
              <h3>{L('Diseño del protocolo operativo', 'Operational protocol design')}</h3>
              <ul>
                <li>{L('430 pedidos con verdad conocida: 215 de ajuste del calibrador y 215 de prueba.', '430 requests with known ground truth: 215 for calibrator fitting and 215 for testing.')}</li>
                <li>{L('Dos brazos sobre los mismos pedidos: control e incentivo; solo cambia la instrucción.', 'Two arms over the same requests: control and incentive; only the instruction changes.')}</li>
                <li>{L('Un modelo, fijo y registrado antes del piloto.', 'One model, fixed and registered before the pilot.')}</li>
                <li>{L('Juez mecánico y dos jueces ciegos; se frena si κ < 0,6.', 'Mechanical judge and two blind judges; stops if κ < 0.6.')}</li>
              </ul>
              <h3>{L('Línea de tiempo', 'Timeline')}</h3>
              <Timeline lang={lang} />
              <p className="note">
                {L(
                  'Las horas de los encabezados se escribieron a mano y estaban mal (18:40, 18:35, 18:45, 18:50). La fe de erratas registra las reales; el texto firmado queda intacto.',
                  'The header times were handwritten and wrong (18:40, 18:35, 18:45, 18:50). The erratum records the real ones; the signed text stays intact.',
                )}{' '}
                {INT}
              </p>
            </Section>

            <Section id="hipotesis" title={L('Hipótesis', 'Hypotheses') as string}>
              <div className="rs-hyp">
                {[
                  [
                    'H1 · ' + L('Inflación', 'Inflation'),
                    L('Mantel-Haenszel unilateral sobre las tres clases, α = 0,05; se sostiene si p < 0,05 y la OR común > 1. Secundario: Fisher por clase con Holm.', 'One-sided Mantel-Haenszel over the three classes, α = 0.05; holds if p < 0.05 and the common OR > 1. Secondary: Fisher per class with Holm.'),
                  ],
                  [
                    'H2 · ' + L('Calibración', 'Calibration'),
                    L('ECE (10 bins) y Brier en la mitad de prueba, sin irreducibles (200 casos). IC bootstrap 95 % de la diferencia entero debajo de 0.', 'ECE (10 bins) and Brier on the test half, without irreducibles (200 cases). 95% bootstrap CI of the difference entirely below 0.'),
                  ],
                  [
                    'H3 · ' + L('La regla', 'The rule'),
                    L('Pérdida frente a «actuar si p > 0,5; si no, preguntar», IC bootstrap 95 %.', 'Loss against “act if p > 0.5, otherwise ask”, 95% bootstrap CI.'),
                  ],
                ].map(([h, d]) => (
                  <div className="card rs-h" key={h as string}>
                    {PEND}
                    <h3>{h}</h3>
                    <p>{d}</p>
                  </div>
                ))}
              </div>
              <p className="note">{L('H4–H7 (calibración por modelo, escalar a otro modelo, ruteo, memoria) son exploratorias, fuera del núcleo H1–H3.', 'H4–H7 (calibration by model, escalating to another model, routing, memory) are exploratory, outside the H1–H3 core.')}</p>
            </Section>

            <Section id="limites" title={L('Límites y pendientes', 'Limits and open issues') as string}>
              <h3>{L('Lo que esta pieza no demuestra', 'What this piece does not show')}</h3>
              <ul>
                <li>{L('El banco de pedidos es propio, no un estándar externo.', 'The request bank is our own, not an external standard.')}</li>
                <li>{L('El juez es un modelo, revisado por dos jueces ciegos.', 'The judge is a model, reviewed by two blind judges.')}</li>
                <li>{L('Los costos b, c y k son supuestos, no medidos.', 'The costs b, c and k are assumed, not measured.')}</li>
                <li>{L('La inflación del experimento viene de una instrucción, no de entrenamiento: un nulo no descarta inflación por entrenamiento.', 'The experiment’s inflation comes from an instruction, not training: a null does not rule out training-induced inflation.')}</li>
                <li>
                  {L('Piloto: 25 decisiones registradas de un sistema personal del autor. 8 evaluables · 17 fuera del análisis principal (7 éxitos entre las evaluables). Entre las exclusiones está un criterio que nunca se activó. Es autoevaluado y no independiente. Ilustra; no valida ni generaliza.', 'Pilot: 25 decisions recorded from the author’s personal system. 8 evaluable · 17 outside the main analysis (7 successes among the evaluable ones). The exclusions include a criterion that never activated. Self-evaluated and not independent. It illustrates; it does not validate or generalize.')} <Tag k="pilot">{L('OBSERVADO EN PILOTO', 'OBSERVED IN PILOT')}</Tag>
                </li>
              </ul>
              <h3>{L('Estado del manuscrito', 'Status of the manuscript')}</h3>
              <ul>
                <li>{L('La v4.2 es una candidata editorial: no es final ni está publicada.', 'v4.2 is an editorial candidate: neither final nor published.')}</li>
                <li>{L('Falta el cotejo matemático interno de esta versión exacta sobre dos puntos: la idealización que iguala entender con ejecutar bien, y la línea de base del valor de la aclaración.', 'An internal mathematical check of this exact version is still pending on two points: the idealization that equates understanding with executing well, and the baseline of the value of clarification.')}</li>
                <li>{L('El diseño general no tiene preregistro propio y no está íntegramente congelado. El protocolo operativo se firmó localmente; no hay registro público verificable de esa fecha.', 'The general design has no preregistration of its own and is not fully frozen. The operational protocol was signed locally; there is no verifiable public record of that date.')}</li>
                <li>{L('No se promete un depósito futuro de código ni de datos. El registro del piloto es personal y no se publica.', 'No future deposit of code or data is promised. The pilot log is personal and is not published.')}</li>
              </ul>
              <h3>{L('Pendientes estadísticos conocidos', 'Known statistical open issues')}</h3>
              <ul>
                <li>{L('Discrepancia documentada sobre los bins del ECE (ancho igual o frecuencia igual). Sin decidir.', 'Documented discrepancy about ECE bins (equal width or equal frequency). Undecided.')}</li>
                <li>{L('Fisher y Mantel-Haenszel agregados no modelan el pareo: los mismos pedidos pasan por los dos brazos.', 'Aggregate Fisher and Mantel-Haenszel do not model the pairing: the same requests go through both arms.')}</li>
                <li>{L('El tamaño efectivo cerca del umbral y parte de la potencia siguen pendientes.', 'The effective size near the threshold and part of the power analysis remain pending.')}</li>
                <li>{L('El calibrador isotónico puede generar empates; un resultado que exige transformaciones estrictamente crecientes no se extiende sin matices.', 'The isotonic calibrator can create ties; a result requiring strictly increasing transformations does not carry over without nuance.')}</li>
                <li>{L('Bootstrap por familia: 18 familias en los 400 más 6 nuevas en los irreducibles (24); con pocos conglomerados el intervalo es inestable.', 'Family bootstrap: 18 families in the 400 plus 6 new ones in the irreducibles (24); with few clusters the interval is unstable.')}</li>
              </ul>
              <p className="note">{L('Gauss (matemática y estadística) y Turing (bibliografía y edición) son agentes de IA del equipo del autor e hicieron revisiones internas. No son revisión por pares.', 'Gauss (mathematics and statistics) and Turing (bibliography and editing) are AI agents on the author’s team and did internal reviews. They are not peer review.')}</p>
            </Section>

            <Section id="fuentes" title={L('Fuentes y cita', 'Sources and citation') as string}>
              <ol className="rs-refs">
                <li>
                  Pauker, S. G., Kassirer, J. P. (1980). The Threshold Approach to Clinical Decision Making. <em>New England Journal of Medicine</em>, 302(20), 1109–1117.{' '}
                  <a href="https://doi.org/10.1056/NEJM198005153022003">doi:10.1056/NEJM198005153022003</a>
                </li>
                <li>
                  Chow, C. K. (1970). On optimum recognition error and reject tradeoff. <em>IEEE Transactions on Information Theory</em>, 16(1), 41–46.{' '}
                  <a href="https://doi.org/10.1109/TIT.1970.1054406">doi:10.1109/TIT.1970.1054406</a>
                </li>
                <li>
                  Lovén, L., Do, N., Mehmood, H., Sah, D. K., Tarkoma, S. (2026). The Behavioral Credibility Trilemma: When Calibrated Autonomy Becomes Impossible. arXiv:2605.25739.{' '}
                  <a href="https://doi.org/10.48550/arXiv.2605.25739">doi:10.48550/arXiv.2605.25739</a>
                </li>
                <li>
                  Dong, Y. R., Hu, T., Hui, Z., Zhang, C., Vulić, I., Bobu, A., y Collier, N. (2026). Value of information: A framework for human–agent communication. <em>Proceedings of ACL 2026 (Long Papers)</em>, 42879–42896.{' '}
                  <a href="https://doi.org/10.18653/v1/2026.acl-long.1987">https://doi.org/10.18653/v1/2026.acl-long.1987</a>
                </li>
                <li>
                  Mora, G. (2026). {L('Preregistro — Experimento 1, v1.0, enmiendas 1–3; plan de análisis; criterio de juicio.', 'Preregistration — Experiment 1, v1.0, amendments 1–3; analysis plan; judging criterion.')} {INT}
                </li>
              </ol>
              <h3>{L('Cómo citar esta pieza', 'How to cite this piece')}</h3>
              <p className="cite mono">
                Mora, G. (2026). {PREPRINT_TITLE} ({L('versión 4.2 candidata editorial', 'version 4.2, editorial candidate')}). {L('Preprint no revisado por pares.', 'Preprint, not peer reviewed.')} https://gustavomora.github.io/Calibratedagent/
              </p>
              <details className="rs-bib">
                <summary>BibTeX</summary>
                <pre>{BIB}</pre>
              </details>
              <CopyBib lang={lang} />
              <p className="paper-pending">
                <Tag k="pending">PREPRINT</Tag> {L('Manuscrito v4.2 candidata editorial. No está depositado, no tiene DOI y no fue revisado por pares.', 'Manuscript v4.2, editorial candidate. It is not deposited, has no DOI and has not been peer reviewed.')}
              </p>
            </Section>

            <Section id="glosario" title={L('Glosario', 'Glossary') as string}>
              <dl className="rs-defs">
                <dt>p*</dt>
                <dd>{L('Umbral para actuar sin preguntar.', 'Threshold to act without asking.')}</dd>
                <dt>pₐ</dt>
                <dd>{L('Umbral debajo del cual conviene abstenerse frente a preguntar.', 'Threshold below which abstaining beats asking.')}</dd>
                <dt>p₀</dt>
                <dd>{L('Umbral actuar vs abstenerse: el que habría si no se pudiera preguntar.', 'Act vs abstain threshold: the one there would be if asking were impossible.')}</dd>
                <dt>ECE</dt>
                <dd>{L('Error de calibración esperado: distancia promedio entre confianza y frecuencia de acierto.', 'Expected calibration error: average gap between confidence and hit frequency.')}</dd>
                <dt>{L('Irreducible', 'Irreducible')}</dt>
                <dd>{L('Pedido sin acción correcta; preguntar no lo resuelve.', 'Request with no correct action; asking does not resolve it.')}</dd>
                <dt>{L('Franja', 'Band')}</dt>
                <dd>{L('Los dos puntos de grilla de 0,05 que rodean p*: g⁻ y g⁺.', 'The two 0.05 grid points around p*: g⁻ and g⁺.')}</dd>
                <dt>{L('Sellos', 'Labels')}</dt>
                <dd>
                  {SIM} {HYP} <Tag k="pilot">{L('OBSERVADO EN PILOTO', 'OBSERVED IN PILOT')}</Tag> {PEND} {INT}
                </dd>
              </dl>
            </Section>
          </article>
        </div>
      </main>
      <Author page="investigacion" />
    </>
  );
}

function Root() {
  void useStore;
  return <Research />;
}

export { Root };

if (typeof document !== 'undefined') {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Root />
    </StrictMode>,
  );
}
