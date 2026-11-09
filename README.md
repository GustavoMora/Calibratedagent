Orquestación calibrada: sitio interactivo de Gustavo Mora. Las cifras marcadas SIMULADO provienen de simulaciones.

## Estructura (v2)

- `index.html`, `investigacion/`, `assets/`: sitio publicado. Es el build de `SITE_V2_SOURCE/` (no editar a mano).
- `SITE_V2_SOURCE/`: fuente (Vite + React + TypeScript). Para actualizar el sitio: `cd SITE_V2_SOURCE && npm install && npm run build` y copiar `dist/*` a la raíz.
- `NOTA_METODOLOGICA.md`, `tests/`: notas y tests científicos.
- `layer/`, `tools/`: histórico de la v1 (parches del HTML anterior). No aplican al build v2; el HTML v1 está en el historial de git (commit `c5b8009` y anteriores).
