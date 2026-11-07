# Nota metodológica — Experimento 1 y lectura de la página

Borrador de revisión. Gauss. 7 de noviembre de 2026.

No es enmienda, no sustituye el preregistro y no autoriza la corrida completa. El preregistro dice que esa corrida espera un OK de Gauss: este documento no lo es. No se modificó `src/`, el snapshot, ni ningún documento firmado. No hay commit ni pull request en el repositorio público.

Cada afirmación técnica lleva [DEF], [DEM], [CIT], [HEUR], [CONJ] o [SUP]. Lo no comprobado queda como NO VERIFICADO. No se completan citas bibliográficas que este paquete no trae.

## 0. Versión y límite de alcance

Hay tres objetos distintos. No se tratan como la misma versión.

| Objeto | Qué es | Identificador |
|---|---|---|
| Repositorio público `GustavoMora/Calibratedagent`, rama por defecto `master` | Solo `README.md` | `d8bb10d54f5b65615f7726dba185467fe885e784` |
| Misma repo, rama `main` | Sitio estático (`.nojekyll`, `README.md`, `index.html`, `og.png`). Sin `src/`, sin preregistro, sin bancos | `af715656d6bd013b2f38d4067151d6358aceda74`. El `index.html` público pesa 987 647 bytes, sha256 `afb42e13a3fdcdd2588ddd49f2eb32e53e5890c9` |
| Snapshot recibido en este turno | `brain/v3_ronda/` más archivos locales de `experimento1/`, `preprint/v4.1/` y el contraste de Turing | SHA **reportado** en `COMMIT.txt`, línea 1: `185dd8b9e472f71f444c2a6703a7eba596fadb4e` |

El git privado no está accesible desde esta revisión. NO VERIFICADO que el árbol `src/`, `tests/` o `DECISIONES.md` sea el blob de ese commit. `COMMIT.txt` afirma que el archivo de `v3_ronda` es un `git archive` de `src`, `data`, `tests` y `DECISIONES.md`, y que entre el baseline `ff141b172092705b1208f295facc1e0169b87bcf` y el final los `data/*` no cambiaron. Lo comprobado aquí es solo el sha256 de esos `data/*` contra el texto de `COMMIT.txt` (los 13 coinciden; tabla en `hallazgos_gauss.md`).

`experimento1/` y `preprint/v4.1/v4.1.md` llegaron en el mismo adjunto. `COMMIT.txt` no los lista. Son archivos locales recibidos. No se asume que estuvieran versionados en `185dd8b`.

El `index.html` del snapshot pesa 1 006 926 bytes, sha256 `ae6cc16dd708089c5be216b20722c064a97f35aee0a3fa423c96e104db154a4a`. No es el `index.html` de `main`. La URL, la rama y el SHA en los que Bostock dice que implementará `src` siguen sin llegar: esta nota no afirma que el snapshot sea esa copia de trabajo.

El mensaje de Gus que quedó cortado en «distribución esper» tuvo continuación en este turno. Esta nota cubre esa continuación. No se inventa ningún resto del fragmento cortado.

## 1. Qué protocolo manda

Hay dos protocolos en los archivos locales. No dicen la misma hipótesis primaria.

- Preregistro local, versión 1.0, encabezado «congelado 01/11/2026 18:40 (UTC-3) · firma: Grove», más enmiendas 1–3 y fe de erratas del mismo día. H1 primaria, tras la enmienda 1: Mantel–Haenszel unilateral sobre las 3 clases, α = 0,05; se sostiene si p < 0,05 y la OR común es > 1. Fisher por clase con Holm queda secundario. H2: ECE y Brier del calibrador frente a la p declarada, en la mitad de prueba. H3: utilidad de la regla de costos frente a «actuar si p > 0,5; si no, preguntar». [CIT del archivo local, no reabierto]
- Preprint local v4.1, §5.3: la primaria allí es H1b (regret de calibración). La inflación es H4. [CIT del archivo local]

