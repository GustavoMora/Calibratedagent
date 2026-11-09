/**
 * Estado global (Zustand): idioma, caso seleccionado, navegación del cerebro y flujo.
 * Navegación tipada brain | region | node | flow con transiciones permitidas explícitas.
 */
import { create } from 'zustand';
import { brain, nodeById, scenarioById } from '../data';
import type { Lang } from '../data/types';
import {
  initialFlow,
  pauseFlow,
  resetFlow,
  resumeFlow,
  startFlow,
  stepFlow,
  type FlowState,
} from '../simulation/requestFlow';

export type BrainView =
  | { level: 'brain' }
  | { level: 'region'; region: string }
  | { level: 'node'; region: string; node: string }
  | { level: 'flow'; region: string };

export type Level = BrainView['level'];

/** Transiciones permitidas. Cualquier otra se ignora (y se reporta en desarrollo). */
export const ALLOWED: Record<Level, Level[]> = {
  brain: ['region', 'node', 'flow'],
  region: ['brain', 'region', 'node', 'flow'],
  node: ['brain', 'region', 'node', 'flow'],
  flow: ['brain', 'region', 'node'],
};

export function canTransition(from: Level, to: Level): boolean {
  return ALLOWED[from].includes(to);
}

/** Un nivel hacia arriba (Escape / atrás). */
export function parentView(v: BrainView): BrainView {
  switch (v.level) {
    case 'node':
      return { level: 'region', region: v.region };
    case 'flow':
    case 'region':
      return { level: 'brain' };
    default:
      return v;
  }
}

function initialLang(): Lang {
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'en' || q === 'es') return q;
    const s = window.localStorage.getItem('ca-lang');
    if (s === 'en' || s === 'es') return s;
  } catch {
    /* sin storage: default */
  }
  return 'es';
}

function initialCase(): string {
  try {
    const s = window.localStorage.getItem('ca-case');
    if (s) return scenarioById(s).id;
  } catch {
    /* ignore */
  }
  return 'compras';
}

interface State {
  lang: Lang;
  caseId: string;
  view: BrainView;
  flow: FlowState;
  setLang: (l: Lang) => void;
  setCase: (id: string) => void;
  go: (v: BrainView) => void;
  back: () => void;
  selectNode: (id: string) => void;
  sendRequest: () => void;
  pause: () => void;
  resume: () => void;
  resetRequest: () => void;
  setSpeed: (s: number) => void;
  tick: (dt: number) => void;
}

export const useStore = create<State>((set, get) => ({
  lang: typeof window === 'undefined' ? 'es' : initialLang(),
  caseId: typeof window === 'undefined' ? 'compras' : initialCase(),
  view: { level: 'brain' },
  flow: initialFlow(),
  setLang: (lang) => {
    try {
      window.localStorage.setItem('ca-lang', lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang;
    set({ lang });
  },
  setCase: (caseId) => {
    try {
      window.localStorage.setItem('ca-case', caseId);
    } catch {
      /* ignore */
    }
    // cambiar de caso reinicia un flujo en curso para que escena y feed no se contradigan
    set((s) => ({ caseId, flow: s.flow.status === 'idle' ? s.flow : resetFlow(s.flow) }));
  },
  go: (v) => {
    const from = get().view.level;
    if (!canTransition(from, v.level) && from !== v.level) return;
    set((s) => ({ view: v, flow: v.level === 'flow' ? s.flow : s.flow.status === 'idle' ? s.flow : resetFlow(s.flow) }));
  },
  back: () => get().go(parentView(get().view)),
  selectNode: (id) => {
    const n = nodeById.get(id);
    if (!n) return;
    get().go({ level: 'node', region: n.region, node: id });
  },
  sendRequest: () => {
    const s = scenarioById(get().caseId);
    set((st) => ({ view: { level: 'flow', region: 'politica' }, flow: startFlow(st.flow, s, brain.flow.stages) }));
  },
  pause: () => set((s) => ({ flow: pauseFlow(s.flow) })),
  resume: () => set((s) => ({ flow: resumeFlow(s.flow) })),
  resetRequest: () => set((s) => ({ flow: resetFlow(s.flow) })),
  setSpeed: (speed) => set((s) => ({ flow: { ...s.flow, speed } })),
  tick: (dt) => {
    const f = get().flow;
    if (f.status !== 'running') return;
    const next = stepFlow(f, dt);
    // Solo publicamos cambios de tramo/estado al store de React; t fino se lee por getState() en el render loop.
    if (next.index !== f.index || next.status !== f.status) set({ flow: next });
    else get().flow.t = next.t; // mutación controlada del progreso fino, sin re-render
  },
}));
