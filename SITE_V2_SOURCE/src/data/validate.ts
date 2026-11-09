/** Validación de brain.json y scenarios.json. Se usa en runtime (mensaje visible si falla) y en tests/build. */
import type { BrainData, ScenarioData } from './types';

const LANGS = ['es', 'en'] as const;

function checkI18n(obj: unknown, where: string, errors: string[]): void {
  if (!obj || typeof obj !== 'object') {
    errors.push(`${where}: falta el texto localizado`);
    return;
  }
  for (const l of LANGS) {
    const v = (obj as Record<string, unknown>)[l];
    if (typeof v !== 'string' || v.trim() === '') errors.push(`${where}: falta «${l}»`);
  }
}

export function validateBrain(data: BrainData): string[] {
  const errors: string[] = [];
  const regionIds = new Set<string>();
  for (const r of data.regions) {
    if (regionIds.has(r.id)) errors.push(`región duplicada: ${r.id}`);
    regionIds.add(r.id);
    if (r.center.length !== 3) errors.push(`región ${r.id}: center debe tener 3 coordenadas`);
    checkI18n(r.label, `región ${r.id}.label`, errors);
    checkI18n(r.summary, `región ${r.id}.summary`, errors);
  }
  const nodeIds = new Set<string>();
  for (const n of data.nodes) {
    if (nodeIds.has(n.id) || regionIds.has(n.id)) errors.push(`id duplicado: ${n.id}`);
    nodeIds.add(n.id);
    if (!regionIds.has(n.region)) errors.push(`nodo ${n.id}: región inexistente «${n.region}»`);
    if (n.pos.length !== 3) errors.push(`nodo ${n.id}: pos debe tener 3 coordenadas`);
    checkI18n(n.label, `nodo ${n.id}.label`, errors);
    checkI18n(n.desc, `nodo ${n.id}.desc`, errors);
    checkI18n(n.example, `nodo ${n.id}.example`, errors);
  }
  const seen = new Set<string>();
  for (const link of data.links) {
    const a = link[0] ?? '';
    const b = link[1] ?? '';
    if (link.length !== 2) errors.push(`enlace mal formado: ${link.join('–')}`);
    if (!nodeIds.has(a)) errors.push(`enlace roto: ${a}`);
    if (!nodeIds.has(b)) errors.push(`enlace roto: ${b}`);
    if (a === b) errors.push(`enlace a sí mismo: ${a}`);
    const key = [a, b].sort().join('|');
    if (seen.has(key)) errors.push(`enlace duplicado: ${a}–${b}`);
    seen.add(key);
  }
  for (const s of data.flow.stages) {
    if (s.node !== '$outcome' && !nodeIds.has(s.node)) errors.push(`flujo: nodo inexistente ${s.node}`);
    checkI18n(s.label, `flujo ${s.id}.label`, errors);
  }
  for (const req of ['actuar', 'preguntar', 'abstenerse', 'humano', 'veto']) {
    if (!nodeIds.has(req)) errors.push(`falta el nodo requerido por el flujo: ${req}`);
  }
  return errors;
}

export function validateScenarios(data: ScenarioData): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const s of data.scenarios) {
    if (ids.has(s.id)) errors.push(`caso duplicado: ${s.id}`);
    ids.add(s.id);
    if (!(s.p >= 0 && s.p <= 1)) errors.push(`caso ${s.id}: p fuera de [0, 1]`);
    if (!['bajo', 'medio', 'alto'].includes(s.riskClass)) errors.push(`caso ${s.id}: clase inválida`);
    for (const f of ['label', 'request', 'knows', 'risk', 'why', 'consequence', 'wouldChange'] as const) {
      checkI18n(s[f], `caso ${s.id}.${f}`, errors);
    }
  }
  if (data.scenarios.length !== 3) errors.push('se esperan exactamente tres casos');
  return errors;
}
