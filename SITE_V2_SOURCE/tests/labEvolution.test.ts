import { describe, it, expect } from 'vitest';
import { generateScenario, generateLegacyScenario } from '../src/simulation/scenarioGenerator';
import { parseLabSearch, labHref } from '../src/pages/laboratorio';
import { buildSteps } from '../src/simulation/requestFlow';
import { FROZEN, decide, utilities } from '../src/domain/decisionModel';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import { DecisionFeedback } from '../src/components/lab/LabExtras';

describe('lab evolution', () => {
  it('round-trips all levels and languages without reinterpreting legacy links', () => {
    for (const lang of ['es', 'en'] as const) for (let level=1;level<=5;level++) for (let seed=0;seed<100;seed++) {
      const s = generateScenario(seed, undefined, level);
      expect(parseLabSearch(labHref(s, lang)).scenario).toEqual(s);
      expect(s.level).toBe(level);
      expect(s.dependencies?.[lang].length).toBeGreaterThan(30);
      expect(s.missing?.[lang].length).toBeGreaterThan(20);
      expect(s.irreversible).toBe(level===5);
      expect(s.riskClass).toBe(level<=2?'bajo':level<=4?'medio':'alto');
    }
    const old = generateLegacyScenario(618, 'alto');
    expect(parseLabSearch('?s=618&v=1&pol=manuscrito&riesgo=alto').scenario).toEqual(old);
    expect(labHref(old,'es')).not.toContain('g=');
  });
  it('rejects unsupported revisions, invalid seeds and incompatible risk overrides', () => {
    for (const suffix of ['&g=99&nivel=1','&g=2&nivel=6','&g=2&nivel=1&riesgo=alto','&nivel=2']) expect(parseLabSearch('?s=1&v=1&pol=manuscrito'+suffix).warning).toBe(true);
    expect(parseLabSearch('?s=4294967296&v=1&pol=manuscrito').warning).toBe(true);
  });
  it('uses utility policy in the lab while preserving existing flow veto behavior', () => {
    const s = { id:'test',p:.99,riskClass:'alto' as const,irreversible:true };
    const stages=[{id:'decision',node:'$outcome'}];
    expect(buildSteps(s,stages).outcome).toBe('ask');
    expect(buildSteps(s,stages,false).outcome).toBe(decide(s.p,FROZEN.alto));
    expect(buildSteps(s,stages,false).veto).toBe(false);
  });
  it('reports expected opportunity cost and handles exact ties', () => {
    const u=utilities(.4,FROZEN.alto);
    const html=renderToString(createElement(DecisionFeedback,{choice:'act',best:'abstain',u,lang:'en'}));
    expect(html).toContain('2.000');
    expect(html).toContain('not a loss that occurred');
    const tie=renderToString(createElement(DecisionFeedback,{choice:'act',best:'ask',u:{act:1,ask:1,abstain:0},lang:'es'}));
    expect(tie).toContain('puede haber empate');
  });
});
