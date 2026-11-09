import { describe, expect, it } from 'vitest';
import {
  FROZEN,
  askGainVsAct,
  decide,
  evsiPolicy,
  pAbstain,
  pStar,
  pStarGeneral,
  pZero,
  regions,
  uAct,
  uAsk,
} from '../src/domain/decisionModel';

// Valores publicados (sitio v1, S9) y NOTA_METODOLOGICA.md §6.
const PUBLISHED = {
  bajo: { pStar: 0.892, pA: -4.333, p0: 0.5 },
  medio: { pStar: 0.926, pA: -1.564, p0: 0.667 },
  alto: { pStar: 0.938, pA: 0.548, p0: 0.8 },
} as const;

const GRID = Array.from({ length: 201 }, (_, i) => i / 200);

describe('umbrales congelados', () => {
  it('los parámetros congelados no cambiaron', () => {
    expect(FROZEN).toEqual({
      bajo: { b: 1, c: 1, k: 0.2, r: 0.925 },
      medio: { b: 1, c: 2, k: 0.2, r: 0.896 },
      alto: { b: 1, c: 4, k: 0.2, r: 0.646 },
    });
    expect(Object.isFrozen(FROZEN.medio)).toBe(true);
  });

  for (const cl of ['bajo', 'medio', 'alto'] as const) {
    it(`reproduce p*, pₐ y p₀ publicados (${cl})`, () => {
      const P = FROZEN[cl];
      expect(Number(pStar(P).toFixed(3))).toBe(PUBLISHED[cl].pStar);
      expect(Number(pAbstain(P).toFixed(3))).toBe(PUBLISHED[cl].pA);
      expect(Number(pZero(P).toFixed(3))).toBe(PUBLISHED[cl].p0);
    });
  }

  it('valores a precisión completa (NOTA §6)', () => {
    expect(pStar(FROZEN.bajo)).toBeCloseTo(0.8918918918918919, 14);
    expect(pStar(FROZEN.medio)).toBeCloseTo(0.9255952380952381, 14);
    expect(pStar(FROZEN.alto)).toBeCloseTo(0.9380804953560371, 14);
    expect(pAbstain(FROZEN.alto)).toBeCloseTo(0.5480225988700564, 14);
  });

  it('los umbrales son cruces de utilidad', () => {
    for (const P of Object.values(FROZEN)) {
      expect(uAct(pStar(P), P)).toBeCloseTo(uAsk(pStar(P), P), 12);
      const pa = pAbstain(P);
      if (pa >= 0 && pa <= 1) expect(uAsk(pa, P)).toBeCloseTo(0, 12);
    }
  });

  it('argmax coincide con la regla por umbrales en las tres clases', () => {
    for (const P of Object.values(FROZEN)) {
      const ps = pStar(P);
      const pa = pAbstain(P);
      for (const p of GRID) {
        if (Math.min(Math.abs(p - ps), Math.abs(p - pa)) < 1e-9) continue;
        const expected = p > ps ? 'act' : p > pa ? 'ask' : 'abstain';
        expect(decide(p, P)).toBe(expected);
      }
    }
  });

  it('regiones: bajo/medio sin abstención, alto con tres zonas', () => {
    expect(regions(FROZEN.medio).map((r) => r.action)).toEqual(['ask', 'act']);
    expect(regions(FROZEN.alto).map((r) => r.action)).toEqual(['abstain', 'ask', 'act']);
    const alto = regions(FROZEN.alto);
    expect(alto[0]!.to).toBeCloseTo(0.548, 2);
    expect(alto[1]!.to).toBeCloseTo(0.938, 2);
  });

  it('fuera del preregistro decide() sigue siendo correcto (contraejemplo NOTA §6)', () => {
    const P = { b: 1, c: 0.5, k: 0.6, r: 0.3 };
    expect(pStar(P)).toBeLessThan(0);
    expect(uAct(0.1, P)).toBeLessThan(0);
    expect(decide(0.1, P)).toBe('abstain');
  });
});

describe('casos de la experiencia', () => {
  it('redondear (bajo, 0,95) → actuar; compras (medio, 0,70) → preguntar; escritura (alto, 0,40) → abstenerse', () => {
    expect(decide(0.95, FROZEN.bajo)).toBe('act');
    expect(decide(0.7, FROZEN.medio)).toBe('ask');
    expect(decide(0.4, FROZEN.alto)).toBe('abstain');
  });
});

describe('M1 · comprensión ≠ ejecución', () => {
  it('se reduce al modelo idealizado con e₁=1, e₀=0', () => {
    for (const P of Object.values(FROZEN)) expect(pStarGeneral(P, 1, 0)).toBeCloseTo(pStar(P), 12);
  });
  it('ejecución imperfecta baja p*', () => {
    for (const P of Object.values(FROZEN)) expect(pStarGeneral(P, 0.95, 0.05)).toBeLessThan(pStar(P));
  });
});

describe('M2 · ventaja de preguntar vs valor de la información', () => {
  it('coinciden cuando actuar es la mejor alternativa (p ≥ p₀)', () => {
    for (const P of Object.values(FROZEN))
      for (const p of GRID) if (p >= pZero(P)) expect(askGainVsAct(p, P)).toBeCloseTo(evsiPolicy(p, P), 12);
  });
  it('contraejemplo alto, p = 0,40: 1,938 frente a 0,646', () => {
    expect(askGainVsAct(0.4, FROZEN.alto)).toBeCloseTo(1.938, 3);
    expect(evsiPolicy(0.4, FROZEN.alto)).toBeCloseTo(0.646, 3);
  });
});
