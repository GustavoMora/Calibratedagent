import brainRaw from './brain.json';
import scenariosRaw from './scenarios.json';
import type { BrainData, BrainNode, BrainRegion, Scenario, ScenarioData } from './types';
import { validateBrain, validateScenarios } from './validate';

export const brain = brainRaw as unknown as BrainData;
export const scenarioData = scenariosRaw as unknown as ScenarioData;
export const scenarios: Scenario[] = scenarioData.scenarios;

/** Errores de datos visibles en la UI (nunca fallar en silencio). */
export const dataErrors: string[] = [...validateBrain(brain), ...validateScenarios(scenarioData)];

export const nodeById = new Map<string, BrainNode>(brain.nodes.map((n) => [n.id, n]));
export const regionById = new Map<string, BrainRegion>(brain.regions.map((r) => [r.id, r]));

export function scenarioById(id: string): Scenario {
  return scenarios.find((s) => s.id === id) ?? scenarios[0]!;
}
