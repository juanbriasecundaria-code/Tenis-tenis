# Circuito Tenis — asistente para crear torneo

## Qué cambió
Se agregó un asistente guiado ("Crear torneo") en el panel de administración, en la pestaña Torneos. En vez de tener que ir por separado a Categorías, Torneos, Inscriptos y sorteo, el asistente lleva al organizador por 3 pasos en una sola pantalla:

1. **Datos**: nombre, etiqueta, fechas, año, estado y qué categorías juegan este torneo (vienen todas tildadas por defecto).
2. **Inscriptos**: cargar los anotados de cada categoría (con pestañas para pasar de una a otra), igual que antes.
3. **Sorteo**: sortear el cuadro de cada categoría con el mismo botón de siempre.

Se puede salir del asistente en cualquier momento ("Salir del asistente") sin perder lo cargado, y "Agregar torneo vacío (sin asistente)" sigue disponible para quien prefiera el flujo manual de antes. No se tocó la lógica de sorteo, inscriptos, ranking ni Firebase: es la misma, solo agrupada en una pantalla.

## Cómo usar esta versión
Subí el contenido completo de la carpeta a tu alojamiento habitual (no alcanza con reemplazar solo el HTML: incluye `vendor/`, `assets/`, manifest e íconos, igual que la versión anterior).

## Pendiente / a tener en cuenta
Si el club todavía no cargó ninguna categoría, el paso 1 lo va a avisar: primero hay que crear al menos una categoría desde la pestaña Categorías (es un paso único, no por torneo).
