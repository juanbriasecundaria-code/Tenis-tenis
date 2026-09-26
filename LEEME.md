# Circuito Tenis — asistente para crear torneo (v3, pulido)

## Qué cambió en esta vuelta
- Las pestañas de categoría en "Inscriptos y sorteo" ahora muestran un ✓ cuando esa categoría ya tiene cuadro sorteado, así se ve de un vistazo qué falta.
- Si el torneo tiene una sola categoría, no se muestra el selector de categorías (no hace falta elegir nada).
- "Terminar" ahora guarda los cambios automáticamente y vuelve a la pestaña Torneos; ya no hace falta tocar "Guardar cambios" aparte al cerrar el asistente. "Salir del asistente" sigue sin guardar, por si preferís descartar.
- El torneo nuevo arranca con un nombre sugerido ("Torneo de <mes> <año>") en vez de "Torneo nuevo", para no tener que tocar ese campo si no hace falta.

## Resumen de todo lo agregado hasta acá
Asistente de 2 pasos (Datos → Inscriptos y sorteo) en la pestaña Torneos del panel, con carga de categorías inline si todavía no hay ninguna, botón para sortear todas las categorías pendientes de una vez, y campos secundarios (etiqueta/año/estado) colapsados en "Más opciones".

## Cómo usar esta versión
Subí el contenido completo de la carpeta a tu alojamiento habitual (no alcanza con reemplazar solo el HTML: incluye `vendor/`, `assets/`, manifest e íconos).
