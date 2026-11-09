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

---

# v3 «Carbón / Papel» — decisiones (09/11/2026)

Base de esta iteración: rama local `redesign-v2` @ `c5b8009` (fuente v2). El sitio publicado sigue siendo el de `publish-v2` / `main`; **no se hizo push ni se tocó `main`**. Parámetros congelados, semillas, umbrales, protocolos y cifras: sin cambios.

## V3-1. Qué pidió Gus y cómo se resolvió

| Pedido | Resolución |
|---|---|
| Rebranding «más tope de gama», sobre carbón | Paleta sin croma (carbón `#0A0A0A` / tinta `#F5F5F5`). El dorado se retira. El acento es la tinta. **Solo las decisiones tienen color**: actuar verde, preguntar ámbar, abstenerse rojo (lógica de semáforo; el azul se descartó a pedido). |
| Botón modo claro / oscuro | Tema «Papel» (`#F3EFE6` / `#15130F`). Botón en el header; arranca según la preferencia del sistema y recuerda la elección (`localStorage ca-theme`). Un script en `<head>` fija el tema antes del primer pintado. |
| Conservar la esfera de partículas y que transicione al instrumento | Hero en dos actos con las mismas partículas: esfera + anillo (identidad v2) → arco de 0 a 1 coloreado por la decisión del modelo, con aguja en la p del caso. |
| Aprovechar el lado derecho | «Riel de decisión»: tira fija de 64 px que se expande al pasar el mouse o con foco. Medidor vertical del caso en uso, selector de caso, capítulos y sello de evidencia de la sección. En móvil es una barra inferior (reemplaza el botón flotante que tapaba texto). |
| Cerebro más grande | Encuadre de cámara 1,7 → 1,36, escenario 86vh/780 → 94vh/940, panel 370 → 336 px, puntos más grandes. |
| Usar el paquete v4.2 | Título, versión, cita, BibTeX, alcance y estado del manuscrito alineados; PDF enlazado (ver V3-7). |

## V3-2. Supuestos tomados sin consultar

