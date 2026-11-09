# Cerebro v2 · especificación de interacción

Metáfora didáctica de un sistema conceptual. **No** es anatomía de un LLM ni la implementación del experimento. Ningún modelo se ejecuta.

## Fuentes de verdad

| Qué | Dónde |
|---|---|
| Regiones, nodos, enlaces, textos ES/EN, etapas del flujo | `src/data/brain.json` |
| Tres casos (p ilustrativa, clase, irreversibilidad) | `src/data/scenarios.json` |
| Fórmulas y decisión | `src/domain/decisionModel.ts` (una sola vez) |
| Viaje del pedido (estado, tramo, progreso, resultado) | `src/simulation/requestFlow.ts` (puro) |
| Navegación y selección | `src/store/navigation.ts` (Zustand) |
| Validación de datos | `src/data/validate.ts` → errores visibles en la página (`DataErrors`) y test de build |

## Estados y transiciones

`brain | region | node | flow`, tipados (`BrainView`). Permitidas:

| Desde → | brain | region | node | flow |
|---|---|---|---|---|
| brain | — | ✓ | ✓ | ✓ |
| region | ✓ | ✓ | ✓ | ✓ |
| node | ✓ | ✓ | ✓ | ✓ |
| flow | ✓ | ✓ | ✓ | ✗ |

Subir un nivel (`parentView`): node → region → brain; flow → brain. Disparadores: **Escape** (si el cerebro está en pantalla), **clic en el fondo** sin arrastre, breadcrumb, botones «Subir un nivel» / «Volver al cerebro». Salir de `flow` reinicia el pedido para que escena y feed nunca se contradigan.

## Niveles

| Nivel | Cámara | Escena | Panel |
|---|---|---|---|
| 0 · Cerebro | 3/4 lateral, radio 1,7, cerebro completo con anillo | Todas las regiones a pleno, etiquetas de región | Qué es + lista de 6 regiones + selector de caso + «Enviar un pedido» |
| 1 · Región | Objetivo a 62 % del centro de la región (contexto visible), radio 1,35 | Región a pleno, resto al 16 % (no desaparece) | Resumen + piezas + «Enviar un pedido» si la región está en la ruta |
| 2 · Nodo | Objetivo en el nodo, radio 0,85 | Nodo dorado, vecinos a pleno, enlaces dorados | Sello de evidencia, descripción, ejemplo, enlace a fuente, conexiones navegables, subir/volver |
| 3 · Flujo | Vista lateral (ruta frente → atrás completa), radio 1,55 | Nube al 50 %, nodos de la ruta destacados, partícula + estela, tramos recorridos en dorado | Caso, controles (pausar/seguir/repetir/velocidad), feed paso a paso con `aria-live`, decisión y por qué |

**Fit-to-view con safe areas:** el panel lateral (desktop) o la hoja inferior (móvil) y la franja de chips se miden con `ResizeObserver`. La cámara usa `setViewOffset` para correr el centro óptico y calcula la distancia para que el radio del encuadre entre en el área visible real. No se recorta 1/3 de la escena.

## Trayecto de un pedido

`Entrada (pedido) → Información disponible → Confianza declarada → Calibración → Regla y vetos → [Confirmar lo irreversible] → Decisión → [Persona]`

| Caso | Clase | p | Decisión | Ruta final |
|---|---|---|---|---|
| Redondear | bajo | 0,95 | Actuar | … regla → actuar |
| Borrador a Compras | medio | 0,70 | Preguntar | … regla → preguntar → persona |
| Escritura | alto (irreversible) | 0,40 | Abstenerse | … regla → veto → abstenerse → persona |

Veto ilustrativo: si un caso irreversible diera «actuar», se convierte en «preguntar» (confirmación). Test: `tests/flow.test.ts`.

Un único reloj: en 3D lo avanza el `useFrame` del componente `Request`; en la vista 2D, un `requestAnimationFrame` equivalente. Nunca los dos. Nada se dispara solo: sin pedidos en bucle.

## Entradas

- Mouse: arrastrar gira (yaw/pitch acotado); clic en esfera de región o nodo, o en su etiqueta.
- Touch: arrastre horizontal gira; vertical deja scrollear la página (`touch-action: pan-y`).
- Teclado: chips de región, listas del panel, breadcrumb y controles son botones nativos; foco al título del panel al cambiar de nivel; Escape sube.
- Lector de pantalla: canvas `aria-hidden`; el panel y la vista 2D llevan toda la información.

## Fallbacks

- **Sin WebGL**: se detecta al montar; se muestra la vista 2D (mismas regiones, nodos, estado y flujo) con aviso.
- **Vista accesible (2D)**: conmutador disponible siempre.
- **Movimiento reducido**: sin ensamblaje, cámara instantánea.
- **Fuera de pantalla**: `frameloop="never"`; three.js se carga en un chunk diferido (no bloquea la lectura inicial).
- Recursos: geometrías/materiales en `useMemo`, `dispose()` al desmontar; textura de halo compartida.
