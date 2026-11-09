# Rediseño de experiencia v2 — decisiones

Base: `main` @ `f58fe0ab493cea20b470e0ce5fdf977dd8f859db`. Rama local: `redesign-v2`. Estado: **Hito 1 (prototipo funcional)**, con partes del Hito 2 adelantadas. Nada publicado; `main` sin tocar.

## 1. Qué había (inventario del `index.html` de ~1 MB)

Una sola página larga con 14 bloques en secuencia, cada uno con tres botones discretos «La teoría / Probar con un modelo / Copiar el prompt»:

| # | Bloque v1 | Destino v2 | Razón |
|---|---|---|---|
| 0 | Portada + sellos de evidencia + leyenda de sellos | **Explorar · Hero** (texto) + **Evidencia** (sellos) | La portada mezclaba tesis, siete sellos y dos ejes. Se deja tesis + ejemplo de una línea. |
| 1 | «¿Qué debería hacer el agente?» (3 pedidos, elegir respuesta, regla y juez) | **Explorar · Tres casos** | Se conserva el contenido, se quita el paso «elegí antes», se fija un formato único de tarjeta y se agrega «¿Qué cambiaría esta decisión?». |
| 2 | Umbral personal (2 palancas + anillo) | **Explorar · Cómo decide · Probá el umbral** | Rediseñado: p, p*, pₐ y p₀ separados, causa→efecto junto a cada slider, antes/después, leyenda persistente con patrón e icono. |
| 3 | El cerebro (mapa + fichas) | **Explorar · Cerebro** niveles 0–2 | Una sola escena. Regiones reorganizadas por función (ver §3). |
| 4 | El pliegue + la cinta y sus partes (segundo grafo) | **Cerebro · nivel 3 (flujo)** | Eliminado como gráfico autónomo. El «pedido que pasa por la regla» es ahora el flujo del mismo cerebro. |
| 5 | Romperlo (tablero 5.000 pedidos, auditoría, pérdida) | **Investigación · Simulaciones / Inflación** | Cifras técnicas fuera de la lectura no experta. |
| 6 | La regla derivada (3 rectas) | **Investigación · El modelo** (interactivo) | Se mantiene como gráfico vivo con b, c, k, r. |
| 7 | Calibración paso a paso | **Investigación · Calibración** | Texto + cifras SIMULADO con procedencia. |
| 8 | Inflación y auditoría + potencia | **Investigación · Inflación y auditoría** | |
| 9 | Tres clases de riesgo | **Investigación · Tres clases** (tabla calculada en vivo desde el dominio) | |
| 10 | El experimento en marcha (línea de tiempo, diseño, H1–H3) | **Investigación · Protocolos / Hipótesis** | |
| 11 | Todos los modelos (12 modelos inventados, ruteo) | **Investigación · Simulaciones** (resumen) | Fuera de la tesis principal; datos hipotéticos. |
| 12 | Centro de mando: un día delegado (consola, «8/8») | **Eliminado de Explorar**; resumen en Investigación | Redundante con el flujo del cerebro. «8/8» eran 8 pedidos simulados del reloj, no 8 éxitos: se documenta y se retira. |
| 13 | Límites, método, autoría, cita, BibTeX | **Investigación · Límites / Fuentes** + **pie de autor** | |
| — | «Probar con un modelo» (prompts copiables en cada bloque) | **Eliminado** | Repetía el mismo texto 14 veces; no ayuda a entender. Los parámetros congelados quedan en Investigación. |

Resultado: Explorar pasa de 14 bloques a **5 capítulos** (hero, casos, cómo decide, cerebro, evidencia) + pie de autor. Todo lo técnico se conserva en Investigación.

## 2. Dos capas

- **Explorar** (`/index.html`): lectura no experta, 2 chapter openers fuertes (casos, cerebro) y uno contenido (cómo decide). Sin fórmulas antes de la definición del problema.
- **Investigación** (`/investigacion/index.html`): página HTML real (no ruta SPA → sin 404 en GitHub Pages), índice fijo con sección activa, anclas por sección, glosario, BibTeX copiable.
- Acceso permanente: botón «Investigación completa» en el header (dorado) + CTAs de contexto desde «Qué asume el modelo» y «Evidencia».
- ES/EN con un toggle en el header, `?lang=en` como enlace profundo y preferencia recordada en `localStorage` (con try/catch).

