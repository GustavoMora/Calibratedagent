import { useEffect, useRef } from 'react';
import { useT } from '../../app/i18n';
import './sections.css';

/**
 * Motivo de marca: partículas dispersas que se ensamblan en una esfera rodeada por el anillo dorado.
 * Se reproduce UNA vez (~2,4 s) y queda estática. Con prefers-reduced-motion se dibuja el estado final.
 */
function useAssembly(ref: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    const N = window.innerWidth < 640 ? 650 : 1300;
    // semilla fija: el motivo es siempre el mismo
    let seed = 20261025;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const pts = Array.from({ length: N }, (_, i) => {
      // destino: esfera de Fibonacci
      const y = 1 - (i / (N - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const th = i * 2.399963;
      return {
        tx: Math.cos(th) * rad,
        ty: y,
        tz: Math.sin(th) * rad,
        sx: (rnd() - 0.5) * 3.2,
        sy: (rnd() - 0.5) * 2.2,
        d: rnd() * 0.35,
        s: 0.6 + rnd() * 1.1,
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

    const ease = (x: number) => 1 - Math.pow(1 - x, 3);
    const DURATION = 2400;
    let start = 0;
    let raf = 0;

    const draw = (k: number) => {
      ctx.clearRect(0, 0, w, h);
      const cx = w * 0.5;
      const cy = h * 0.5;
      const R = Math.min(w, h) * 0.3;
      const rot = 0.6 + k * 0.5;
      for (const p of pts) {
        const local = Math.min(1, Math.max(0, (k - p.d) / (1 - p.d)));
        const e = ease(local);
        const x3 = p.tx * Math.cos(rot) - p.tz * Math.sin(rot);
        const z3 = p.tx * Math.sin(rot) + p.tz * Math.cos(rot);
        const x = (p.sx * (1 - e) + x3 * e) * R + cx;
        const y = (p.sy * (1 - e) + p.ty * e) * R + cy;
        const depth = (z3 + 1) / 2;
        const a = 0.15 + 0.6 * depth * e + 0.2 * (1 - e);
        ctx.fillStyle = `rgba(236,230,216,${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, p.s * (0.6 + depth * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }
      // anillo dorado que se cierra
      const ringK = ease(Math.min(1, Math.max(0, (k - 0.35) / 0.65)));
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, 0.32);
      ctx.strokeStyle = 'rgba(212,175,99,0.9)';
      ctx.lineWidth = 1.6;
      ctx.shadowColor = 'rgba(240,212,143,0.6)';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, R * 1.55, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ringK);
      ctx.stroke();
      ctx.restore();
      if (ringK > 0.98) {
        // el pedido: un punto sobre la órbita
        const ang = -0.5;
        ctx.fillStyle = '#F0D48F';
        ctx.shadowColor = 'rgba(240,212,143,0.9)';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang) * R * 1.55, cy + Math.sin(ang) * R * 1.55 * 0.32, 3.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const loop = (t: number) => {
      if (!start) start = t;
      const k = Math.min(1, (t - start) / DURATION);
      draw(k);
      if (k < 1) raf = requestAnimationFrame(loop);
    };
    if (reduce) draw(1);
    else raf = requestAnimationFrame(loop);

    const onResize = () => {
      resize();
      draw(1);
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [ref]);
}

export function Hero() {
  const t = useT();
  const ref = useRef<HTMLCanvasElement>(null);
  useAssembly(ref);
  return (
    <section id="inicio" className="hero">
      <canvas ref={ref} className="hero-canvas" aria-hidden="true" />
      <div className="wrap hero-inner">
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
      </div>
    </section>
  );
}
