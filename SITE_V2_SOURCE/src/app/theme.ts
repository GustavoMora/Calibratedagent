/**
 * Paleta para superficies dibujadas a mano (canvas 2D, SVG con color calculado).
 * Lee los tokens CSS vigentes, así un solo cambio en global.css alcanza a todo.
 */
import { useEffect, useState } from 'react';
import { useStore } from '../store/navigation';
import type { Action } from '../domain/decisionModel';

export interface Palette {
  bg: string;
  ink: string;
  ink2: string;
  muted: string;
  line: string;
  accent: string;
  act: string;
  ask: string;
  abstain: string;
}

const FALLBACK: Palette = {
  bg: '#0a0a0a',
  ink: '#f5f5f5',
  ink2: '#bdbdbd',
  muted: '#8f8f8f',
  line: '#3d3d3d',
  accent: '#ffffff',
  act: '#3ddc84',
  ask: '#ffb84d',
  abstain: '#ff5a4f',
};

export function readPalette(el?: Element | null): Palette {
  if (typeof window === 'undefined') return FALLBACK;
  const cs = getComputedStyle(el ?? document.documentElement);
  const v = (name: string, fb: string) => cs.getPropertyValue(name).trim() || fb;
  return {
    bg: v('--bg', FALLBACK.bg),
    ink: v('--ink', FALLBACK.ink),
    ink2: v('--ink-2', FALLBACK.ink2),
    muted: v('--muted', FALLBACK.muted),
    line: v('--line-2', FALLBACK.line),
    accent: v('--accent', FALLBACK.accent),
    act: v('--act-g', FALLBACK.act),
    ask: v('--ask-g', FALLBACK.ask),
    abstain: v('--abstain-g', FALLBACK.abstain),
  };
}

/** Paleta reactiva al tema elegido. */
export function usePalette(): Palette {
  const theme = useStore((s) => s.theme);
  const [p, setP] = useState<Palette>(FALLBACK);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    setP(readPalette());
  }, [theme]);
  return p;
}

export function actionColor(p: Palette, a: Action): string {
  return a === 'act' ? p.act : a === 'ask' ? p.ask : p.abstain;
}

/** '#rrggbb' → [r, g, b] */
export function rgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [parseInt(n.slice(0, 2), 16) || 0, parseInt(n.slice(2, 4), 16) || 0, parseInt(n.slice(4, 6), 16) || 0];
}
