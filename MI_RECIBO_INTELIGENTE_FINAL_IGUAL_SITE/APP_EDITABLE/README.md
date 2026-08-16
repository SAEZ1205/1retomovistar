# MOVISTAR Reto 1 · Mi recibo inteligente

Prototipo académico móvil inspirado en la experiencia de **Mi Movistar**. La solución se integra como un botón de IA dentro de **Mi recibo**: LucIA explica variaciones con evidencia, compara seis recibos, muestra consumo, recuerda beneficios, deriva el contexto al Call Center y solo habilita una oferta cuando la consulta ya fue resuelta.

> Proyecto académico no afiliado oficialmente a Movistar. Todos los datos personales, recibos, órdenes, montos y acciones son ficticios o simulados.

## Stack oficial

- React 19
- TypeScript
- Vite
- Tailwind CSS 4

La aplicación principal **no usa Next.js**. El código antiguo quedó conservado dentro de `legacy/` únicamente como referencia y no participa en la compilación.

## Ejecutar el proyecto

Requisitos: Node.js 22.13 o superior.

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

Si quieres abrirlo desde otro dispositivo conectado a tu misma red local, usa `npm run dev -- --host 0.0.0.0`.

Para comprobar la versión de producción:

```bash
npm run build
npm run preview
```

Si npm muestra específicamente un aviso para aprobar `esbuild`, ejecuta una vez:

```bash
npm approve-scripts esbuild
```

En Windows también puedes ejecutar `INICIAR_EN_WINDOWS.bat`.

## Flujo principal de la demo

1. Entra a **Recibo** desde la barra inferior.
2. Pulsa la tarjeta o el botón flotante **Pregúntale a LucIA** para abrir el chat emergente.
3. Entra a **Ver análisis completo del recibo** para revisar la diferencia, el desglose, la evidencia y la trazabilidad.
4. Pregunta, por ejemplo: `xq me vino mas karo`.
5. Si confirmas que la explicación resolvió la duda, se habilita una oferta controlada.
6. Si todavía tienes dudas, elige **Quiero que me llamen** o **Solo enviar el caso**.
7. Abre `/?modo=asesor` para ver la bandeja y el detalle que recibe el Call Center.

La IA interpreta la intención; los importes, fechas, cargos, beneficios y ofertas se obtienen de datos estructurados. Si no hay evidencia, responde que no puede afirmarlo y ofrece derivación.

## Estructura

```text
MOVISTAR-Reto1/
├── src/
│   ├── pages/
│   │   ├── cliente/
│   │   └── asesor/
│   ├── components/
│   │   ├── cliente/
│   │   ├── lucia/
│   │   ├── asesor/
│   │   └── shared/
│   ├── services/
│   ├── types/
│   ├── data/mocks/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── backend/
│   ├── data/{raw,processed,demo}/
│   ├── billing/
│   ├── ai/
│   ├── handoff/
│   └── offers/
├── scripts/preparar-dataset.py
├── public/
├── legacy/
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Servicios del frontend

- `billingService.ts`: recibos, comparación y análisis.
- `luciaService.ts`: preguntas y respuestas con modo local verificado o API externa opcional.
- `handoffService.ts`: creación, lectura y actualización de casos de demo.
- `callCenterService.ts`: solicitud de callback y envío al endpoint seguro del Call Center.
- `offerService.ts`: elegibilidad y catálogo controlado.

Los secretos nunca deben usar el prefijo `VITE_`. Las variables `GEMINI_API_KEY` y `TWILIO_*` están reservadas para un backend seguro.

## Dataset oficial utilizado como contrato

La demo conserva datos ficticios, pero el formato de evidencia y hand-off sigue el diccionario del Drive oficial:

- `FACTURACION-CLIENTES.csv`: recibo, ciclo, montos, códigos y periodos del cargo.
- `Ordenes.csv`: motivo, tipo, estado y fechas de la orden.
- `BRAINY_PRORRATEO_ALTASV3.csv`: periodo, monto y cantidad de cargos prorrateados.
- `BRAINY_RECONEXIONESV3.csv`: corte, reconexión, descripción y monto.
- `NOTAS_CREDITO.csv`: notas de crédito/débito y fechas efectivas.
- `CATALOGO-OFERTAS.csv`: catálogo controlado; LucIA no inventa ofertas.

El siguiente paso de backend es reemplazar `backend/data/demo/billing_data.json` por un proceso que busque una cuenta financiera, normalice sus recibos y entregue `VERIFIED`, `PARTIAL` o `NONE`.

## Call Center y Plivo

La experiencia completa de demo ya funciona localmente: crea el caso, solicita callback, lo guarda y permite verlo en `/?modo=asesor`. La llamada real queda preparada en `backend/handoff/plivo.ts`, pero debe ejecutarse desde un backend seguro.

Para activarla:

1. Crear una cuenta de Plivo y comprar/verificar un número con capacidad de voz.
2. Configurar `PLIVO_AUTH_ID`, `PLIVO_AUTH_TOKEN`, `PLIVO_FROM_NUMBER`, `CALLCENTER_ADVISOR_NUMBER` y `PLIVO_ANSWER_URL` únicamente en el backend.
3. Crear `POST /api/call-center/callback` para guardar el caso y llamar a `requestPlivoCallback`.
4. Crear el endpoint `PLIVO_ANSWER_URL` que responda XML usando `buildCustomerBridgeXml` para conectar asesor y cliente.
5. Colocar esa URL pública en `VITE_CALL_CENTER_API_URL`; el frontend nunca recibe los secretos de Plivo.

Para la hackathon, primero demuestra el callback solicitado y el contexto recibido por el asesor. Activa telefonía real solo cuando el flujo y las credenciales estén listos.

## Reparto para cuatro personas

| Persona | Responsabilidad | Carpetas principales |
|---|---|---|
| 1 | Dataset y lógica financiera | `backend/data/`, `backend/billing/`, `scripts/`, `src/types/billing.ts` |
| 2 | LucIA y motor IA | `backend/ai/`, `src/components/lucia/`, `src/services/luciaService.ts`, `src/types/lucia.ts` |
| 3 | Frontend del cliente | `src/pages/cliente/`, `src/components/cliente/`, `src/components/shared/`, `billingService.ts`, `offerService.ts` |
| 4 | Call Center y hand-off | `src/pages/asesor/`, `src/components/asesor/`, `backend/handoff/`, `handoffService.ts`, `src/types/case.ts` |

Para evitar conflictos, cada integrante debe crear su propia rama y no modificar carpetas asignadas a otra persona sin coordinar.

## Archivos antiguos conservados

`legacy/next-prototype/`, `legacy/sites-runtime/`, `legacy/integrations/` y `legacy/generated/` contienen la implementación anterior y archivos de apoyo. No se cargan desde Vite y pueden eliminarse en una limpieza posterior cuando el equipo confirme que ya no necesita compararlos.
