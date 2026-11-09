/**
 * Prerenderizado estático: escribe el HTML de cada página dentro de <div id="root"> en dist/.
 * Así el contenido existe sin JavaScript (buscadores, vistas previas, lectores sin JS).
 * El cliente vuelve a montar con createRoot, por lo que no hay hidratación que pueda desalinearse.
 * Se prerenderiza en español (idioma por defecto); el inglés se activa en el cliente con ?lang=en.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

// React avisa que useLayoutEffect no corre en el servidor: es esperado (el cliente vuelve a montar).
const err = console.error;
console.error = (...a) => (String(a[0]).includes('useLayoutEffect does nothing on the server') ? undefined : err(...a));

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { renderPage } = await vite.ssrLoadModule('/src/prerender.tsx');
  for (const [page, file] of [
    ['explorar', 'dist/index.html'],
    ['investigacion', 'dist/investigacion/index.html'],
  ]) {
    const path = resolve(root, file);
    const html = await readFile(path, 'utf8');
    if (!html.includes('<!--prerender-->')) throw new Error(`${file}: falta el marcador <!--prerender-->`);
    const body = await renderPage(page);
    if (body.length < 2000) throw new Error(`${file}: el prerender salió vacío (${body.length} caracteres)`);
    await writeFile(path, html.replace('<!--prerender-->', body));
    console.log(`prerender ${file}: ${body.length} caracteres`);
  }
} finally {
  await vite.close();
}
