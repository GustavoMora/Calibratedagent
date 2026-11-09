# Sistema visual · Calibrated Agent v3 «Carbón / Papel»

Fuente: `src/styles/global.css`. Dos temas (`:root` = Carbón; `:root[data-theme='light']` = Papel). La sección v2 queda más abajo como referencia histórica.

## Regla de color

1. Fondo y texto **sin croma**.
2. El acento es la tinta misma (blanco en Carbón, negro en Papel): botón primario, foco, aguja, `p*`.
3. **Solo las decisiones tienen color.** Actuar verde, preguntar ámbar, abstenerse rojo. Escalar (magenta) y recordar (violeta) existen como tokens para la franja de cinco opciones.
4. Nunca solo color: cada decisión lleva icono (✓ ? ⊘) y, en el gráfico de umbral, patrón.
5. Los sellos de evidencia son neutros, en monoespaciado; «pendiente» va con borde punteado.

| Token | Carbón | Papel | Uso |
|---|---|---|---|
| `--bg` / `--bg-2` | `#0A0A0A` / `#0F0F0F` | `#F3EFE6` / `#ECE7DC` | Página, pozos |
| `--surface` / `--surface-2` | `#151515` / `#1D1D1D` | `#FBF9F4` / `#EFEADF` | Tarjetas, paneles |
| `--line` / `--line-2` | `#272727` / `#3D3D3D` | `#D9D2C3` / `#B9B1A0` | Bordes |
| `--ink` / `--ink-2` / `--muted` | `#F5F5F5` / `#BDBDBD` / `#8F8F8F` | `#15130F` / `#48443C` / `#6C675C` | Texto |
| `--accent` / `--on-accent` | `#FFFFFF` / `#0A0A0A` | `#15130F` / `#F7F4EC` | Primario, foco, aguja |
| `--act` / `--ask` / `--abstain` (texto) | `#3DDC84` / `#FFB84D` / `#FF5A4F` | `#116634` / `#965400` / `#B5301F` | Chips, etiquetas |
| `--act-g` / `--ask-g` / `--abstain-g` (gráfico) | iguales al texto | `#1C874E` / `#BD7A00` / `#D8483A` | Arcos, barras, partículas |
| `--escalate` / `--remind` | `#E879C7` / `#B79CFF` | `#A02F82` / `#5B3FC4` | Franja de cinco opciones |

Contraste (lo comprueba `tests/v3.test.ts` en cada build): texto ≥ 4,5:1 sobre `--bg`, `--bg-2`, `--surface` y `--surface-2` en ambos temas; colores gráficos ≥ 3:1 sobre `--bg`; texto sobre acento ≥ 7:1.

`.dark-scope` re-declara los tokens de Carbón: lo usa el escenario 3D, que es oscuro en ambos temas.

## Piezas nuevas

- **Instrumento** (`components/ui/Gauge.tsx`): semicírculo 0–1 con las zonas del modelo (`regions()`), rayita en `p*`, aguja en `p`. Está en el hero (canvas), en cada tarjeta de caso (SVG) y, en vertical, en el riel.
- **Riel de decisión** (`components/ui/Rail.tsx`): 64 px fijos a la derecha desde 1100 px de ancho; 248 px al pasar el mouse o con foco. Barra inferior por debajo de 1100 px.
- **Figuras** (`components/research/Figures.tsx`): mapa de decisión por clase, franjas de auditoría, barra de reparto simulado.

## Movimiento

- Hero: ensamblaje de la esfera 2,4 s → pausa 1,3 s → apertura al instrumento 1,7 s. Después, la aguja y los colores siguen al caso. Solo se dibuja mientras está en pantalla.
- Secciones: aparición escalonada al entrar en pantalla (`.reveal`), una sola vez.
- Agujas de las tarjetas: viajan de 0 a `p` al aparecer.
- `prefers-reduced-motion`: sin animaciones; el hero muestra el instrumento quieto.
- Controles táctiles: mínimo 44 px de alto con puntero grueso.

