# QA · prototipo v2 (Hito 1)

Fecha: 2026-11-08. Entorno: macOS (Darwin 25.6), Node 18.10, build de producción servido con `vite preview`, navegador del panel de Claude (Chromium) con emulación de viewport.

> **Pruebas con personas: NO realizadas.** No hubo usuarios externos disponibles en esta sesión. Este prototipo se entrega **para test**; no se afirma aprobación humana. Ver §5 con el guion listo para las 5 tareas.

## 1. Automatizado (ejecución real)

| Prueba | Resultado |
|---|---|
| `npm run test` (Vitest) | **25/25** ✓ — `decisionModel` 14, `data` 4, `flow` 7 |
| Reproduce p*, pₐ, p₀ publicados en las 3 clases (3 y 14 decimales) | ✓ |
| Argmax = regla por umbrales en las 3 clases congeladas (grilla 0,005) | ✓ |
| Contraejemplo fuera del preregistro: `decide()` se abstiene donde U(actuar) < 0 | ✓ |
| M1 (e₁, e₀) y M2 (1,938 vs 0,646) | ✓ |
| `brain.json` y `scenarios.json` válidos; el validador detecta id duplicado, enlace roto y EN faltante | ✓ |
| Decisión de cada caso = juez publicado | ✓ |
| Flujo: rutas, veto, pausa (no avanza), reanudar, termina, no hay bucle | ✓ |
| `tsc --noEmit` estricto | ✓ sin errores |
| `npm run build` (valida datos → tsc → vite) | ✓ |

Tests Python originales (`tests/test_math_review.py`) no se tocaron.

## 2. Navegador (ejecución real, inspección visual)

| Chequeo | 1440×900 | 375×812 | Notas |
|---|---|---|---|
| Hero legible, tesis + CTA | ✓ | ✓ | Motivo atenuado en móvil para no tapar el título |
| Tres casos, formato único, decisión visible | ✓ | ✓ (1 columna) | |
| Umbral: mover c 2 → 5 actualiza p* 0,926 → 0,963, antes/después y frase causal | ✓ | — | Probado vía `form_input` |
| Cerebro nivel 0: cerebro completo + anillo + etiquetas alineadas | ✓ | ✓ | Bug encontrado y corregido: etiquetas proyectadas con matriz del frame anterior |
| Nivel 1 región: contexto atenuado, no se recorta | ✓ | — | |
| Nivel 2 nodo: ficha, conexiones, enlaces dorados | ✓ | — | |
| Nivel 3 flujo: partícula, feed paso a paso sincronizado | ✓ | — | Feed verificado vía DOM (`done/now/next`) |
| Escape sube de nivel | ✓ | — | Región → cerebro |
| Safe areas: panel lateral / hoja inferior / chips | ✓ | ✓ | Bug corregido: en móvil el cerebro quedaba bajo los chips |
| FAB «Probar un caso» no tapa el cerebro | — | ✓ | Se oculta en Casos y Cerebro |
| Sin scroll horizontal | ✓ | ✓ (`scrollWidth = 375`) | |
| Investigación EN (`?lang=en`): título, `lang`, ecuaciones | ✓ | — | Bug corregido: ecuaciones quedaban en español |
| Consola sin errores | ✓ | | |
| IDs únicos, botones con nombre, 1 `h1` | ✓ | | Script de inspección |
| Enlaces internos relativos sin 404 | ✓ | | `./investigacion/`, anclas `#…` |

**Limitación de la medición**: el panel del navegador estaba oculto, por lo que `requestAnimationFrame` corría solo al capturar. Los tiempos de animación (2,2 s / 1,15 s por tramo) y la fluidez **no se midieron**; no se afirma ningún FPS.

Capturas en `docs/screenshots/` (01–10).

## 3. Contraste (cálculo WCAG 2.x)

Todos los tokens de texto ≥ 4,5:1 sobre `--bg` y `--surface` (mínimo: `--muted` 5,15:1 sobre superficie). Detalle en `DESIGN_SYSTEM.md`.

## 4. No probado todavía (pendiente para Hito 2)