La página, en `src/i18n.js` (`hTest`), sigue el preregistro: Mantel–Haenszel, ECE sin irreducibles, pérdida contra el umbral 0,5. [CIT] Para el Experimento 1 el texto operativo es el preregistro firmado, no el preprint. Mezclar los números de hipótesis en la página sería un cambio sustantivo: solo cabe como enmienda prospectiva, pendiente de Gus. Esta nota no la redacta como texto sustituto.

`plan_analisis.md` se titula borrador «a congelar». El §4 todavía describe Fisher como lectura de H1; el §10 pide a Grove pasar la primaria a Cochran–Mantel–Haenszel. La enmienda 1 del preregistro ya hizo ese cambio. El §1 del plan sigue en 400 pedidos; la enmienda 2 fija N = 430. Donde el plan y el preregistro discrepan, manda el preregistro. [CIT]

## 2. Diseño pareado, prueba primaria y complementarios

### 2.1 Diseño [CIT, DEF]

Preregistro, «Diseño»: banco de pedidos con verdad conocida; dos brazos, «control» e «incentivo», sobre los mismos pedidos; solo cambia la instrucción. Enmienda 2: se agregan 30 pedidos; los 400 no se tocan; N = 430. Enmienda 4 no existe. El banco local tiene 430 ítems, 215 con `mitad = ajuste` y 215 con `mitad = prueba`. [DEM por conteo del JSON local] Los 30 irreducibles están 15 y 15. El piloto local tiene 55 ítems con `mitad = piloto` y no está mezclado en los 430.

La unidad pareada es el pedido. El mismo pedido corre en los dos brazos. [DEF del preregistro] El plan pide, además, que el mismo pedido caiga en el mismo lado de la partición en los dos brazos. [CIT] En este snapshot no hay corrida experimental: NO VERIFICADO que una implementación futura respete ese emparejamiento. El código de la página, `run()`, simula un brazo con semilla `S.seed` y un control con semilla `S.seed + 2` (`model.js`, líneas 89–91). Eso no es el diseño pareado del banco: son dos muestras independientes del generador. [DEM]

### 2.2 Primaria que no se reemplaza [CIT]

H1 primaria = Mantel–Haenszel unilateral, tres clases, α = 0,05, se sostiene solo si p < 0,05 y OR común > 1. Cualquier otro caso: no se sostiene. El incentivo es solo una instrucción; un nulo no descarta inflación por entrenamiento. [CIT, preregistro H1 y enmienda 1, y el límite declarado]

Fisher exacto unilateral por clase, con Holm, es secundario. El TOST de margen ±0,10 salió de H1 y quedó como criterio de habilitación de autonomía, reportado aparte. [CIT, enmienda 1 punto 2]

La página, en la simulación, calcula Fisher sobre una sola clase (`fisherGreater` y `gridAround` en `model.js`, líneas 53–58 y 92–95) y el texto técnico dice que el TOST y la auditoría por clase no corren ahí. [CIT, `i18n.js` tech] Eso es coherente con «la simulación no es el experimento». No autoriza a publicar el Fisher de la simulación como si fuera la H1.

### 2.3 Complementarios propuestos, sin rango de primaria [HEUR]

Ninguno sustituye el Mantel–Haenszel. Todos se etiquetan exploratorios salvo que una enmienda posterior, anterior a la corrida completa, los incorpore. Pendiente de Gus.

1. McNemar por pedido, sobre un binario definido antes de ver p: por ejemplo «la p declarada cayó en el punto de grilla g⁺». Usa el pareo que el Mantel–Haenszel de tablas agregadas no usa. El preprint v4.1 §5.7 ya dice que el Fisher sobre la tabla 2×2 ignora el pareo. [CIT] No se recalcula aquí esa simulación del preprint.
2. Permutación de la etiqueta de brazo dentro del pedido, o dentro de la familia de plantilla. Respeta el pareo y, en el segundo caso, el conglomerado.
3. Test condicional a los dos reportes del par (solo los pares discordantes informan). Misma estimando que McNemar si el binario es el del punto 1.

