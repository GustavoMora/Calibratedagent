# Laboratorio: notas para revisión de Gauss

Estos puntos documentan decisiones de presentación e interpretación. No bloquean el desarrollo y no modifican el paper ni el preregistro.

- El modelo, las fórmulas, el desempate y FROZEN permanecen intactos en `SITE_V2_SOURCE/src/domain/decisionModel.ts`.
- Los cinco niveles describen complejidad narrativa. En proyectos y estrategia se evalúa una única decisión actual; no se modelan utilidades acumuladas, transiciones ni optimización secuencial.
- p es un supuesto sintético de comprensión del pedido. Las bandas por variante narrativa no son estimaciones empíricas ni un calibrador. No equivalen a probabilidad de ejecución exitosa.
- La familia determina riesgo e irreversibilidad; la variante determina información disponible y faltante. El rango de p es condicional a esa variante. Las clases siguen siendo ilustrativas, sin validación externa.
- El costo de oportunidad es max(U) − U(elección), en unidades de utilidad esperada. No representa una pérdida realizada ni un juicio correcto/incorrecto.
- El visor del Laboratorio sigue la regla de utilidad sin vetos, como ya hacía el instrumento. La confirmación por irreversibilidad se explica por separado. El flujo del cerebro existente conserva su comportamiento por defecto. No se representa un calibrador en el recorrido del Laboratorio.
- Sensibilidad modifica copias locales de p, c y k; conserva b y r de la clase. No cambia el registro, el escenario ni los parámetros publicados. Debe leerse como contrafactual bajo otros supuestos.
- Las familias y sus dos variantes por nivel son un catálogo deliberadamente acotado; no constituyen una muestra representativa de tareas reales.

## Reproducibilidad

Se itera en la misma ruta y experiencia. `v=1` sigue siendo el formato de enlace. Los enlaces sin `g` usan el generador y las plantillas originales. `g=2&nivel=1..5` identifica la revisión técnica actual. Orden fijo: sorteo de nivel, variante compatible, p. El nivel explícito consume igualmente el primer sorteo. Revisiones desconocidas se rechazan; no se reinterpretan. Cambios futuros de contenido o sorteo requieren otro identificador de revisión o conservar una instantánea reproducible.

## A validar por Gauss

Adecuación de las asignaciones ilustrativas de riesgo, explicación del veto frente al argmax, terminología de costo de oportunidad y límites de la narrativa multietapa. Cualquier eventual propuesta de edición del paper debe revisarse por separado.
