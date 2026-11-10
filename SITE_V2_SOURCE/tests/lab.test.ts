import { createElement } from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FROZEN, decide, regions, thresholds } from '../src/domain/decisionModel';
import { buildBrainCloud } from '../src/components/brain/geometry';
import brainRaw from '../src/data/brain.json';
import type { BrainData } from '../src/data/types';
import { LabView, parseLabSearch } from '../src/pages/laboratorio';
import { LAB_VERSION, generateScenario, labDecision } from '../src/simulation/scenarioGenerator';

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
    expect(ok.scenario).toEqual(generateScenario(20261109));
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

  it('el laboratorio no importa three y la geometría del cerebro no cambia', () => {
    expect(labSrc).not.toMatch(/three|BrainCanvas/);
    const cloud = buildBrainCloud(48, (brainRaw as unknown as BrainData).regions);
    const again = buildBrainCloud(48, (brainRaw as unknown as BrainData).regions);
    expect(Array.from(cloud.positions)).toEqual(Array.from(again.positions));
    expect(Array.from(cloud.positions.slice(0, 3)).map((n) => n.toFixed(6))).toEqual(['0.582268', '0.457592', '0.662830']);
  });
});