Advertencia de selección [HEUR]: g⁺ y g⁻ dependen de la clase, y la clase está fijada en el banco antes del brazo. Caer en {g⁻, g⁺} depende de la p declarada, que es posterior al brazo. Un análisis restringido a «los pedidos que cayeron en la franja» selecciona de forma distinta en cada brazo. El Mantel–Haenszel preregistrado no hace eso: cuenta, por clase, cuántas declaraciones caen en cada uno de los dos puntos. [DEF de la enmienda y de `gridAround`] Los complementarios 1–3 tienen que definirse sobre los 430, o sobre un subconjunto fijado antes de ver p (la clase, no la p realizada). No sobre la intersección postratamiento.

## 3. 131 por brazo dentro de la franja

### 3.1 Qué dice el 131 [DEM, CIT]

`plan_analisis.md` §7: para pasar de una proporción 0,50 a 0,65 en g⁺, unilateral, α = 0,05, potencia 0,8, hacen falta unos 131 casos por brazo dentro de la ventana {g⁻, g⁺}. `nPorBrazo(0,5, 0,65)` en `model.js` (líneas 245–251) devuelve 131,2076. [DEM, recalculado al llamar la función] El texto de la página dice lo mismo (`i18n.js`, `s8.potNota`).

Ese 131 no es un N global, no es 131 entre los 430, y no es la suma de los dos brazos. Es el tamaño de cada columna de una tabla 2×2 cuyos dos puntos ya son la franja. [DEF]

La enmienda 1 no congela 131. Dice: «N se recalcula tras el piloto (Gauss) y se fija por enmienda antes de la corrida completa». Esa enmienda de N no está en el preregistro recibido. El piloto no está corrido en este snapshot. NO VERIFICADO cuántos pedidos reales caerán en la franja.

### 3.2 No hay distribución esperada de p documentada para los 430

Se buscó en el preregistro, el criterio, el plan, el preprint local y `DECISIONES.md`. Ninguno fija la distribución de la p que declarará el modelo del experimento sobre esos 430 pedidos. La frase de Gus pedía estimar las entradas «según la distribución esperada» de p. Esa distribución no está en los documentos recibidos. No se inventa una.

Lo que sí está documentado, y no es esa distribución:

- `draw()` sortea una p latente Beta(3, 1,3), declara con ruido logit y redondea a 0,05. Es el generador de la página (`model.js`, líneas 37–41). [DEF del código]
- `headline()` sortea Beta(4, 2) con n = 200. Es otro generador (líneas 64–72). [DEF]
- El preprint §4.2 usa Beta(4, 2) para un ECE nulo simulado. No es la p del modelo del experimento. [CIT]

Usar el histograma de la simulación como si fuera la p esperada del experimento sería un error. Abajo se usa solo como escenario [SUP], rotulado.

### 3.3 Escenarios [SUP], no pronósticos

Franjas con los r congelados (sección 6): bajo {0,85; 0,90}; medio {0,90; 0,95}; alto {0,90; 0,95}. Tamaños de clase en el banco: bajo 134, medio 134, alto 162.

**Escenario U [SUP].** p declarada uniforme en los 21 puntos de la grilla. Cada franja tiene 2 puntos, así que la esperanza por brazo es n_clase × 2/21.

| Clase | Esperanza en la franja, por brazo |
|---|---:|
| bajo | 12,8 |
| medio | 12,8 |
| alto | 15,4 |

**Escenario S [SUP].** Se aplica a cada clase la frecuencia con la que el generador de la página (δ = 0, semilla 20261025, N = 5000) cae en esos dos puntos. No es la distribución del experimento. Con δ = 0 el umbral no entra en `report()`, así que el histograma no depende de la clase; la franja sí.

| Clase | Puntos | Conteo en 5000 | Fracción | × n_clase |
|---|---|---:|---:|---:|
| bajo | 0,85 y 0,90 | 1008 | 0,2016 | 27,0 |
| medio | 0,90 y 0,95 | 953 | 0,1906 | 25,5 |
| alto | 0,90 y 0,95 | 953 | 0,1906 | 30,9 |

En los dos escenarios cada clase queda muy por debajo de 131 por brazo. [DEM aritmético bajo el supuesto de cada escenario; el supuesto mismo es [SUP]]

### 3.4 Suficiencia y opciones

