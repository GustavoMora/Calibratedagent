/**
 * Modelo de decisión de Calibrated Agent. ÚNICA fuente de las fórmulas en el sitio v2.
 * © 2026 Gustavo Mora.
 *
 * Reproduce, sin cambios, el modelo publicado (NOTA_METODOLOGICA.md §6 y tests/test_math_review.py):
 *   U(abstenerse) = 0
 *   U(actuar)     = p·b − (1−p)·c
 *   U(preguntar)  = [p + (1−p)·r]·b − (1−p)·(1−r)·c − k   (= −k + r·b + (1−r)·U(actuar))
 *   p₀ = c/(b+c)        actuar vs abstenerse
 *   p* = 1 − k/[r(b+c)] actuar vs preguntar
 *   pₐ = 1 − (b−k)/[(b+c)(1−r)]  preguntar vs abstenerse
 *
 * p = P(Y₁ = 1 | x): probabilidad de interpretar bien el pedido. NO es la probabilidad de que el entregable
 * final salga bien (Y). La regla simple supone la idealización e₁ = 1, e₀ = 0 (ver generalExecution*).
 *
 * La decisión en vivo usa argmax de utilidades (`decide`), no los umbrales: la regla por umbrales solo es
 * equivalente cuando las regiones existen en el orden abstenerse < preguntar < actuar (NOTA §6).
 */

export type Action = 'act' | 'ask' | 'abstain';
export type RiskClass = 'bajo' | 'medio' | 'alto';

export interface Params {
  /** beneficio de acertar */
  b: number;
  /** costo de equivocarse al actuar */
  c: number;
  /** costo de preguntar (interrumpir) */
  k: number;
  /** probabilidad de que la pregunta aclare */
  r: number;
}

/** Parámetros congelados del preregistro. NO MODIFICAR. */
export const FROZEN: Readonly<Record<RiskClass, Readonly<Params>>> = Object.freeze({
  bajo: Object.freeze({ b: 1, c: 1, k: 0.2, r: 0.925 }),
  medio: Object.freeze({ b: 1, c: 2, k: 0.2, r: 0.896 }),
  alto: Object.freeze({ b: 1, c: 4, k: 0.2, r: 0.646 }),
});

export function uAct(p: number, { b, c }: Params): number {
  return p * b - (1 - p) * c;
}

export function uAsk(p: number, P: Params): number {
  return -P.k + P.r * P.b + (1 - P.r) * uAct(p, P);
}

export function uAbstain(): number {
  return 0;
}

export function utilities(p: number, P: Params): Record<Action, number> {
  return { act: uAct(p, P), ask: uAsk(p, P), abstain: uAbstain() };
}

/** p₀: umbral actuar vs abstenerse (lo que sería el umbral si no existiera la opción de preguntar). */
export function pZero({ b, c }: Params): number {
  return c / (b + c);
}

/** p*: umbral actuar vs preguntar. */
export function pStar({ b, c, k, r }: Params): number {
  return 1 - k / (r * (b + c));
}

/** pₐ: umbral preguntar vs abstenerse. Si < 0, abstenerse nunca gana en [0, 1]. */
export function pAbstain({ b, c, k, r }: Params): number {
  return 1 - (b - k) / ((b + c) * (1 - r));
}

export interface Thresholds {
  p0: number;
  pStar: number;
  pA: number;
  /** true si existe zona de abstención dentro de [0, 1] */
  hasAbstainZone: boolean;
}

export function thresholds(P: Params): Thresholds {
  const pA = pAbstain(P);
  return { p0: pZero(P), pStar: pStar(P), pA, hasAbstainZone: pA > 0 && pA < 1 };
}

const ORDER: Action[] = ['abstain', 'ask', 'act'];

/** Decisión por argmax de utilidad esperada. Empates: abstain > ask > act (§3.4: gana la opción más conservadora). */
export function decide(p: number, P: Params): Action {
  const u = utilities(p, P);
  let best: Action = 'abstain';
  for (const a of ORDER) if (u[a] > u[best] + 1e-12) best = a;
  return best;
}

export interface Region {
  action: Action;
  from: number;
  to: number;
}

/**
 * Regiones de decisión en [0, 1] calculadas por barrido del argmax (válido para cualquier combinación de
 * parámetros, también fuera del preregistro, donde las fórmulas de umbral pueden no aplicar).
 */
export function regions(P: Params, steps = 2000): Region[] {
  const out: Region[] = [];
  for (let i = 0; i <= steps; i++) {
    const p = i / steps;
    const a = decide(p, P);
    const last = out[out.length - 1];
    if (last && last.action === a) last.to = p;
    else out.push({ action: a, from: p, to: p });
  }
  // cerrar huecos de discretización: cada región empieza donde termina la anterior
  for (let i = 1; i < out.length; i++) {
    const prev = out[i - 1]!;
    const cur = out[i]!;
    const pair = [prev.action, cur.action].sort().join('|');
    const exact = pair === 'abstain|ask' ? pAbstain(P) : pair === 'act|ask' ? pStar(P) : pZero(P);
    const mid0 = (prev.to + cur.from) / 2;
    const mid = Math.abs(exact - mid0) <= 1 / steps ? exact : mid0;
    prev.to = mid;
    cur.from = mid;
  }
  return out;
}

// ───────────── Supuestos: comprensión ≠ ejecución (M1) ─────────────
/** P(Y = 1 | x, actuar) = p·e₁ + (1−p)·e₀. Análisis de sensibilidad; la regla del sitio usa e₁ = 1, e₀ = 0. */
export function successWhenActing(p: number, e1: number, e0: number): number {
  return p * e1 + (1 - p) * e0;
}

/** p* general con ejecución imperfecta. Se reduce a pStar con e₁ = 1, e₀ = 0. */
export function pStarGeneral(P: Params, e1: number, e0: number): number {
  return 1 - P.k / (P.r * (P.b + P.c) * (e1 - e0));
}

// ───────────── Valor de la información (M2) ─────────────
/** Ventaja de preguntar (sin k) medida contra ACTUAR con la interpretación inicial. */
export function askGainVsAct(p: number, { b, c, r }: Params): number {
  return r * (1 - p) * (b + c);
}

/** Valor de la información frente a la mejor acción sin preguntar {actuar, abstenerse}, re-optimizando. */
export function evsiPolicy(p: number, P: Params): number {
  const best0 = Math.max(uAct(p, P), 0);
  return P.r * P.b + (1 - P.r) * best0 - best0;
}

// ───────────── Formato ─────────────
export function fmt(x: number, digits = 3, lang: 'es' | 'en' = 'es'): string {
  const m = Math.round(Math.abs(x) * 10 ** digits + 1e-9) / 10 ** digits;
  const s = (x < 0 && m !== 0 ? '-' : '') + m.toFixed(digits);
  return lang === 'es' ? s.replace('.', ',').replace('-', '−') : s.replace('-', '−');
}