---

# (Histórico) Sistema visual · Calibrated Agent v2

Fuente: `src/styles/global.css` (tokens en `:root`). Modo único oscuro: es la identidad del proyecto.

## Color

| Token | Valor | Uso | Contraste vs `--bg` / `--surface` |
|---|---|---|---|
| `--bg` | `#090A0D` | Fondo de página y del canvas 3D (mismo tono, sin panel gris) | — |
| `--bg-2` | `#0E1014` | Pozos dentro de tarjetas | — |
| `--surface` | `#15171B` | Tarjetas, paneles | — |
| `--line` / `--line-2` | `#2A2D33` / `#3A3E46` | Bordes | — |
| `--ink` | `#ECE6D8` | Texto principal (marfil) | 15,9 / 14,4 |
| `--ink-2` | `#B9B3A6` | Texto secundario | 9,5 / 8,6 |
| `--muted` | `#8E897E` | Notas, ejes | 5,7 / 5,2 |
| `--gold` | `#D4AF63` | Marca, anillo, p*, CTA | 9,5 / 8,6 |
| `--gold-2` | `#F0D48F` | Valores numéricos, enlaces, foco | 13,7 / 12,4 |
| `--act` | `#6FC28B` | Actuar | 9,2 / 8,3 |
| `--ask` | `#7EB6E8` | Preguntar | 9,2 / 8,3 |
| `--abstain` | `#E88A7A` | Abstenerse | 7,9 / 7,1 |

Todos superan WCAG AA (4,5:1) para texto normal. Texto del botón primario `#15120A` sobre dorado: 9,0:1. Calculado con la fórmula de luminancia relativa WCAG 2.x (script en `QA_REPORT.md`).

**Nunca solo color.** Actuar = relleno sólido + ✓; Preguntar = rayado diagonal + ?; Abstenerse = puntos + ⊘. Leyenda textual persistente.

Regiones del cerebro: colores de `brain.json` (marfil, azul acero, dorado, salvia, lila, gris azulado) atenuados al 16 % cuando no están en foco.

## Tipografía

- **Instrument Serif**: títulos de capítulo, citas de pedidos, nombres de tarjetas.
- **Instrument Sans** (400/500/600): cuerpo, controles, etiquetas.
- **Monoespaciada del sistema**: solo valores (p, p*, sliders), ecuaciones, cita.
- Escala: h1 hero `clamp(2.7rem, 7.4vw, 6rem)`; h2 `clamp(2rem, 4.6vw, 3.4rem)`; cuerpo 17 px / 1,6.

## Espacio y forma

- Gutter `clamp(16px, 4vw, 40px)` (16 px en móvil). Ancho máximo 1180 px (1320 px el escenario 3D).
- Radios: 14 px tarjetas, 8 px pozos, píldora en botones y chips.
- Áreas táctiles ≥ 44 px en botones principales y sliders (input range de 44 px de alto).

## Movimiento

- Ease `cubic-bezier(0.22, 0.61, 0.36, 1)`.
- Hero: ensamblaje esfera + anillo una vez (2,4 s) y queda estático.
- Cerebro: ensamblaje esfera → cerebro una vez por carga (2,2 s). Cámara con amortiguación exponencial (~1,2 s).
- Pedido: 1,15 s por tramo a 1×; velocidad 0,5× / 1× / 2×; pausar, seguir, repetir.
- `prefers-reduced-motion`: sin ensamblajes, cámara instantánea, CSS sin transiciones.

## Estados

- Foco visible: contorno dorado claro de 2 px con 3 px de separación.
- `aria-pressed` en chips, casos y selectores: borde dorado + fondo dorado al 16 %.
- Sección activa en el header: subrayado dorado (desktop) / barra lateral (menú móvil).
- Sellos de evidencia: `SIMULADO` (azul), `HIPOTÉTICO` (ámbar), `OBSERVADO EN PILOTO` (verde), `PENDIENTE` (coral), `DOCUMENTO INTERNO` (marfil).