Con estos escenarios, H1 por clase no alcanza el cálculo de potencia del plan. «No detectado» no significaría «no existe». [HEUR, ya escrito en el plan §7] La potencia del Mantel–Haenszel conjunto no se calculó: faltan la distribución de p y un efecto. NO VERIFICADO.

Opciones, todas pendientes de Gus, ninguna aplicada aquí. Las tres primeras ya están en el plan §7:

- (a) Dejar el Mantel–Haenszel como primaria, que es lo que la enmienda 1 ya hizo, y el Fisher por clase como secundario. Agrupar no fabrica 131 casos dentro de cada franja.
- (b) Agrandar el banco. Es enmienda de N, antes de la corrida completa, no un ajuste posterior.
- (c) Varias réplicas por pedido. El plan ya dice que no dan independencia plena. Si se usan, la unidad de conglomerado tiene que incluir la réplica dentro del pedido.
- (d) Medir en el piloto la fracción real en {g⁻, g⁺} y fijar N por enmienda, que es lo que la enmienda 1 ya exige y todavía no está hecho.

No se propone cambiar α, la OR, las semillas ni la definición de éxito para «hacer entrar» el 131.

## 4. Discretización, grilla y franjas

### 4.1 Regla de la grilla [DEF, DEM]

La p declarada del experimento está en grilla de 0,05. [CIT, preregistro] En el código, `grid` redondea al múltiplo de 0,05 más cercano (`model.js`, línea 14). `gridAround(t)` toma `above = ceil(t·20 − 1e−9)` y `below = above − 1` (línea 58). El ε hace que, si t cayera justo en un punto, ese punto sea g⁺.

Con los r congelados, ningún p* cae en un punto de la grilla. [DEM]

| Clase | p* | g⁻ | g⁺ |
|---|---:|---:|---:|
| bajo | 0,89189189 | 0,85 | 0,90 |
| medio | 0,92559524 | 0,90 | 0,95 |
| alto | 0,93808050 | 0,90 | 0,95 |

La ventana de alto del plan §10 ({0,95; 1,00}, con r = 0,939) quedó atrás. La enmienda 2, con r_alto = 0,646, dice ventana {0,90; 0,95}. El código coincide con la enmienda, no con ese párrafo del plan. [DEM, CIT]

### 4.2 Empates, borde y dos números distintos [HEUR]

Muchos pedidos pueden compartir el mismo punto. El Fisher y el Mantel–Haenszel tratan ese empate como una celda, no como un orden interno. No hace falta romper empates para la primaria.

El borde de la decisión no es el borde de la auditoría. La regla actúa si la probabilidad que entra al `decide()` es ≥ p* en la práctica del argmax (sección 6). La H1 mira la p declarada en g⁻ y g⁺. El calibrador puede mover el número que decide al otro lado de p* sin que la p declarada cambie de celda. Una acumulación en g⁺ no es, por sí sola, una acumulación de acciones «actuar».

### 4.3 Selección diferencial [HEUR]

La franja está definida por la clase, antes del brazo. El conteo dentro de la franja es posterior al brazo. Con δ = 0,2 en el generador de la página (no es el experimento), la celda «justo abajo» del brazo con incentivo pasa a 0 y la de arriba a 2364, sobre 5000. [DEM del generador] El margen de la tabla se mueve con el tratamiento. Eso no invalida un test de las dos celdas; sí impide leerlo como efecto sobre un subconjunto fijo de los 430. Los complementarios de la sección 2.3 evitan ese recorte.

## 5. Plantillas, conglomerados y pocos clusters

Criterio de juicio §4: 18 familias × rellenos muy parecidos; cada claro es la versión desambiguada de un ambiguo de su familia; el bootstrap por pedido queda optimista. [CIT] Enmienda 1, punto 5: bootstrap por familia de plantilla (18 familias) para H2 y H3; si cambia la conclusión, se reporta en la portada junto a la cifra. [CIT] No dice que reemplace el intervalo primario.

Conteo del banco local: 18 familias en los 400 y 6 familias nuevas en los 30 irreducibles (`cbu_desactualizado`, `escribania_indefinida`, `medicacion_sin_receta`, `multa_auto_compartido`, `pasajero_sin_dato`, `repuesto_sin_modelo`). Total 24. [DEM]

