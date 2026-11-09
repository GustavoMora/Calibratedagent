import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FROZEN, regions, thresholds } from '../src/domain/decisionModel';
import { PILOT_EVALUABLE, PILOT_TOTAL } from '../src/app/site';
import { DICT } from '../src/app/i18n';


const css = readFileSync(resolve(__dirname, '../src/styles/global.css'), 'utf8');
const researchSrc = readFileSync(resolve(__dirname, '../src/pages/investigacion.tsx'), 'utf8');

function block(selector: string): Record<string, string> {
  const i = css.indexOf(selector);
  const body = css.slice(css.indexOf('{', i) + 1, css.indexOf('}', i));
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/(--[a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)) out[m[1]!] = m[2]!;
  return out;
}
function lum(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

describe('v3 · paleta Carbón / Papel', () => {
  const themes = { carbon: block(':root,\n.dark-scope'), papel: block(":root[data-theme='light']") };
  for (const [name, t] of Object.entries(themes)) {
    it(`${name}: el texto cumple contraste AA (4,5:1) sobre fondo y superficies`, () => {
      for (const fg of ['--ink', '--ink-2', '--muted', '--act', '--ask', '--abstain']) {
        for (const bg of ['--bg', '--bg-2', '--surface', '--surface-2']) {
          expect(contrast(t[fg]!, t[bg]!), `${fg} sobre ${bg}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    });
    it(`${name}: los colores gráficos cumplen 3:1 sobre el fondo`, () => {
      for (const fg of ['--act-g', '--ask-g', '--abstain-g']) expect(contrast(t[fg]!, t['--bg']!), fg).toBeGreaterThanOrEqual(3);
    });
    it(`${name}: el texto sobre el acento es legible`, () => {
      expect(contrast(t['--on-accent']!, t['--accent']!)).toBeGreaterThanOrEqual(7);
    });
  }
});

describe('v3 · figuras derivadas', () => {
  it('las franjas de auditoría coinciden con las publicadas', () => {
    const band = (c: 'bajo' | 'medio' | 'alto') => {
      const lo = Math.floor(thresholds(FROZEN[c]).pStar / 0.05 + 1e-9) * 0.05;
      return [lo.toFixed(2), (lo + 0.05).toFixed(2)];
    };
    expect(band('bajo')).toEqual(['0.85', '0.90']);
    expect(band('medio')).toEqual(['0.90', '0.95']);
    expect(band('alto')).toEqual(['0.90', '0.95']);
  });
  it('el instrumento muestra las zonas del modelo: solo riesgo alto tiene abstención', () => {
    const acts = (c: 'bajo' | 'medio' | 'alto') => regions(FROZEN[c], 500).map((r) => r.action);
    expect(acts('bajo')).toEqual(['ask', 'act']);
    expect(acts('medio')).toEqual(['ask', 'act']);
    expect(acts('alto')).toEqual(['abstain', 'ask', 'act']);
  });
  it('el piloto se informa como 8 de 25', () => {
    expect([PILOT_EVALUABLE, PILOT_TOTAL]).toEqual([8, 25]);
    for (const lang of ['es', 'en'] as const) {
      expect(DICT[lang].pilot).toContain('25');
      expect(DICT[lang].pilot).toMatch(/\b8\b/);
    }
  });
});

describe('v3 · afirmaciones que no deben aparecer', () => {
  const text = JSON.stringify(DICT) + researchSrc;
  it('no promete depósito ni habla de validación', () => {
    expect(text).not.toMatch(/se activará cuando se deposite|will be enabled once/);
    expect(text).not.toMatch(/versión 3\b|version 3\b/);
  });
});