| # | Decisión | Por qué |
|---|---|---|
| D1 | El escenario 3D del cerebro es **siempre oscuro**, también en modo claro (`.dark-scope`). | La nube usa mezcla aditiva; sobre papel se lava. Se lee como una «sala oscura» dentro de la página. |
| D2 | En modo claro los colores de decisión tienen dos variantes: texto (`--act`…) y gráfica (`--act-g`…). | El ámbar vivo no llega a 4,5:1 sobre papel. El texto usa la variante oscura; arcos y barras, una más viva que cumple 3:1. Lo verifican los tests. |
| D3 | El hero recorre solo los tres casos hasta que el lector elige uno en cualquier selector. | Muestra que las zonas cambian con la clase de riesgo sin exigir interacción. Con `prefers-reduced-motion` no hay recorrido ni animación: se dibuja el instrumento quieto. |
| D4 | La marca `p*` del hero es una rayita fina fuera del arco, no una «línea de corte». | Gus señaló que la línea de corte confundía. Los límites se leen por el cambio de color. |
| D5 | Las regiones del cerebro pasan a tonos pálidos sin azul (blanco, lila, arena, verde agua, rosa, gris). Los nodos Actuar / Preguntar / Abstenerse llevan su color de semáforo. | Coherencia con la regla «solo las decisiones tienen color» y con el descarte del azul. Es presentación: `brain.json` solo cambió `color`. |
| D6 | Se agregó la franja «Cinco opciones ante un pedido» con Escalar y Recordar marcadas «Solo en el preprint». | El manuscrito v4.2 trata cinco opciones; el sitio ilustra tres. Se dice explícitamente en lugar de simularlas sin datos. |
| D7 | **El PDF del manuscrito v4.2 candidata se incluye en el build** (`preprint/orquestacion-condicionada-v4.2-candidata.pdf`, sha256 `de6b85c1…560c945`, idéntico al del paquete). | Gus pidió aprovecharlo. El dossier dice que la candidata no es final ni está depositada: por eso el enlace lleva siempre ese rótulo y hay **un interruptor único**, `SHOW_PREPRINT_PDF` en `src/app/site.ts`. Si no debe salir en este push: ponerlo en `false`, borrar `public/preprint/` y volver a construir. |
| D8 | Se retiró «El enlace se activará cuando se deposite». | La v4.2 (C12) no promete depósito futuro. |
| D9 | Las cifras de ECE de la página (0,131 / 0,109, semilla 20261102) **no se tocaron**. | El manuscrito informa otro cálculo (ECE nulo 0,077 / 0,156, semilla 20261025). No son la misma magnitud; decidir si conviven o se reemplazan es del autor. Queda como pendiente editorial. |
| D10 | Piloto: «25 decisiones registradas, 8 evaluables; 16 excluidas por motivos documentados y 1 solo como sensibilidad». | Texto del manuscrito §6. Antes decía «pedidos» y no explicaba las exclusiones. |
| D11 | Se quitó la nota sobre la consola «8/8» del sitio anterior y se retituló «El 97 %». | Eran restos internos sin contexto para un lector nuevo. La aclaración histórica queda acá: la consola «un día delegado» mostraba 8 pedidos simulados procesados, no 8 éxitos, y se retiró de Explorar. |
| D12 | Inglés enlazable con `?lang=en` (el botón actualiza la URL) y `hreflang`. No hay ruta `/en/` propia. | Alcanza para compartir e indexar sin duplicar páginas. El prerenderizado es solo en español. |
| D13 | Prerenderizado estático en el build (`scripts/prerender.mjs`): el HTML de ambas páginas existe sin JavaScript. El cliente vuelve a montar con `createRoot` (sin hidratación). | Buscadores, vistas previas y lectores sin JS veían un `<div>` vacío. Sin JS el cerebro se muestra en su vista 2D. |
| D14 | Nueva dependencia de desarrollo: `@types/node@20.19.43` (versión exacta). | La usa el test de contraste para leer `global.css`. |
| D15 | No se agregó diagrama de confiabilidad. | No hay datos por banda en el repo; dibujarlo exigiría inventarlos. Las figuras nuevas son solo derivadas del modelo o de conteos ya publicados. |
| D16 | Las tres tarjetas de caso muestran instrumento + veredicto + por qué; «qué sabe», «riesgo» y «qué cambiaría» van en un desplegable. | Las tarjetas ocupaban tres pantallas en móvil. No se quitó contenido. |

## V3-3. Bugs del sitio publicado corregidos

1. Investigación desbordaba en móvil (568 px en un viewport de 375): la grilla usaba `1fr` sin mínimo. Ahora `minmax(0, 1fr)`.
2. El botón del footer de Investigación apuntaba a `/investigacion/investigacion/` (404).
3. HTML vacío sin JS → prerenderizado.
4. Inglés sin URL y con meta descripción en español → `?lang=en`, `hreflang`, descripción por idioma, comillas inglesas.
5. Faltaban favicon, `robots.txt`, `sitemap.xml`, `og:description`, `og:url`, 404 propia, JSON-LD. Agregados. `og.png` regenerada (`npm run og`).

## V3-4. Pendientes que no se cerraron

- Sin pruebas con personas, sin dispositivo real, sin lector de pantalla, sin Lighthouse.
- three.js sigue pesando 811 KB (219 KB gzip), cargado en diferido.
- Las ecuaciones siguen en monoespaciado (sin KaTeX).
- La 404 usa rutas absolutas a `/Calibratedagent/`: si cambia el nombre del repo, hay que editarla.
- Pendiente editorial D9 (ECE) y confirmación de D7 (PDF) por parte de Gus.

## V3-5. Cómo llega a GitHub Pages

Igual que en §5: `npm run build` y copiar `dist/*` a la raíz de la rama de publicación. Archivos nuevos respecto de v2: `favicon.svg`, `robots.txt`, `sitemap.xml`, `404.html`, `preprint/`, y `og.png` regenerada. **El push lo hace Bostock.**
