# Sistema visual · Calibrated Agent v2

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
