/**
 * Simulador ÚNICO del viaje de un pedido hipotético. Gobierna la partícula 3D, el feed textual y el
 * resaltado de nodos: todos leen este mismo estado. Puro (sin React, sin timers): se avanza con step(dt).
 * No ejecuta ningún modelo real. La decisión sale de decisionModel.decide() con los parámetros congelados.
 */
import { FROZEN, decide, thresholds, type Action } from '../domain/decisionModel';
import type { Scenario } from '../data/types';

export type FlowStatus = 'idle' | 'running' | 'paused' | 'done';

export interface FlowStep {
  stage: string;
  node: string;
}

export interface FlowState {
  status: FlowStatus;
  scenarioId: string | null;
  steps: FlowStep[];
  /** índice del tramo en curso: viaja de steps[i] a steps[i+1] */
  index: number;
  /** progreso dentro del tramo, 0..1 */
  t: number;
  speed: number;
  outcome: Action | null;
  vetoApplied: boolean;
}

export const OUTCOME_NODE: Record<Action, string> = {
  act: 'actuar',
  ask: 'preguntar',
  abstain: 'abstenerse',
};

/** Segundos por tramo a velocidad 1. */
export const SEGMENT_SECONDS = 1.15;

export function initialFlow(): FlowState {
  return { status: 'idle', scenarioId: null, steps: [], index: 0, t: 0, speed: 1, outcome: null, vetoApplied: false };
}

/**
 * Decisión de un caso: argmax de utilidades con parámetros congelados de su clase.
 * Veto ilustrativo: si la acción es irreversible y la regla diría «actuar», se pide confirmación (preguntar).
 */
export function decideScenario(s: Pick<Scenario, 'p' | 'riskClass' | 'irreversible'>): { action: Action; veto: boolean } {
  const base = decide(s.p, FROZEN[s.riskClass]);
  if (s.irreversible && base === 'act') return { action: 'ask', veto: true };
  return { action: base, veto: false };
}

export function buildSteps(s: Pick<Scenario, 'id' | 'p' | 'riskClass' | 'irreversible'>, stages: { id: string; node: string }[], applyVeto = true): { steps: FlowStep[]; outcome: Action; veto: boolean } {
  const { action, veto } = applyVeto ? decideScenario(s) : { action: decide(s.p, FROZEN[s.riskClass]), veto: false };
  const steps: FlowStep[] = [];
  for (const st of stages) {
    if (st.node === '$outcome') {
      if (applyVeto && s.irreversible) steps.push({ stage: 'politica', node: 'veto' });
      steps.push({ stage: st.id, node: OUTCOME_NODE[action] });
      if (action !== 'act') steps.push({ stage: st.id, node: 'humano' });
    } else {
      steps.push({ stage: st.id, node: st.node });
    }
  }
  return { steps, outcome: action, veto };
}

export function startFlow(prev: FlowState, s: Pick<Scenario, 'id' | 'p' | 'riskClass' | 'irreversible'>, stages: { id: string; node: string }[], applyVeto = true): FlowState {
  const { steps, outcome, veto } = buildSteps(s, stages, applyVeto);
  return { ...prev, status: 'running', scenarioId: s.id, steps, index: 0, t: 0, outcome, vetoApplied: veto };
}

export function stepFlow(f: FlowState, dt: number): FlowState {
  if (f.status !== 'running' || f.steps.length < 2) return f;
  let t = f.t + (dt * f.speed) / SEGMENT_SECONDS;
  let index = f.index;
  while (t >= 1 && index < f.steps.length - 1) {
    t -= 1;
    index += 1;
  }
  if (index >= f.steps.length - 1) return { ...f, index: f.steps.length - 1, t: 0, status: 'done' };
  return { ...f, index, t };
}

export function pauseFlow(f: FlowState): FlowState {
  return f.status === 'running' ? { ...f, status: 'paused' } : f;
}

export function resumeFlow(f: FlowState): FlowState {
  return f.status === 'paused' ? { ...f, status: 'running' } : f;
}

export function resetFlow(f: FlowState): FlowState {
  return { ...initialFlow(), speed: f.speed };
}

/** Nodo donde está (o al que llegó) el pedido. */
export function currentNode(f: FlowState): string | null {
  return f.steps[f.index]?.node ?? null;
}

/** Nodos ya visitados (incluido el actual). */
export function visitedNodes(f: FlowState): string[] {
  return f.steps.slice(0, f.index + 1).map((s) => s.node);
}

export { thresholds };
