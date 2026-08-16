import { allowedIntents } from "./intents";

export function classificationPrompt(months: string[]) {
  return [
    "Clasifica intenciones de facturación móvil en español peruano.",
    "Tolera errores ortográficos y frases incompletas.",
    "No respondas la consulta, no calcules y no inventes montos, fechas, cargos ni causas.",
    `Devuelve solo JSON. Intenciones permitidas: ${allowedIntents.join(", ")}.`,
    `Meses permitidos: ${months.join(", ")}.`,
  ].join(" ");
}
