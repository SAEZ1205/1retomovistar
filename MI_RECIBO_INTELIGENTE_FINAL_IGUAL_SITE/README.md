# MI RECIBO INTELIGENTE — RESCATE FINAL

Este paquete contiene la versión pública capturada del Site, usando los mismos bundles JS/CSS y los mismos assets descargados por el navegador.

## Ejecutar local

```bash
npm run dev
```

Luego abre http://localhost:3000/

Vista Call Center: http://localhost:3000/?modo=asesor

## Vercel

Importa este directorio. El `vercel.json` ya define `npm run build` y `dist`. No usa proxy ni depende de ChatGPT Sites.

## Código fuente antiguo

El ZIP que proporcionaste está preservado en `FUENTE_BASE_ANTIGUA_NO_USADA_EN_LA_DEMO/`. La versión exacta que corre en la raíz es el frontend compilado capturado desde el Site final.

## Verificación realizada

- El JavaScript principal y CSS principal vienen directamente del HAR de la versión final publicada.
- Se verificaron 26 referencias de assets dentro del bundle y las 26 existen localmente.
- El bundle no contiene referencias a `chatgpt.site`; la app empaquetada no usa proxy.
- `npm run build` fue ejecutado correctamente y generó `dist/`.

## Configuración recomendada en Vercel

- Root Directory: `./`
- Framework Preset: `Other`
- Build Command: se toma de `vercel.json` (`npm run build`)
- Output Directory: se toma de `vercel.json` (`dist`)
- Environment Variables: ninguna para la demo local/simulada
