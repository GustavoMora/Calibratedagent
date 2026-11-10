# QA del Laboratorio

Base: `origin/main` en `8495f17`. Rama: `feat/laboratorio-v1-1`.

## Verificaciones

- `npm test`: 52 tests aprobados, seis archivos. Incluye 10.000 semillas, equivalencia matemática, fronteras, enlaces anteriores y nuevos, restricciones narrativas, costo de oportunidad, empates y compatibilidad del veto del cerebro.
- `npm run build`: validación de datos, TypeScript, Vite y prerender aprobados.
- Chromium / Playwright sobre el build: ES y EN, 1440×1000 y 390×844, cinco niveles en cada combinación. Generar reinicia la elección; recargar conserva el registro; sensibilidad no altera la política base; avance manual del flujo; slider operable por teclado; sin errores JavaScript ni desbordamiento de página. Movimiento reducido activado.
- Inspección visual de capturas; tarjetas con espaciado móvil y selector sincronizado con enlaces.
- `git diff --check`: sin errores. Sin cambios en decisionModel.ts, parámetros congelados, paper ni preregistro.
- Chunk específico del Laboratorio: 29,48 kB / 11,26 kB gzip. No se carga el visor 3D en el Laboratorio ni se agregan dependencias a la aplicación.

## Evidencia

[Resultados automatizados](results.json) · [script](browser-qa.cjs)

| Idioma | Desktop | Móvil |
| --- | --- | --- |
| ES | [captura](es-desktop.png) | [captura](es-mobile.png) |
| EN | [captura](en-desktop.png) | [captura](en-mobile.png) |

Para repetir: instalar Playwright en un directorio de herramientas externo al proyecto, ejecutar `npm run preview -- --host 127.0.0.1` en SITE_V2_SOURCE y correr `NODE_PATH=/ruta/node_modules node docs/qa/laboratorio/browser-qa.cjs`. Se usa Chromium local; `CHROMIUM_PATH` permite otra ruta.

Cobertura limitada a Chromium y estas dimensiones. No es una auditoría completa con lector de pantalla ni una prueba en dispositivos físicos. El flujo es manual, sin animación continua, y tiene equivalente textual. Catálogo inicial: cinco familias, dos variantes coherentes por familia y confianza sintética variable.

## Iteración de navegación y entrada directa

Menú principal: enlace Laboratorio en ES/EN desde Inicio e Investigación, comprobado en 390, 1024 y 1440 px (12 recorridos). Capturas: `menu-mobile.png`, `menu-desktop.png`.

Entrada directa: escenario reproducible inicial (semilla 42, nivel 2), instrumentos y visor de nodos visibles sin generar. Los nuevos escenarios también se muestran directamente y reinician elección y flujo. Verificado en ES/EN a 390 y 1440 px, sin errores JavaScript ni overflow. Capturas: `flow-es-390.png`, `flow-es-1440.png`, `flow-en-390.png`, `flow-en-1440.png`. El diagrama presenta relaciones conceptuales; el avance sigue requestFlow.ts, sin simular ejecución real ni concurrencia.

52 tests y build completos aprobados tras esta iteración. El script de QA ahora comprueba reinicio de elección en lugar de ocultamiento del caso. Las capturas iniciales anteriores documentan la primera iteración.
