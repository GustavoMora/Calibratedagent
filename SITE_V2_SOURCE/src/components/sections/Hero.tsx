import { useEffect, useRef, useState } from 'react';
import { useLang, useT } from '../../app/i18n';
import { readPalette, rgb, type Palette } from '../../app/theme';
import { scenarioById, scenarios } from '../../data';
import { FROZEN, decide, fmt, thresholds, type Action, type RiskClass } from '../../domain/decisionModel';
import { decideScenario } from '../../simulation/requestFlow';
import { useStore } from '../../store/navigation';
import { ActionChip } from '../ui/ActionChip';
import './sections.css';

/**
 * Motivo de marca en dos actos, con las mismas partículas:
 *   1. se ensamblan en la esfera con su anillo (identidad v2);
 *   2. la esfera se abre en un instrumento: un arco de 0 a 1 donde cada partícula toma el color de la
 *      decisión que el modelo elige para esa p (argmax con los parámetros congelados de la clase).
 * La aguja marca la p ilustrativa del caso. Nada de esto es una medición: son los tres casos hipotéticos.
 * Con prefers-reduced-motion se dibuja directamente el instrumento, quieto.
 */
const T_ASSEMBLE = 2400;
const T_HOLD = 1300;
const T_MORPH = 1700;
const CYCLE_MS = 5200;

interface Target {
  riskClass: RiskClass;
  p: number;
}

const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const easeIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** p ∈ [0, 1] → ángulo sobre el semicírculo superior (izquierda = 0, derecha = 1). */
const angleOf = (p: number) => Math.PI + clamp01(p) * Math.PI;