La sensibilidad escrita como «18 familias» no cubre las 6 nuevas. Actualizar la lista a 24, sin cambiar el estimador primario, es un ajuste de la sensibilidad ya prometida. Sigue pendiente de Gus si se considera sustantivo. Propuesta: el bootstrap de H2 y H3 agrupa por `familia` en las 24, y el de los irreducibles se reporta en el análisis exploratorio que la enmienda 3 ya separó de H2.

Con 18 o 24 conglomerados el intervalo por familia es ancho y poco estable. [HEUR] No se reporta un error estándar cluster-robust como si G fuera grande. Si el intervalo por pedido y el intervalo por familia discrepan, la portada muestra los dos, como dice la enmienda 1. El de familia no pasa a ser la primaria por esta nota.

H1 no tiene, en el preregistro, un bootstrap por familia. El pareo y la familia se cruzan: dos pedidos de la misma plantilla no son independientes, y los dos brazos del mismo pedido tampoco. Una permutación dentro de familia (sección 2.3) es el complemento natural. No se ejecuta: no hay datos de brazos.

## 6. Umbrales congelados, regiones y argmax

Parámetros que el preregistro y `FROZEN` comparten: b = 1, k = 0,2; c = 1 / 2 / 4; r = 0,925 / 0,896 / 0,646. [CIT, DEF]

Definiciones que el código implementa y el preprint §3.2 escribe [DEF, CIT]:

- beneficio b si la ejecución es correcta;
- pérdida c si es errónea;
- costo k de preguntar;
- r = probabilidad de que la aclaración resuelva la ambigüedad;
- U(abstenerse) = 0;
- U(actuar) = p·b − (1−p)·c;
- U(preguntar) = [p + (1−p)·r]·b − (1−p)·(1−r)·c − k;
- p₀ = c/(b+c);
- p* = 1 − k/[r(b+c)];
- pₐ = 1 − (b−k)/[(b+c)(1−r)].

Recálculo independiente, con los r congelados de tres decimales, no con la fracción cruda del banco:

| Clase | r congelado | p₀ | p* | pₐ |
|---|---:|---:|---:|---:|
| bajo | 0,925 | 0,5 | 0,8918918918918919 | −4,333333333333337 |
| medio | 0,896 | 0,6666666666666666 | 0,9255952380952381 | −1,5641025641025648 |
| alto | 0,646 | 0,8 | 0,9380804953560371 | 0,5480225988700564 |

Coinciden con la referencia pedida (p* 0,89189189 / 0,92559524 / 0,9380805 y pₐ −4,333333 / −1,56410256 / 0,54802260) y con `thresholds()`. Los cruces por bisección de las utilidades (`crossings()`) coinciden dentro de 1e−15. [DEM]

El banco, contado aquí, da 62/67, 60/67 y 62/96, esto es 0,925373…, 0,895522… y 0,645833…. El preregistro congela el redondeo a tres decimales, no la fracción. A tres decimales, p* no cambia. pₐ de medio sí cambia en el tercer decimal si se usa 60/67 (−1,552 frente a −1,564), pero con pₐ < 0 la página no muestra pₐ: dice que no hay zona de abstención. [DEM] No se propone reemplazar 0,896 por 60/67. Quedó congelado.

Regiones en [0, 1], contrastadas con el argmax de `decide()` en pasos de 0,0001: bajo y medio, 0 desacuerdos (preguntar debajo de p*, actuar arriba; abstenerse no gana en ningún p del intervalo); alto, 0 desacuerdos (abstenerse, luego preguntar, luego actuar). [DEM] La fórmula por umbrales es óptima en estas tres clases porque las regiones existen o, si pₐ < 0, la región de abstenerse está fuera de [0, 1] y el argmax lo confirma.

