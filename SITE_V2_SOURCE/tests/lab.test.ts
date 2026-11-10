import { createElement } from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FROZEN, decide, fmt, regions, thresholds, utilities } from '../src/domain/decisionModel';
import { readLang, withLang } from '../src/store/navigation';
import { buildBrainCloud } from '../src/components/brain/geometry';
import brainRaw from '../src/data/brain.json';
import type { BrainData } from '../src/data/types';
import { LabView, parseLabSearch } from '../src/pages/laboratorio';
import { LAB_VERSION, generateScenario, generateLegacyScenario, labDecision } from '../src/simulation/scenarioGenerator';

const labSrc = [
  readFileSync(resolve(__dirname, '../src/pages/laboratorio.tsx'), 'utf8'),
  readFileSync(resolve(__dirname, '../src/simulation/scenarioGenerator.ts'), 'utf8'),
  readFileSync(resolve(__dirname, '../src/pages/laboratorio.css'), 'utf8'),
].join('\n');

describe('laboratorio', () => {
  it('no muestra «observado» ni «observed»', () => {
    expect(labSrc.toLowerCase()).not.toMatch(/observado|observed/);
  });

  it('la misma semilla produce el mismo escenario y la decisión es decide()', () => {
    const a = generateScenario(20261109);
    const b = generateScenario(20261109);
    expect(b).toEqual(a);
    expect(labDecision(a)).toBe(decide(a.p, FROZEN[a.riskClass]));
  });

  it('el caso C (riesgo alto, p = 0,40) se abstiene con la política del manuscrito', () => {
    expect(decide(0.4, FROZEN.alto)).toBe('abstain');
  });

  it('diez mil semillas quedan dentro de rango y coinciden con decide()', () => {
    for (let seed = 1; seed <= 10000; seed++) {
      const s = generateScenario(seed);
      expect(s.p).toBeGreaterThanOrEqual(0);
      expect(s.p).toBeLessThanOrEqual(1);
      expect(['bajo', 'medio', 'alto']).toContain(s.riskClass);
      expect(labDecision(s)).toBe(decide(s.p, FROZEN[s.riskClass]));
    }
  });

  it('p* es frontera de regions() y pₐ solo cuando hay zona de abstención', () => {
    for (const cls of ['bajo', 'medio', 'alto'] as const) {
      const cuts = regions(FROZEN[cls], 500).flatMap((r) => [r.from, r.to]);
      const near = (v: number) => cuts.some((c) => Math.abs(c - v) <= 1 / 500 + 1e-9);
      const th = thresholds(FROZEN[cls]);
      expect(near(th.pStar)).toBe(true);
      expect(near(th.pA)).toBe(th.hasAbstainZone);
    }
  });

  it('una versión distinta no se reinterpreta', () => {
    const bad = parseLabSearch('?s=20261109&v=9&pol=manuscrito');
    expect(bad.warning).toBe(true);
    expect(bad.scenario).toBeNull();
    const ok = parseLabSearch('?s=20261109&v=1&pol=manuscrito');
    expect(ok.warning).toBe(false);
    expect(ok.scenario?.version).toBe(LAB_VERSION);
    expect(ok.scenario).toEqual(generateLegacyScenario(20261109));
  });

  it('la decisión renderizada lleva el chip de política', () => {
    const scenario = generateScenario(20261109);
    const html = renderToString(
      createElement(LabView, {
        scenario,
        lang: 'es',
        warning: false,
        choice: 'act',
        revealed: true,
        copied: false,
        onGenerate: () => undefined,
        onChoose: () => undefined,
        onSkip: () => undefined,
        onCopy: () => undefined,
      }),
    );
    expect(html).toContain('POLÍTICA DEL MANUSCRITO');
    expect(html.toLowerCase()).not.toMatch(/observado|observed/);
  });

  it('el instrumento y las barras comparten escala y no se salen del recuadro', () => {
    const scenario = generateScenario(618, 'alto');
    const html = renderToString(
      createElement(LabView, {
        scenario,
        lang: 'es',
        warning: false,
        choice: null,
        revealed: true,
        copied: false,
        onGenerate: () => undefined,
        onChoose: () => undefined,
        onSkip: () => undefined,
        onCopy: () => undefined,
      }),
    );
    const th = thresholds(FROZEN.alto);
    expect(html).toContain(`pₐ ${fmt(th.pA, 3, 'es')}`);
    expect(html).toContain(`p* ${fmt(th.pStar, 3, 'es')}`);
    expect(html).toContain('viewBox="0 -18 200 150"');
    expect(html).toContain('width="100%"');
    expect(html).toContain('height="auto"');
    expect(html).toContain('gauge-abstain');
    expect(html).toContain('gauge-ask');
    expect(html).toContain('gauge-act');
    const axis = html.match(/<line x1="([\d.]+)" y1="6" x2="([\d.]+)" y2="114" class="lab-axis"/);
    expect(axis?.[1]).toBe(axis?.[2]);
    const zero = Number(axis?.[1]);
    expect(html).toContain(`<circle cx="${axis?.[1]}"`);
    expect(html).toContain(fmt(0, 3, 'es'));
    const u = utilities(scenario.p, FROZEN.alto);
    for (const value of [u.act, u.ask, 0]) expect(html).toContain(fmt(value, 3, 'es'));
    for (const rect of html.matchAll(/<rect x="([\d.]+)" y="[\d.]+" width="([\d.]+)" height="18" class="lab-bar/g)) {
      const x = Number(rect[1]);
      const w = Number(rect[2]);
      const touchesZero = Math.abs(x - zero) < 0.01 || Math.abs(x + w - zero) < 0.01;
      expect(touchesZero).toBe(true);
    }
    for (const label of html.matchAll(/<text x="([\d.]+)" y="[\d.]+" text-anchor="end"/g)) {
      expect(Number(label[1])).toBeLessThan(zero);
    }
    expect(labSrc).toContain('width: 100%');
    expect(labSrc).toContain('max-width: 100%');
    expect(labSrc).toContain('height: auto');
    const globalCss = readFileSync(resolve(__dirname, '../src/styles/global.css'), 'utf8');
    expect(globalCss).toContain('scroll-margin-top: var(--header-h)');
  });

  it('el idioma guardado sigue a la página siguiente', () => {
    expect(readLang('', 'en')).toBe('en');
    expect(readLang('?lang=es', 'en')).toBe('es');
    expect(readLang('?s=618&v=1', 'en')).toBe('en');
    expect(withLang('./investigacion/', 'en')).toBe('./investigacion/?lang=en');
    expect(withLang('../#evidencia', 'en')).toBe('../?lang=en#evidencia');
    expect(withLang('#inicio', 'en')).toBe('#inicio');
    expect(withLang('./investigacion/', 'es')).toBe('./investigacion/');
  });

  it('el laboratorio no importa three y la geometría del cerebro no cambia', () => {
    expect(labSrc).not.toMatch(/three|BrainCanvas/);
    const cloud = buildBrainCloud(48, (brainRaw as unknown as BrainData).regions);
    const again = buildBrainCloud(48, (brainRaw as unknown as BrainData).regions);
    expect(Array.from(cloud.positions)).toEqual(Array.from(again.positions));
    expect(Array.from(cloud.positions.slice(0, 3)).map((n) => n.toFixed(6))).toEqual(['0.582268', '0.457592', '0.662830']);
  });
});
