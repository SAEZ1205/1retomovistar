# MI RECIBO INTELIGENTE — RESCATE URGENTE

Origen preservado:
https://mi-recibo-inteligente.saez123m.chatgpt.site

Este paquete fue construido desde el HAR exportado el 16-08-2026.

## Qué hace el despliegue de emergencia
`vercel.json` configura a Vercel como reverse proxy de la versión publicada.
Esto hace que el nuevo dominio reproduzca la versión que actualmente está
desplegada, sin cambiar la URL visible del usuario.

Además, la carpeta `captura/` contiene todos los assets cuyos bytes sí estaban
incluidos dentro del HAR (principalmente imágenes de LucIA, promociones,
beneficios, referencias visuales y favicon).

## Importante
Los bundles compilados principales:
- /assets/index-CfBV2SCI.js
- /assets/index-eCgd0yV6.css

aparecieron en el HAR como respuestas 304 desde caché y Edge NO guardó sus
bytes dentro del archivo. Por eso este rescate de emergencia los obtiene del
deployment original mediante el reverse proxy.

Para obtener luego un ZIP 100% independiente del origen, se necesita una
segunda captura HAR con "Disable cache" activado y un hard refresh.
NO hace falta rehacer la aplicación.

## Deploy rápido
1. Sube TODO el contenido de esta carpeta a un repo vacío.
2. En Vercel importa el repo.
3. Framework Preset: Other.
4. No hace falta Build Command.
5. Deploy.
6. Abre la nueva URL y recorre Inicio, Recibos, LucIA y la vista asesor
   (`?modo=asesor`) para que Vercel solicite/cachee esos recursos.
