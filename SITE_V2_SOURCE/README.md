# Calibrated Agent · sitio v3 «Carbón / Papel»

Rediseño de experiencia: **Explorar** (lectura no experta) + **Investigación completa** (detalle técnico). Vite + React + TypeScript estricto + three.js / @react-three/fiber + Zustand.

Base: `GustavoMora/Calibratedagent` `main@f58fe0ab493cea20b470e0ce5fdf977dd8f859db`; la v3 parte de `redesign-v2@c5b8009`. **No publicado.** El sitio actual sigue intacto. Qué cambió y por qué: `docs/REDISENO_DECISIONES.md`, sección v3.

## Comandos

```bash
npm install        # Node ≥ 18
npm run dev        # http://localhost:5173
npm run test       # 35 tests (modelo, datos, flujo, paleta y figuras v3)
npm run build      # valida datos → tsc → dist/ → prerenderizado estático
npm run og         # regenera public/og.png (requiere Python 3 con Pillow)
npm run preview    # sirve dist/ en http://localhost:4173
```

## Estructura

```
index.html                 Explorar
investigacion/index.html   Investigación completa (página real, sin rutas SPA)
src/domain/decisionModel.ts   fórmulas (única fuente) + FROZEN
src/data/brain.json           regiones, nodos, enlaces, flujo (ES/EN)
src/data/scenarios.json       tres casos
src/data/validate.ts          validación (UI + tests)
src/simulation/requestFlow.ts simulador único del pedido
src/store/navigation.ts       idioma, caso, brain|region|node|flow
src/components/…              secciones, umbral, cerebro, UI (Gauge, Rail), figuras
src/app/site.ts               estado del manuscrito; SHOW_PREPRINT_PDF
src/app/theme.ts              paleta para canvas (lee los tokens CSS)
public/                       favicon, og.png, robots, sitemap, 404, preprint/ (PDF v4.2 candidata)
scripts/                      prerender.mjs, make-og.py
tests/                        Vitest
docs/                         decisiones, diseño, cerebro, QA, mapa científico, capturas
```

## Publicar (solo con aprobación de Gus)

`npm run build` y copiar el contenido de `dist/` a la raíz de `main` (o a `/v2/` para QA previa). Conservar `og.png`, `.nojekyll`, `NOTA_METODOLOGICA.md`, `tests/`, `tools/`. Detalle en `docs/REDISENO_DECISIONES.md` §5.

## Licencias de dependencias

React, three.js, @react-three/fiber, Zustand, Vite, Vitest, TypeScript: MIT / Apache-2.0. Instrument Sans / Serif: SIL OFL 1.1 (Google Fonts).

© 2026 Gustavo Mora.