function useInstrument(
  ref: React.RefObject<HTMLCanvasElement>,
  target: React.MutableRefObject<Target>,
  onGauge: () => void,
) {
  const theme = useStore((s) => s.theme);
  const paletteRef = useRef<Palette | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    paletteRef.current = readPalette();
  }, [theme]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    const N = window.innerWidth < 640 ? 700 : 1400;
    // semilla fija: el motivo es siempre el mismo
    let seed = 20261025;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const pts = Array.from({ length: N }, (_, i) => {
      // destino 1: esfera de Fibonacci
      const y = 1 - (i / (N - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const th = i * 2.399963;
      // destino 2: posición sobre el arco (p uniforme, espesor concentrado en el centro de la banda)
      const gp = (i * 0.6180339887) % 1;
      const band = (rnd() + rnd() + rnd()) / 3 - 0.5;
      return {
        tx: Math.cos(th) * rad,
        ty: y,
        tz: Math.sin(th) * rad,
        sx: (rnd() - 0.5) * 3.2,
        sy: (rnd() - 0.5) * 2.2,
        d: rnd() * 0.35,
        s: 0.6 + rnd() * 1.1,
        gp,
        band,
        md: rnd() * 0.4,
        ph: rnd() * Math.PI * 2,
        c: [245, 245, 245] as [number, number, number],
      };
    });

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let needle = angleOf(target.current.p);
    let gaugeAnnounced = false;
    let last = 0;
    let elapsed = reduce ? T_ASSEMBLE + T_HOLD + T_MORPH : 0;
    let raf = 0;
    let visible = true;

    const draw = (dt: number) => {
      const pal = paletteRef.current ?? readPalette();
      const ink = rgb(pal.ink);
      const zone: Record<Action, [number, number, number]> = { act: rgb(pal.act), ask: rgb(pal.ask), abstain: rgb(pal.abstain) };
      const tg = target.current;
      const P = FROZEN[tg.riskClass];

      const kS = clamp01(elapsed / T_ASSEMBLE);
      const m = easeIO(clamp01((elapsed - T_ASSEMBLE - T_HOLD) / T_MORPH));
      if (m > 0.02 && !gaugeAnnounced) {
        gaugeAnnounced = true;
        onGauge();
      }

      ctx.clearRect(0, 0, w, h);
      const cx = w * 0.5;
      const cyS = h * 0.46;
      const R = Math.min(w, h) * 0.3;
      const Rg = Math.min(w * 0.42, h * 0.46);
      const cyG = h * 0.6;
      const thick = Rg * 0.34;
      const rot = 0.6 + kS * 0.5 + Math.max(0, elapsed - T_ASSEMBLE) * 0.00012;
      const mix = Math.min(1, dt * 5);

      for (const p of pts) {
        const local = clamp01((kS - p.d) / (1 - p.d));
        const e = ease(local);
        const x3 = p.tx * Math.cos(rot) - p.tz * Math.sin(rot);
        const z3 = p.tx * Math.sin(rot) + p.tz * Math.cos(rot);
        const xs = (p.sx * (1 - e) + x3 * e) * R + cx;
        const ys = (p.sy * (1 - e) + p.ty * e) * R + cyS;
        // instrumento
        const a = angleOf(p.gp);
        const breathe = m > 0.99 && !reduce ? Math.sin(elapsed * 0.0012 + p.ph) * 1.2 : 0;
        const rr = Rg + p.band * thick + breathe;
        const xg = cx + Math.cos(a) * rr;
        const yg = cyG + Math.sin(a) * rr;
        const lm = easeIO(clamp01((m - p.md * 0.5) / (1 - p.md * 0.5)));
        const x = xs + (xg - xs) * lm;
        const y = ys + (yg - ys) * lm;
        // color: tinta en la esfera; color de la decisión en el instrumento
        const want = lm > 0.35 ? zone[decide(p.gp, P)] : ink;
        p.c[0] += (want[0] - p.c[0]) * mix;
        p.c[1] += (want[1] - p.c[1]) * mix;
        p.c[2] += (want[2] - p.c[2]) * mix;
        const depth = (z3 + 1) / 2;
        const aS = 0.15 + 0.6 * depth * e + 0.2 * (1 - e);
        const aG = 0.5 + 0.45 * (1 - Math.abs(p.band) * 2);
        const alpha = aS + (aG - aS) * lm;
        ctx.fillStyle = `rgba(${p.c[0] | 0},${p.c[1] | 0},${p.c[2] | 0},${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, p.s * (0.6 + depth * 0.6) * (1 + lm * 0.25), 0, Math.PI * 2);
        ctx.fill();
      }

      // anillo de marca: se cierra con la esfera y se desvanece al abrirse el instrumento
      const ringK = ease(clamp01((kS - 0.35) / 0.65));
      const [ar, ag, ab] = rgb(pal.accent);
      if (m < 1) {
        ctx.save();
        ctx.translate(cx, cyS);
        ctx.scale(1, 0.32);
        ctx.strokeStyle = `rgba(${ar},${ag},${ab},${(0.9 * (1 - m)).toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, R * 1.55, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ringK);
        ctx.stroke();
        ctx.restore();
      }

      // aguja: gira hacia la p del caso
      const want = angleOf(tg.p);
      needle += (want - needle) * Math.min(1, dt * 3.2);
      const tipR = Rg - thick * 0.72;
      const tipX = cx + Math.cos(needle) * tipR;
      const tipY = cyG + Math.sin(needle) * tipR;
      if (m > 0) {
        ctx.strokeStyle = `rgba(${ar},${ag},${ab},${m.toFixed(3)})`;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx, cyG);
        ctx.lineTo(cx + Math.cos(needle) * tipR * m, cyG + Math.sin(needle) * tipR * m);
        ctx.stroke();
        ctx.fillStyle = `rgba(${ar},${ag},${ab},${m.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(cx, cyG, 4.5, 0, Math.PI * 2);
        ctx.fill();
        // p*: marca fina por fuera del arco, donde «actuar» empieza a convenir
        const th = thresholds(P);
        if (th.pStar > 0 && th.pStar < 1) {
          const as = angleOf(th.pStar);
          const r0 = Rg + thick * 0.62;
          const r1 = Rg + thick * 0.95;
          ctx.strokeStyle = `rgba(${ar},${ag},${ab},${(0.85 * m).toFixed(3)})`;
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(as) * r0, cyG + Math.sin(as) * r0);
          ctx.lineTo(cx + Math.cos(as) * r1, cyG + Math.sin(as) * r1);
          ctx.stroke();
          ctx.font = `500 12px ui-monospace, Menlo, monospace`;
          ctx.textAlign = 'center';
          ctx.fillStyle = `rgba(${ar},${ag},${ab},${(0.9 * m).toFixed(3)})`;
          ctx.fillText('p*', cx + Math.cos(as) * (r1 + 12), cyG + Math.sin(as) * (r1 + 12) + 4);
        }
        // extremos de la escala
        const [mr, mg, mb] = rgb(pal.muted);
        ctx.fillStyle = `rgba(${mr},${mg},${mb},${m.toFixed(3)})`;
        ctx.font = `12px ui-monospace, Menlo, monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('0', cx - Rg, cyG + 22);
        ctx.fillText('1', cx + Rg, cyG + 22);
      }

      // el pedido: el punto que orbitaba la esfera viaja a la punta de la aguja
      if (ringK > 0.98) {
        const ang = -0.5 + Math.max(0, elapsed - T_ASSEMBLE) * 0.0006 * (1 - m);
        const ox = cx + Math.cos(ang) * R * 1.55;
        const oy = cyS + Math.sin(ang) * R * 1.55 * 0.32;
        const px = ox + (tipX - ox) * m;
        const py = oy + (tipY - oy) * m;
        ctx.fillStyle = pal.accent;
        ctx.beginPath();
        ctx.arc(px, py, 3.6 + m * 1.2, 0, Math.PI * 2);
        ctx.fill();
        if (m > 0.5) {
          ctx.strokeStyle = pal.bg;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    };

    const loop = (t: number) => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
      last = t;
      elapsed += dt * 1000;
      draw(dt);
      if (visible) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      cancelAnimationFrame(raf);
      last = 0;
      if (reduce) draw(1);
      else raf = requestAnimationFrame(loop);
    };
    kick();

    // fuera de pantalla no se dibuja nada
    const io =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([e]) => {
            visible = !!e?.isIntersecting;
            if (visible) kick();
            else cancelAnimationFrame(raf);
          });
    io?.observe(canvas);

    const onResize = () => {
      resize();
      if (reduce || !visible) draw(1);
    };
    const onRedraw = () => {
      if (reduce) {
        needle = angleOf(target.current.p);
        paletteRef.current = readPalette();
        draw(1);
      }
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('ca-hero-redraw', onRedraw);
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('ca-hero-redraw', onRedraw);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}

export function Hero() {
  const t = useT();
  const lang = useLang();
  const theme = useStore((s) => s.theme);
  const caseId = useStore((s) => s.caseId);
  const setCase = useStore((s) => s.setCase);
  const ref = useRef<HTMLCanvasElement>(null);
  const [shown, setShown] = useState(caseId);
  const [gauge, setGauge] = useState(false);
  const [auto, setAuto] = useState(true);
  const sc = scenarioById(shown);
  const target = useRef<Target>({ riskClass: sc.riskClass, p: sc.p });
  target.current = { riskClass: sc.riskClass, p: sc.p };

  useInstrument(ref, target, () => setGauge(true));

  // si el lector elige un caso en otra parte de la página, el instrumento lo sigue
  const firstCase = useRef(caseId);
  useEffect(() => {
    setShown(caseId);
    // elegir un caso en cualquier selector de la página detiene el recorrido automático
    if (caseId !== firstCase.current) setAuto(false);
  }, [caseId]);

  // recorrido automático por los tres casos hasta que el lector elige uno
  useEffect(() => {
    if (!gauge || !auto) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      setShown((cur) => {
        const i = scenarios.findIndex((s) => s.id === cur);
        return scenarios[(i + 1) % scenarios.length]!.id;
      });
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [gauge, auto]);

  useEffect(() => {
    window.dispatchEvent(new Event('ca-hero-redraw'));
  }, [shown, theme]);

  const { action } = decideScenario(sc);
  const th = thresholds(FROZEN[sc.riskClass]);

  return (
    <section id="inicio" className="hero">
      <div className="wrap hero-inner">
        <div className="hero-copy">
          <span className="kicker">{t.heroKicker}</span>
          <h1 className="hero-title">{t.heroTitle}</h1>
          <p className="hero-line">{t.heroLine}</p>
          <div className="hero-ctas">
            <a className="btn btn-primary" href="#casos">
              {t.heroCta} <span aria-hidden="true">↓</span>
            </a>
            <a className="btn" href="#cerebro">
              {t.heroCta2}
            </a>
          </div>
          <p className="hero-status">{t.heroStatus}</p>
          <p className="hero-status">{t.heroPolicy}</p>
        </div>

        <div className={`hero-viz ${gauge ? 'is-gauge' : ''}`}>
          <canvas ref={ref} className="hero-canvas" aria-hidden="true" />
          <div className="hero-read" data-a={action}>
            <p className="hero-read-case">
              {sc.label[lang]} · {t.thClass[sc.riskClass]}
            </p>
            <p className="hero-read-p mono" aria-live="off">
              <span className="note">p</span> {fmt(sc.p, 2, lang)}
            </p>
            <ActionChip action={action} />
            <p className="hero-read-th note mono">
              p* {fmt(th.pStar, 3, lang)} <span className="tag tag-hypo">{t.hypothetical}</span>
            </p>
            <div className="hero-cases" role="group" aria-label={t.brainCase}>
              {scenarios.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className="hero-case"
                  aria-pressed={s.id === shown}
                  aria-label={s.label[lang]}
                  title={s.label[lang]}
                  onClick={() => {
                    setAuto(false);
                    setShown(s.id);
                    setCase(s.id);
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </button>
              ))}
            </div>
          </div>
          <p className="sr-only">{t.heroVizAlt(sc.label[lang], fmt(sc.p, 2, lang), t.act[action] ?? action, fmt(th.pStar, 3, lang))}</p>
        </div>
      </div>
    </section>
  );
}