## 3. Cerebro: qué se reorganizó

v1 tenía regiones «Fuentes / Skills / Verificación / Procesamiento (equipo) / Centro de mando / Autor». v2 las reordena por **función en la decisión**, sin inventar piezas:

- Entrada (pedido, información disponible) — *ilustración*.
- Confianza (confianza declarada, calibrador, auditoría) — tomado de «La cinta y sus partes».
- Regla / centro de mando (costos, regla, confirmar lo irreversible).
- Decisiones (actuar, preguntar, abstenerse, persona).
- Fuentes (4 referencias externas + preregistro).
- Construcción (autor, equipo de agentes, skills y tests, Claude) — fusiona Skills + Verificación + Procesamiento + Autor.

Nada del prototipo laboral «Digital Brain» (líder, constructores, revisor adversarial, métricas de agentes) se importó. Solo el patrón: 4 niveles de zoom semántico, una fuente de datos, un simulador, breadcrumb/Escape.

## 4. Decisiones de diseño y supuestos tomados sin consultar

| Decisión | Por qué |
|---|---|
| Los tres casos son los del banco piloto sintético de v1 (redondear / borrador a Compras / escritura) en lugar de los ejemplos genéricos del brief («resumir documento», «editar archivo ambiguo») | Ya existen, tienen texto ES/EN revisado, juez publicado y clase de riesgo congelada; cubren exactamente actuar / preguntar / abstenerse. Inventar casos nuevos agregaba riesgo científico. |
| Veto de irreversibles como regla **ilustrativa** separada de los umbrales | El brief pide que los vetos prevalezcan. En v1 existía como regla de la consola («No hacer nada irreversible sin confirmar»), no en el modelo congelado. Se etiqueta como ilustración. En el caso «escritura» el veto no cambia el resultado (ya es abstenerse). |
| Sin `@react-three/drei` ni `postprocessing` | El brief los marca como no obligatorios. El brillo se logra con sprites aditivos y shader de puntos; menos peso y dependencias. |
| Render 3D a demanda (`frameloop="demand"`) y `never` fuera de pantalla | Nada se anima indefinidamente; la escena solo pide frames mientras la cámara se mueve o un pedido viaja. |
| Etiquetas HTML proyectadas (no texto WebGL) | Legibles, nítidas, clicables; el bloom nunca tapa información. |
| La decisión en vivo usa `decide()` (argmax), no la regla por umbrales | La regla por umbrales falla fuera de los parámetros congelados (NOTA §6); el argmax es correcto en todos los casos. |
| Sliders del umbral: solo k y c, con b y r fijos de la clase del caso | Es la pregunta del brief («costo de preguntar y del error»). b y r se exploran en Investigación. |
| El hero usa canvas 2D (no Three) | Una sola escena 3D protagonista; el motivo esfera+anillo del hero se resuelve en 2,4 s y queda estático. |
| Paleta: se mantienen negro/marfil/dorado; actuar verde, preguntar azul, abstenerse coral | Colores funcionales distintos del dorado de marca; cada uno con patrón e icono. |
| `base: './'` en Vite | El build funciona en `/Calibratedagent/` y en cualquier subcarpeta. |

## 5. Cómo llega a GitHub Pages sin pisar `main`

1. El build (`npm run build`) genera `dist/` con `index.html`, `investigacion/index.html` y `assets/`.
2. **No** se tocó el `index.html` publicado. Propuesta para cuando Gus apruebe: copiar `dist/*` a la raíz de `main` (reemplaza `index.html`, agrega `investigacion/` y `assets/`), conservar `og.png`, `.nojekyll`, `NOTA_METODOLOGICA.md`, `tests/`, `tools/`, `layer/` (histórico). Alternativa más segura: publicar primero en `/v2/` dentro de `main` para QA en producción, luego promover.
3. Pages publica desde `main` (no desde `master`).