No es óptima en toda combinación de palancas. Ejemplo fuera del preregistro: b = 1, c = 0,5, k = 0,6, r = 0,3 da p* = −0,333. `decideFrozen()` (`model.js`, línea 182) dice «actuar» en todo [0, 1], también donde U(actuar) < 0. `decide()` se abstiene por debajo de p₀. En la grilla de palancas de la página (12 × 10 × 11 = 1320 combinaciones) hay 291 con algún desacuerdo en pasos de 0,005. [DEM] Esas combinaciones no son los parámetros congelados. La corrida viva usa `decide()`, no `decideFrozen()`. S1 sí usa `decideFrozen()`, pero solo con la clase congelada del ejemplo, donde no hay desacuerdo. No se cambia el código. Límite para quien reutilice `decideFrozen()` fuera de esas tres clases.

## 7. Calibración en los 215 de prueba, y precisión del ECE

### 7.1 Qué mitad es cuál [CIT, DEM]

Partición del banco: 215 ajuste y 215 prueba. H2 del preregistro: ECE con 10 bins iguales y Brier, en el 50 % de prueba; el IC bootstrap al 95 % de la diferencia (2000 réplicas) tiene que quedar entero por debajo de 0. Enmienda 3: H2 principal solo en pedidos con acción correcta; los 30 irreducibles van aparte, exploratorio. De esos 30, 15 están en prueba. La H2 principal queda en 200 casos de prueba, no en 215. [DEM del conteo]

«10 bins iguales» (preregistro) y «10 bins de igual frecuencia» (plan §5) no son la misma partición. NO VERIFICADO cuál de las dos se implementará: en este snapshot no hay una función de ECE sobre el banco. La única ECE implementada es la de S7, de ancho 0,1, sobre datos simulados (`model.js`, líneas 276–281). No se elige una de las dos por esta nota. Si Gus no aclara antes de la corrida, el análisis confirmatorio no puede inventar el binning. Propuesta de enmienda, pendiente: fijar por escrito «ancho igual» o «masa igual», sin tocar el resto de H2.

El ajuste del calibrador isotónico del experimento es solo en «ajuste», semilla 20261101, y la evaluación solo en «prueba». [CIT] El plan añade: ajustar con el brazo control. El preregistro no dice «solo control». NO VERIFICADO como requisito firmado. No se eleva el plan por encima del preregistro.

### 7.2 Precisión, sin vender un resultado [HEUR]

Con unos 200 casos y 10 bins, un bin de 20 casos y proporción 0,5 tiene error estándar aproximado 0,11. El ECE es un promedio de desvíos absolutos de esos bins: un diferencia de unas pocas centésimas cabe dentro de ese ruido. El preprint local dice que, para un predictor perfectamente calibrado con p ~ Beta(4, 2), bandas de igual masa, el ECE esperado es 0,077 con n = 200 y M = 10 (500 réplicas, simulado allí). [CIT del preprint] Esa simulación no se repitió aquí. NO VERIFICADO el 0,077.

La cifra 0,131 → 0,109 de la página no es este cálculo. Ver sección 8. Es SIMULADO, n de prueba = 200 de un generador distinto, y la mitad de ajuste se ve mucho mejor que la de prueba (0,014 frente a 0,109). Esa brecha es el recordatorio: un ECE in-sample no sirve como H2.

### 7.3 Análisis planificados, no resultados

No se calculan sobre el banco, porque no hay p declarada experimental. Quedan encargados para cuando existan los 215, con el sello que corresponda y sin mezclarse con la simulación.

1. Brier en la mitad de prueba, con la descomposición de Murphy en fiabilidad, resolución e incertidumbre, por separado para la p declarada y para la salida del calibrador. La resolución es la discriminación: puede no mejorar aunque el ECE baje. [DEF ya escrita en el preprint §4.2]
2. Intervalo del 95 % para la diferencia de ECE y para la diferencia de Brier: bootstrap por pedido (2000 réplicas, semilla ya escrita 20261102 en H2) y, al lado, bootstrap por familia (sección 5). Los dos se muestran si no coinciden en la conclusión.
3. Fiabilidad por clase de riesgo: n por banda, intervalo de Wilson, banda en gris si n < 10. Alto tiene menos claros relativos y los 15 irreducibles de prueba no entran en la H2 principal; su curva va en el exploratorio.
4. La misma mitad de prueba, sin calibrar y con calibrador. El calibrador no se reajusta en la prueba.
5. Sensibilidad a la distribución: repetir la lectura de potencia de la sección 3 con la fracción observada en el piloto, no con el escenario S. El escenario S no se presenta como dato.

