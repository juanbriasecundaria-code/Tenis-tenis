# Estadios — revisión de referencias adjuntas (v8)

Esta versión parte de la base nueva con el realismo restaurado. Conserva la lógica de contactos, torneos y demás funcionalidades de la aplicación.

## Cambios
- Arthur Ashe: muros azules de fondo altos y laterales bajos, cartelería diferenciada por altura, franja azul sobre los palcos, dos pantallas altas centradas en los fondos en lugar de ocho pantallas genéricas. Colores de cancha azul y entorno verde ajustados al video.
- Philippe-Chatrier: planta más rectangular, muros verdes de fondo, hormigón en los laterales, paneles bajos separados y cubierta de once lamas. Se retiraron las pantallas y los relojes duplicados cuya ubicación no estaba respaldada por el material.
- Wimbledon: marcador bajo desplazado al costado del fondo, volumen del palco, asientos verdes más claros, sillas blancas individuales, franjas de césped longitudinales y entramado blanco de cubierta más visible. Sin repetición de publicidad perimetral.
- Se mantienen red detallada, materiales, personas, mobiliario y controles de cámaras/calidad.

## Evidencia y límites
Se revisaron fotogramas de los dos MP4 adjuntos y las once imágenes de Wimbledon. Todos son renders de modelos 3D, no levantamientos del edificio ni evidencia de la edición actual del torneo.

Arthur Ashe: vistas a 7.6, 22.9, 38, 55 y 84 segundos permiten distinguir distintas alturas, pantallas y nombres como Chase, Emirates Airline, J.P. Morgan, CHUBB, IHG, Spectrum, Deloitte y Mercedes-Benz. El video también incluye créditos del autor, omitidos en la cartelería de la aplicación. Letras recreadas tipográficamente; no se han reproducido logotipos oficiales exactos. La simetría de lados parcialmente ocultos y las coordenadas en metros son aproximaciones visuales.

Chatrier: el video muestra texto del proveedor «3DModels» en los paneles. No permite confirmar patrocinadores reales. Se conservaron las ubicaciones de los paneles sin inventar nombres comerciales. El rótulo de identificación Roland-Garros es una interpretación, no copia exacta de un emblema. No se localizaron pantallas con suficiente claridad; su ausencia en esta reconstrucción no significa que no existan en el estadio real.

Wimbledon: las vistas 383c0cc807 y 38ceced94e muestran el marcador bajo, el palco y las sillas a ambos lados del umpire. Sólo se reproduce el marcador cuya ubicación se distingue; los sectores no visibles no se presentan como verificados.

Los estadios siguen siendo geometría procedural aproximada. No equivalen a una réplica arquitectónica exacta ni a fotorealismo completo. No se incorporaron los modelos comerciales originales ni los videos como activos de la aplicación.

## Validación
Pruebas locales de los tres estadios, tres calidades, cámaras, pausa/reanudación, movimiento reducido y salida de vista de partido: sin errores JavaScript o shader. Vista móvil 390 × 844 sin desbordamiento horizontal. Capturas actualizadas en vistas-previas. No se midió rendimiento en un teléfono físico.
