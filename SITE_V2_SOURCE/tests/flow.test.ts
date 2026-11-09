import { describe, expect, it } from 'vitest';
import brainRaw from '../src/data/brain.json';
import scenariosRaw from '../src/data/scenarios.json';
import type { BrainData, ScenarioData } from '../src/data/types';
import {
  SEGMENT_SECONDS,
  currentNode,
  decideScenario,
  initialFlow,
  pauseFlow,
  resetFlow,
  resumeFlow,
  startFlow,
  stepFlow,
} from '../src/simulation/requestFlow';
import { canTransition, parentView } from '../src/store/navigation';

const brain = brainRaw as unknown as BrainData;
const [redondear, compras, escritura] = (scenariosRaw as unknown as ScenarioData).scenarios;

describe('flujo de un pedido', () => {
  it('recorre entrada → información → declaración → calibración → regla → decisión', () => {
    const f = startFlow(initialFlow(), compras!, brain.flow.stages);
    expect(f.steps.map((s) => s.node)).toEqual(['pedido', 'contexto', 'agente', 'calibrador', 'regla', 'preguntar', 'humano']);
    expect(f.outcome).toBe('ask');
  });

  it('actuar no pasa por la persona', () => {
    const f = startFlow(initialFlow(), redondear!, brain.flow.stages);
    expect(f.steps[f.steps.length - 1]!.node).toBe('actuar');
  });

  it('lo irreversible pasa por el veto', () => {
    const f = startFlow(initialFlow(), escritura!, brain.flow.stages);
    expect(f.steps.map((s) => s.node)).toContain('veto');
    expect(f.outcome).toBe('abstain');
  });

  it('el veto convierte «actuar» en confirmación si la acción es irreversible', () => {
    expect(decideScenario({ p: 0.99, riskClass: 'alto', irreversible: true })).toEqual({ action: 'ask', veto: true });
    expect(decideScenario({ p: 0.99, riskClass: 'alto', irreversible: false })).toEqual({ action: 'act', veto: false });
  });

  it('avanza, se pausa, se reanuda y termina (sin loops infinitos)', () => {
    let f = startFlow(initialFlow(), compras!, brain.flow.stages);
    f = stepFlow(f, SEGMENT_SECONDS * 1.5);
    expect(f.index).toBe(1);
    expect(currentNode(f)).toBe('contexto');
    f = pauseFlow(f);
    const paused = stepFlow(f, 100);
    expect(paused).toBe(f);
    f = resumeFlow(f);
    f = stepFlow(f, 100);
    expect(f.status).toBe('done');
    expect(currentNode(f)).toBe('humano');
    expect(stepFlow(f, 10)).toBe(f);
    expect(resetFlow(f).status).toBe('idle');
  });
});

describe('navegación', () => {
  it('transiciones permitidas', () => {
    expect(canTransition('brain', 'region')).toBe(true);
    expect(canTransition('flow', 'flow')).toBe(false);
  });
  it('atrás sube un nivel', () => {
    expect(parentView({ level: 'node', region: 'politica', node: 'regla' })).toEqual({ level: 'region', region: 'politica' });
    expect(parentView({ level: 'region', region: 'politica' })).toEqual({ level: 'brain' });
    expect(parentView({ level: 'flow', region: 'politica' })).toEqual({ level: 'brain' });
  });
});