La calibración de un número no garantiza discriminación, ejecución correcta ni seguridad. [HEUR, ya insinuado en el epígrafe del diagrama de la página] H2 no habla de ninguna de esas tres cosas.

## 8. Lectura de los generadores de la página

Esta sección fija procedencia. No es un resultado del Experimento 1. Todo lleva sello SIMULADO o, en el ruteo, datos hipotéticos ilustrativos. Reproducido el 7 de noviembre de 2026 con Node v22.23.4, importando `src/model.js` sin editarlo.

### 8.1 Tablero de 5000 y pérdida de 200

Corrida pedida: semilla 20261025, N = 5000, b = 1, c = 2, k = 0,2, r = 0,896, δ = 0, g = 1, calibrador encendido. Resultado: preguntar 4378, actuar 622, abstenerse 0. [DEM] Coincide con el tablero horneado en el `index.html` del snapshot (88 %, 12 %, 0 %). 4378/5000 = 0,8756, que `pct()` redondea a 88.

Generador de esa corrida [DEF, `draw` y `report`, líneas 37–41]: p latente ~ Beta(3, 1,3); logit(q) = g·logit(p) + 0,25·Normal; g = 1; redondeo a 0,05. El calibrador isotónico se ajusta con otros 4000 sorteos, semilla `calSeed = 7`, y se aplica a los 5000. Beta(4, 2) no interviene.

La pérdida 0,43 con intervalo [0,27; 0,60] es `headline()`: Beta(4, 2), n = 200, 2000 réplicas, misma semilla de arranque, y usa la p latente verdadera, no la p declarada ni el calibrador. [DEM] El HTML del snapshot muestra exactamente «0,43» y «[0,27; 0,60]» junto a «n = 200». Son dos cuentas. k = 0,2 y r = 0,896 explican por qué p* = 0,926; no explican por sí solos el 88 %. El 88 % es la fracción de este generador que queda debajo de ese corte. Preguntar siempre sería el 100 % e incluiría los 622 casos en los que actuar tiene mayor utilidad esperada.

Con los valores por defecto del motor (r = 0,5), el mismo `run()` da actuar 1630, preguntar 2760, abstenerse 610 y 86 % de acierto. [DEM, y el test `model.test.mjs`] Ese no es el tablero de la página.

### 8.2 El 97 % [DEF del código, no del preregistro]

`doOk` (`model.js`, líneas 34 y 83–84, y el texto `techReal`) hace esto:

- actuar cuenta 1 si y₁ = 1;
- preguntar cuenta 1 si y₁ = 1 o si yᵣ = 1;
- abstenerse no entra en el numerador ni en el denominador.

En la corrida de referencia, 0,9664 se muestra como 97 %. [DEM] Es una mezcla de dos eventos de la simulación. No es P(Y = 1), no es «la acción elegida fue la adecuada», no es éxito de ejecución y no es seguridad. El criterio de juicio define otra cosa: Y = 1 si la interpretación coincide con `interpretacion_correcta` (criterio §1, transcrito en los hallazgos). En los irreducibles, abstenerse cuenta 1 para el juez (enmienda 3) y 0 para este porcentaje. No se reformula el simulador. Se pide un rótulo que no los confunda.

### 8.3 Inflación programada y observada [DEM]

Con δ = 0 la rama de inflación de `report()` no se ejecuta. En la corrida de referencia el Fisher del tablero es p = 0,571, tabla incentivo 506 abajo y 447 arriba, control 501 y 448. El HTML del snapshot trae esos mismos números y la frase «Sin exceso detectable arriba del umbral». La brecha media (q − y) en [p*, p*+0,10] es −0,002. No hay inflación observada en esa corrida.

Con δ = 0,2, el mismo generador vacía la celda de abajo (0) y pone 2364 arriba. Eso es inflación programada, no un comportamiento medido. La frase fija de la v1.6.2 («La inflación está programada en esta simulación») describe el mecanismo disponible y el escenario con premio; no describe el tablero de referencia, donde δ = 0. La frase está marcada para no cambiarla. El clarificador propuesto es adicional.

