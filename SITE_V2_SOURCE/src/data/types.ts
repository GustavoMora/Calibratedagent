import type { Action, RiskClass } from '../domain/decisionModel';

export type Lang = 'es' | 'en';
export type I18n = Record<Lang, string>;
export type Vec3 = [number, number, number];

export type EvidenceTag = 'MODEL' | 'ILLUSTRATION' | 'PROTOCOL' | 'EXTERNAL' | 'INTERNAL';

export interface BrainRegion {
  id: string;
  center: number[];
  color: string;
  label: I18n;
  summary: I18n;
}

export interface BrainNode {
  id: string;
  region: string;
  pos: number[];
  tag: EvidenceTag | string;
  label: I18n;
  desc: I18n;
  example: I18n;
  url?: string;
}

export interface FlowStage {
  id: string;
  node: string;
  label: I18n;
}

export interface BrainData {
  regions: BrainRegion[];
  nodes: BrainNode[];
  links: string[][];
  flow: { stages: FlowStage[] };
}

export interface Scenario {
  id: string;
  riskClass: RiskClass;
  kind: string;
  p: number;
  judge: Action;
  irreversible: boolean;
  label: I18n;
  request: I18n;
  knows: I18n;
  risk: I18n;
  why: I18n;
  consequence: I18n;
  wouldChange: I18n;
}

export interface ScenarioData {
  scenarios: Scenario[];
}
