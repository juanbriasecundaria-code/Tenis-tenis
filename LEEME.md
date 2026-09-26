# Circuito Tenis — asistente para crear torneo (v4, más simple)

## Qué cambió en esta vuelta
- **Fechas con selector**: en el paso 1 del asistente ahora hay dos campos "Desde"/"Hasta" (calendario nativo) que arman solos el texto de fechas ("12 al 14 de octubre"); el texto sigue siendo editable a mano si preferís escribirlo distinto.
- **"Traer los del torneo anterior"**: en Inscriptos y sorteo (asistente y pestaña normal) hay un botón nuevo, al lado de "Traer los del ranking", que carga la lista de inscriptos que jugó esa misma categoría en el torneo anterior. Útil cuando se repiten los mismos jugadores edición tras edición.
- **"Siguiente categoría sin inscriptos ›"**: con torneos de varias categorías, este botón salta directo a la próxima categoría que todavía no tiene inscriptos cargados, sin tener que ir clickeando cada pestaña de categoría a mano.

## Resumen de todo lo agregado hasta acá
Asistente de 2 pasos (Datos → Inscriptos y sorteo) en la pestaña Torneos del panel, con carga de categorías inline si todavía no hay ninguna, botón para sortear todas las categorías pendientes de una vez, campos secundarios (etiqueta/año/estado) colapsados en "Más opciones", selector de fechas, importar inscriptos del ranking o del torneo anterior, y navegación directa a la próxima categoría sin inscriptos.

## Cómo usar esta versión
Subí el contenido completo de la carpeta a tu alojamiento habitual (no alcanza con reemplazar solo el HTML: incluye `vendor/`, `assets/`, manifest e íconos).