El ECE 0,131 → 0,109 es otra simulación: `s7Datos()`, semilla 20261102, n = 400, verdad Bernoulli(p^1,8), p declarada = 0,35 + 0,65·√U. No es Beta(3, 1,3) ni Beta(4, 2). Recalculado: prueba, 0,130501 y 0,108947, que el formato a tres decimales muestra como 0,131 y 0,109. Sello SIMULADO, y el texto ya dice «mitad de prueba». [DEM] En la mitad de ajuste el mismo calibrador baja el ECE de 0,149 a 0,014. Esa cifra in-sample no debe reemplazar la de prueba. El diagrama publicado usa la de prueba: eso se sostiene.

### 8.4 Memoria [DEF, DEM, SUP]

`memP` (líneas 210–212): p′ = p + 0,9·(1−p), con residual 0,1. Es un supuesto, y el texto de la página ya dice que m y el 10 % residual no son mediciones.

En la ficha por defecto (misión 0, semilla 20261102, ítem C-BAN-02, 10 h, seleccionado por `ST0.sel`): la lectura principal trae una probabilidad ilustrativa 0,55, copiada a `p_regla`. No sale del calibrador isotónico. `memP(0,55) = 0,955`, y `fmt` a dos decimales muestra 0,96. La decisión pasa de preguntar a actuar. [DEM]

Esa 0,55 es la masa de una distribución ilustrativa sobre interpretaciones (la barra «calibrada» de la ficha). No es una probabilidad calibrada en el sentido de H2. La barra «declarada» de esa misma lectura es 0,79. Son tres magnitudes. [DEF de los campos]

`ahorradas` cuenta solo el paso preguntar → actuar cuando el recuerdo resuelve (línea 231). En la jornada por defecto hay 2 de esos pasos (C-BAN-02 y C-BAN-05). C-BAN-04 pasa de abstenerse (0,40) a preguntar (0,94) y no se cuenta. Las preguntas de la jornada bajan de 2 a 1: el ahorro bruto es 2 y el neto es 1. [DEM] Abstenerse → preguntar no es una pregunta ahorrada.

`valorPerdido` compara la regla con «actuar si p > 0,5», no la memoria encendida con la memoria apagada. [DEF] No se suma a `ahorradas`.

La semilla 20261102 está elegida, según `DECISIONES.md`, porque es la primera desde 20261101 en la que la memoria ahorra al menos una pregunta en las cuatro misiones. [CIT] Es ilustrativa. No es una inferencia.

El resultado y₁ de la jornada se sortea con la p ya actualizada por la memoria (línea 225). El supuesto es que el recuerdo aumenta de verdad la probabilidad de haber entendido, no solo el número mostrado. [SUP] Si el recuerdo estuviera equivocado, esta simulación no lo representa.

### 8.5 Ruteo 21,78 % [DEM]

`ruteo()` con `benchmarks_hipotetico.json`, semilla 20261103, 60 pedidos: suma de `precio_usd_1M` = 365,847; mandar los 60 al modelo de mayor índice (Modelo J, tarifa 28) = 60 × 28 = 1680. 365,847/1680 = 0,217766, que el formato a dos decimales muestra como 21,78. El texto actual es «Costo ruteado: 21,78 % del costo de mandar todo a Modelo J». Es costo remanente, no ahorro. El ahorro sobre el mismo total sería 78,22 %.

La unidad no es dólares gastados. Cada pedido suma una tarifa «USD por millón», una vez, sin multiplicar por tokens. El cociente es válido como razón de tarifas solo si cada pedido usa los mismos tokens. [SUP] Los doce modelos están marcados como hipotéticos e ilustrativos en el JSON y en el texto de la sección. No son un benchmark real. [CIT]

## 9. Qué queda fuera

H4–H7 como rediseño de hipótesis, la bio del autor, el aspecto visual, animaciones, dependencias nuevas, y cualquier corrida con costo. El contraste de Turing sobre S1 (7 de noviembre de 2026) se leyó y no se rehace. Los textos de P-007, P-037 y P-053 ya están en `i18n.js` (`dec`). Esta nota no los vuelve a auditar.
