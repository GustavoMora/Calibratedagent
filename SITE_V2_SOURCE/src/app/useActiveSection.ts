import { useEffect, useState } from 'react';

export const SECTIONS = ['inicio', 'casos', 'como-decide', 'cerebro', 'evidencia'] as const;
export type SectionId = (typeof SECTIONS)[number];

/** Sección de Explorar que ocupa el centro de la pantalla. */
export function useActiveSection(enabled = true): SectionId {
  const [active, setActive] = useState<SectionId>('inicio');
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id as SectionId);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [enabled]);
  return active;
}
