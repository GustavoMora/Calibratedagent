/**
 * Generador v1 del Laboratorio. Orden de sorteo fijo (si cambia, cambia LAB_VERSION):
 * plantilla → clase de riesgo → ambigüedad → p → reversibilidad.
 * `riesgo` en la URL reemplaza la clase ya sorteada; no altera el resto de la semilla.
 * La decisión no se sortea: sale de decide() con los parámetros congelados de la clase.
 */
import { FROZEN, decide, type Action, type RiskClass } from '../domain/decisionModel';
import { mulberry32 } from '../domain/prng';
import templatesRaw from '../data/labTemplates.json';

export const LAB_VERSION = 1;

export type Ambiguity = 'clara' | 'ambigua' | 'irreducible';

export interface LabTemplate {
  id: string;
  label: { es: string; en: string };
  request: { es: string; en: string };
  knows: { es: string; en: string };
}

const TEMPLATES = (templatesRaw as { templates: LabTemplate[] }).templates;
const RISKS: RiskClass[] = ['bajo', 'medio', 'alto'];
const AMBIGUITIES: Ambiguity[] = ['clara', 'ambigua', 'irreducible'];
const BAND: Record<Ambiguity, [number, number]> = {
  clara: [0.8, 0.98],
  ambigua: [0.4, 0.8],
  irreducible: [0.05, 0.45],
};

export interface LabScenario {
  seed: number;
  version: number;
  templateId: string;
  riskClass: RiskClass;
  ambiguity: Ambiguity;
  p: number;
  irreversible: boolean;
  label: { es: string; en: string };
  request: { es: string; en: string };
  knows: { es: string; en: string };
}

export function generateScenario(seed: number, riskOverride?: RiskClass): LabScenario {
  const rnd = mulberry32(seed >>> 0);
  const template = TEMPLATES[Math.floor(rnd() * TEMPLATES.length)]!;
  const drawn = RISKS[Math.floor(rnd() * RISKS.length)]!;
  const ambiguity = AMBIGUITIES[Math.floor(rnd() * AMBIGUITIES.length)]!;
  const [lo, hi] = BAND[ambiguity];
  const p = Math.round((lo + rnd() * (hi - lo)) * 1000) / 1000;
  const irreversible = rnd() < 0.3;
  const riskClass = riskOverride ?? drawn;
  return {
    seed: seed >>> 0,
    version: LAB_VERSION,
    templateId: template.id,
    riskClass,
    ambiguity,
    p,
    irreversible,
    label: template.label,
    request: template.request,
    knows: template.knows,
  };
}

export function labDecision(s: Pick<LabScenario, 'p' | 'riskClass'>): Action {
  return decide(s.p, FROZEN[s.riskClass]);
}

export function isRiskClass(value: string | null): value is RiskClass {
  return value === 'bajo' || value === 'medio' || value === 'alto';
}
