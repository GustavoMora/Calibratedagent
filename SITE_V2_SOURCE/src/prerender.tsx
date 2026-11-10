/** Punto de entrada del prerenderizado (solo build, ver scripts/prerender.mjs). */
import { renderToString } from 'react-dom/server';
import { App } from './pages/explorar';
import { Root } from './pages/investigacion';
import { LabRoot } from './pages/laboratorio';

export async function renderPage(page: 'explorar' | 'investigacion' | 'laboratorio'): Promise<string> {
  if (page === 'explorar') return renderToString(<App />);
  if (page === 'laboratorio') return renderToString(<LabRoot />);
  return renderToString(<Root />);
}