- Safari macOS y Safari iPhone reales; Chrome desktop real (solo Chromium emulado).
- Anchos 320, 430, 768 (probados 375 y 1440).
- Navegador sin WebGL real (la ruta de fallback 2D existe y se puede forzar con el botón «Vista accesible (2D)»; no se probó con WebGL deshabilitado).
- Lector de pantalla (VoiceOver), navegación solo con teclado de punta a punta.
- `prefers-reduced-motion` en dispositivo.
- Memoria y tiempo de carga en dispositivo real. Tamaños de build: JS inicial Explorar ≈ 9 KB + 62 KB (gzip, React compartido); three.js ≈ 219 KB gzip en chunk diferido.

## 5. Guion para las pruebas con personas (5 participantes, sin ayuda)

1. 20 s en la portada → «¿Qué decisión estudia este sitio?»
2. «Encontrá los tres casos y decime por qué cambia la decisión.»
3. «Hacé que preguntar cueste más. ¿Para dónde se movió el umbral y por qué?» (y lo mismo con el error)
4. «Entrá al cerebro, abrí la región Regla, abrí un nodo, enviá un pedido y volvé al cerebro completo.»
5. «¿Dónde están los límites del experimento? ¿Y la investigación completa?»

Criterio: ≥ 4/5 completan cada tarea sin ayuda. Registrar confusiones; no sustituir por simulaciones de agentes.

---

# QA · v3 «Carbón / Papel» (09/11/2026)

Entorno: macOS (Darwin 25.6), servidor de desarrollo de Vite, navegador del panel de Claude (Chromium) con emulación de viewport. **Pruebas con personas: no realizadas.**

## 1. Automatizado (ejecución real)

| Prueba | Resultado |
|---|---|
| `npm run test` (Vitest) | **35/35** ✓ — `decisionModel` 14, `data` 4, `flow` 7, `v3` 10 |
| Contraste AA del texto en Carbón y Papel (6 colores × 4 fondos × 2 temas) | ✓ (el test detectó tres valores fuera de norma en Papel; se corrigieron) |
| Colores gráficos ≥ 3:1; texto sobre acento ≥ 7:1 | ✓ |
| Franjas de auditoría derivadas = las publicadas | ✓ |
| Zonas del instrumento: solo riesgo alto tiene abstención | ✓ |
| El sitio no promete depósito ni cita «versión 3» | ✓ |
| `tsc --noEmit` estricto | ✓ |
| `npm run build` (valida → tsc → vite → prerender) | ✓ — prerender: Explorar 35 010 caracteres, Investigación 35 288 |
| sha256 del PDF incluido = `SHA256SUMS` del paquete v4.2 | ✓ |

## 2. Navegador (inspección real)

| Qué | 1440×900 | 375×812 |
|---|---|---|
| Hero: esfera → instrumento, aguja en la p del caso | ✓ Carbón y Papel | ✓ |
| Riel: compacto, expandido, cambio de caso | ✓ | barra inferior ✓ |
| Tres casos con instrumento y desplegable | ✓ ambos temas | ✓ |
| Umbral: lectura única de p*, etiqueta «Actuar» sin pisarse | ✓ | no revisado en detalle |
| Cerebro más grande; recorrido con explicación por estación | ✓ (oscuro también en Papel) | ✓ nivel cerebro |
| Evidencia: grilla 8/25 | ✓ | no revisado |
| Investigación: figuras nuevas, PDF, cita v4.2 | ✓ | sin desborde horizontal (375 = 375) ✓ |
| Inglés con `?lang=en`: idioma, descripción y comillas | — | ✓ |
| Consola | sin errores (un aviso de `createRoot` duplicado aparece solo con recarga en caliente del servidor de desarrollo) | — |

## 3. No probado

- Dispositivo táctil real, Safari, Firefox.
- Lector de pantalla y navegación completa por teclado.
- Lighthouse / rendimiento medido.
- El build de producción servido desde `/Calibratedagent/` (se inspeccionó el servidor de desarrollo y se validó el HTML de `dist/`).
- Anchos intermedios (768–1100 px) más allá de una captura a 1180 px.
