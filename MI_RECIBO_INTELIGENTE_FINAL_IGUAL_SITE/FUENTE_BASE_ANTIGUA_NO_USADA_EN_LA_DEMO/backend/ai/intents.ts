import type { Intent } from "../../src/types/lucia";

export type Classification = { intent: Intent; month?: string };
export const allowedIntents: Intent[] = ["increase", "breakdown", "usage", "categories", "plan", "receipts", "receipt_month", "payment", "proration", "reconnection", "discount", "benefits", "offer", "human", "greeting", "thanks", "followup", "unknown"];

export function normalizeMessage(message: string) {
  return message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function classifyIntent(message: string, months: string[]): Classification {
  const text = normalizeMessage(message);
  const month = months.find((item) => text.includes(item));
  if (/\b(hola|holi|buenas)\b/.test(text)) return { intent: "greeting" };
  if (/\b(gracias|genial|perfecto)\b/.test(text)) return { intent: "thanks" };
  if (/asesor|humano|operador|llamame|quiero hablar/.test(text)) return { intent: "human" };
  if (month) return { intent: "receipt_month", month };
  const rules: [RegExp, Intent][] = [
    [/reconex|reconect|corte.*servicio/, "reconnection"],
    [/prorr|proporcional/, "proration"],
    [/descuento|promocion.*termin|fin.*promo/, "discount"],
    [/sub|aument|mas caro|vino mas|llego mas|pago mas|xq.*caro/, "increase"],
    [/que.*cobr|detalle|concept|total|monto|cargos/, "breakdown"],
    [/categoria|video|redes|youtube|streaming/, "categories"],
    [/giga|\bgb\b|dato|consum|queda|internet/, "usage"],
    [/benefici|inclui|gratis/, "benefits"],
    [/oferta|promo|recomiend|mejorar.*plan/, "offer"],
    [/pagar|pagado|pendiente|vence/, "payment"],
    [/plan|tarifa|precio mensual/, "plan"],
    [/recibo|historial|pdf|boleta/, "receipts"],
  ];
  return { intent: rules.find(([pattern]) => pattern.test(text))?.[1] ?? "unknown" };
}
