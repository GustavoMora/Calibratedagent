/** Punto de entrada del prerenderizado (solo build, ver scripts/prerender.mjs). */
import { renderToString } from 'react-dom/server';
import { App } from './pages/explorar';
import { Root } from './pages/investigacion';

export async function renderPage(page: 'explorar' | 'investigacion'): Promise<string> {
  return renderToString(page === 'explorar' ? <App /> : <Root />);
}
