# Mapa de contenido científico

Regla general: ningún parámetro, semilla, umbral, protocolo o resultado fue modificado. Toda cifra viene del sitio v1 (`main@f58fe0a`), de `NOTA_METODOLOGICA.md` o de `tests/test_math_review.py`, y está cubierta por tests (`tests/decisionModel.test.ts`) cuando es derivable.

## Cifras y dónde aparecen

| Cifra | Valor | Sello | Explorar | Investigación | Fuente / verificación |
|---|---|---|---|---|---|
| Parámetros congelados | b = 1, k = 0,2; c = 1/2/4; r = 0,925/0,896/0,646 | HIPOTÉTICO | Umbral (valores congelados) | El modelo, Tres clases | `FROZEN` (Object.freeze) + test |
| p* | 0,892 / 0,926 / 0,938 | HIPOTÉTICO | Casos, Umbral, Cerebro (nodo Regla) | Tres clases (calculado en vivo) | test a 14 decimales vs NOTA §6 |
| pₐ | −4,333 / −1,564 / 0,548 | HIPOTÉTICO | Caso «escritura» | Tres clases | test |
| p₀ | 0,5 / 0,667 / 0,8 | HIPOTÉTICO | Umbral (línea punteada) | Tres clases | test |
| p de los casos | 0,95 / 0,70 / 0,40 | HIPOTÉTICO («confianza hipotética») | Casos, Umbral, Cerebro | — | v1 `v3datos.s1`; decisión = juez publicado (test) |
| Piloto | 25 registrados, 8 evaluables | OBSERVADO EN PILOTO | **Una sola vez**, Evidencia | Resumen, Límites | v1 capa `ca-final.js` |
| 430 pedidos, 215/215 | — | DOCUMENTO INTERNO | Nodo Preregistro | Protocolos | NOTA §2.1 |
| 650–700 casos (DG-E1, H1b) vs 430 (PO430, H1) | — | — | — | Protocolos | v1 capa, tabla «Dos protocolos» |
| 88 % / 12 % / 0 (4.378 / 622 / 0 de 5.000) | semilla 20261025 | SIMULADO | — | Simulaciones | NOTA §8.1 |
| 97 % | definición de `doOk` | SIMULADO | — | Simulaciones (con lo que NO mide) | NOTA §8.2 |
| 0,43 [0,27; 0,60] | Beta(4,2), n = 200, 2.000 réplicas | SIMULADO | — | Simulaciones | NOTA §8.1 |
| Fisher p = 0,571 (506/447 vs 501/448) | δ = 0 | SIMULADO | — | Simulaciones | NOTA §8.3 |
| ECE 0,131 → 0,109 | semilla 20261102, n = 400 | SIMULADO | — | Calibración | NOTA §8.3 |
| 131 por brazo | 0,50 → 0,65, α = 0,05, potencia 0,8 | HIPOTÉTICO | — | Inflación | NOTA §3.1 |
| 21,78 % ruteo | 60 pedidos, semilla 20261103 | DATOS HIPOTÉTICOS | — | Simulaciones | NOTA §8.5 |
| Memoria: 2 brutas / 1 neta | m = 0,5, semilla 20261102 | SIMULADO | — | Simulaciones | NOTA §8.4 |
| Línea de tiempo del preregistro | 18:30 / 18:34 / 18:42 / 18:45; fe de erratas 20:25 | DOCUMENTO INTERNO | — | Protocolos | v1 + fe de erratas |
| M1: e₁, e₀ | p* baja con e₁ − e₀ < 1 | — | Qué asume el modelo (texto) | Supuestos (fórmula) | test |
| M2: 1,938 vs 0,646 | alto, p = 0,40 | — | Qué asume (texto) | Supuestos | test |

## Cifras retiradas o reinterpretadas

- **«8/8»** (reloj del «día delegado»): eran 8 pedidos simulados procesados, no 8 éxitos. Retirado de Explorar; explicado en Investigación · Simulaciones.
- **Porcentajes de la portada v1 (eje del acierto 97 %)**: movidos a Investigación con su definición completa. La portada nueva no muestra ningún porcentaje.
- **Doce modelos inventados / Groq-Gemini**: fuera de Explorar; resumen en Investigación con sello de datos hipotéticos.

## Afirmaciones de estado

- Explorar dice explícitamente: «Propuesta de investigación · preprint no publicado» y «resultados empíricos pendientes».
- No se afirma revisión por pares; las revisiones de Gauss y Turing figuran como internas.
- Paper/DOI: bloque desactivado («El enlace se activará cuando se deposite»). La configuración `CA_PUBLICATION` de v1 no se migró como código: se reactiva cuando haya URL verificada.
- ORCID activo: `https://orcid.org/0009-0004-5276-3066`.

## Diferencias entre protocolos (sin mezclar)

- **Preregistro (PO430)**: H1 primaria = Mantel–Haenszel unilateral sobre 3 clases; Fisher por clase con Holm secundario; H2 ECE+Brier en 200 casos de prueba sin irreducibles; H3 pérdida vs «actuar si p > 0,5».
- **Preprint v4.1 (DG-E1)**: primaria H1b (regret de calibración); inflación es H4.
- La página sigue el preregistro para el Experimento 1 y nombra los dos protocolos por separado.

## Pendientes que la página declara (no resueltos aquí)

ECE ancho igual vs masa igual; pareo no modelado por los tests agregados; potencia y tamaño efectivo en la franja; empates del calibrador isotónico; bootstrap por familia (18 vs 24); política «preguntar y re-optimizar». Todo pendiente de Gauss / Gus.
