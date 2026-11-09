import { describe, expect, it } from 'vitest';
import brainRaw from '../src/data/brain.json';
import scenariosRaw from '../src/data/scenarios.json';
import { validateBrain, validateScenarios } from '../src/data/validate';
import type { BrainData, ScenarioData } from '../src/data/types';
import { decideScenario } from '../src/simulation/requestFlow';

const brain = brainRaw as unknown as BrainData;
const sc = scenariosRaw as unknown as ScenarioData;

describe('datos', () => {
  it('brain.json es válido (ids, enlaces, ES/EN)', () => {
    expect(validateBrain(brain)).toEqual([]);
  });
  it('scenarios.json es válido', () => {
    expect(validateScenarios(sc)).toEqual([]);
  });
  it('el validador detecta errores', () => {
    const broken: BrainData = JSON.parse(JSON.stringify(brain));
    broken.nodes.push({ ...broken.nodes[0]!, label: { es: 'x', en: '' } });
    broken.links.push(['pedido', 'inexistente']);
    const errs = validateBrain(broken);
    expect(errs.some((e) => e.includes('duplicado'))).toBe(true);
    expect(errs.some((e) => e.includes('enlace roto'))).toBe(true);
    expect(errs.some((e) => e.includes('«en»'))).toBe(true);
  });
  it('la decisión de cada caso coincide con el juez publicado', () => {
    for (const s of sc.scenarios) expect(decideScenario(s).action).toBe(s.judge);
  });
});
