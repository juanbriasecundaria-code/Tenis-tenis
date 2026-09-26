# Circuito Tenis — asistente para crear torneo (v2, más simple)

## Qué cambió en esta vuelta
- El asistente pasó de 3 pasos a **2**: "Datos" y "Inscriptos y sorteo". Ya no hay que salir de la categoría que estás cargando para sortearla: inscriptos y cuadro están juntos, uno debajo del otro.
- Botón **"Sortear todas las categorías pendientes"**: sortea de una sola vez todas las categorías del torneo que ya tengan 2 o más inscriptos y todavía no tengan cuadro (nunca pisa un cuadro ya sorteado).
- Si el club todavía no cargó ninguna categoría, el Paso 1 ahora deja pegarlas ahí mismo (una por línea), sin salir del asistente.
- El Paso 1 quedó con solo 3 campos a la vista: Nombre, Fechas y Categorías. Etiqueta, Año y Estado se movieron a "Más opciones" (colapsado), porque casi nunca hace falta tocarlos.

## Cómo usar esta versión
Subí el contenido completo de la carpeta a tu alojamiento habitual (no alcanza con reemplazar solo el HTML: incluye `vendor/`, `assets/`, manifest e íconos).
