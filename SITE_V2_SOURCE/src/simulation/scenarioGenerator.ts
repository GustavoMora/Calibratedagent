/**
 * Compatibilidad del generador original (v=1 sin g). No cambiar este orden:
 * plantilla → clase de riesgo → ambigüedad → p → reversibilidad.
 * `riesgo` en la URL reemplaza la clase ya sorteada; no altera el resto de la semilla.
 * La decisión no se sortea: sale de decide() con los parámetros congelados de la clase.
 */
import { FROZEN, decide, type Action, type RiskClass } from '../domain/decisionModel';
import { mulberry32 } from '../domain/prng';
import templatesRaw from '../data/labTemplates.json';
import families from '../data/labFamilies.json';

export const LAB_VERSION = 1;

export type Ambiguity = 'clara' | 'ambigua' | 'irreducible';

export interface LabTemplate {
  id: string;
  label: { es: string; en: string };
  request: { es: string; en: string };
}

const RAW = templatesRaw as {
  knowsByAmbiguity: Record<Ambiguity, { es: string; en: string }>;
  templates: LabTemplate[];
};
const TEMPLATES = RAW.templates;
const KNOWS = RAW.knowsByAmbiguity;
const RISKS: RiskClass[] = ['bajo', 'medio', 'alto'];
const AMBIGUITIES: Ambiguity[] = ['clara', 'ambigua', 'irreducible'];
const BAND: Record<Ambiguity, [number, number]> = {
  clara: [0.8, 0.98],
  ambigua: [0.4, 0.8],
  irreducible: [0.05, 0.45],
};

export interface LabScenario {
  revision?: number;
  level?: number;
  missing?: { es: string; en: string };
  dependencies?: { es: string; en: string };
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

export function generateLegacyScenario(seed: number, riskOverride?: RiskClass): LabScenario {
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
    knows: KNOWS[ambiguity],
  };
}

export function labDecision(s: Pick<LabScenario, 'p' | 'riskClass'>): Action {
  return decide(s.p, FROZEN[s.riskClass]);
}

export function isRiskClass(value: string | null): value is RiskClass {
  return value === 'bajo' || value === 'medio' || value === 'alto';
}

// Revision belongs to the reproducibility record, not a separate application.
export const GENERATOR_REVISION = 2;
// Stable draw order: level, compatible narrative variant, confidence within its band.
export function generateScenario(seed: number, riskOverride?: RiskClass, level?: number): LabScenario {
  const rnd = mulberry32(seed >>> 0);
  const compatible = families.map((family, i) => ({family, level: i + 1})).filter(({family}) => !riskOverride || family.riskClass === riskOverride);
  const levelDraw = rnd();
  const selectedLevel = level ?? compatible[Math.floor(levelDraw * compatible.length)]!.level;
  const family = families[selectedLevel - 1];
  if (!family || (riskOverride && family.riskClass !== riskOverride)) throw new Error('Incompatible scenario constraints');
  const variant = family.variants[Math.floor(rnd() * family.variants.length)]!;
  const p = Math.round((variant.band[0]! + rnd() * (variant.band[1]! - variant.band[0]!)) * 1000) / 1000;
  return { seed: seed >>> 0, version: LAB_VERSION, revision: GENERATOR_REVISION, level: selectedLevel,
    templateId: family.id, riskClass: family.riskClass as RiskClass,
    ambiguity: variant.ambiguity as Ambiguity, p, irreversible: family.irreversible,
    label: family.label, request: family.request, knows: variant.knows,
    missing: variant.missing, dependencies: family.dependencies };
}
