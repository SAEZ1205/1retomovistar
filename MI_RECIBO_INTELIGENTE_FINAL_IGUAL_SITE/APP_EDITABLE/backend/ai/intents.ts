import type { Intent } from "../../src/types/lucia";

export type Classification = { intent: Intent; month?: string };
export const allowedIntents: Intent[] = ["increase", "breakdown", "usage", "categories", "plan", "receipts", "receipt_month", "payment", "proration", "discount_demo", "benefits", "offer", "unknown"];

export function normalizeMessage(message: string) {
  return message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function classifyIntent(message: string, months: string[]): Classification {
  const text = normalizeMessage(message);
  const month = months.find((item) => text.includes(item));
  if (month) return { intent: month === "mayo" && /prorr|raro|cinco dias/.test(text) ? "proration" : "receipt_month", month };
  const rules: [RegExp, Intent][] = [
    [/sub|aument|mas caro|vino mas|llego mas|pago mas|xq.*caro/, "increase"],
    [/que.*cobr|detalle|concept|total|monto|cargos/, "breakdown"],
    [/categoria|video|redes|youtube|streaming/, "categories"],
    [/giga|\bgb\b|dato|consum|queda|internet/, "usage"],
    [/benefici|inclui|gratis/, "benefits"],
    [/oferta|promo|recomiend|bolsa extra/, "offer"],
    [/prorr|proporcional/, "proration"],
    [/descuento.*termin|promocion.*termin/, "discount_demo"],
    [/pagar|pagado|pendiente|vence/, "payment"],
    [/plan|tarifa|precio mensual/, "plan"],
    [/recibo|historial|pdf|boleta/, "receipts"],
  ];
  return { intent: rules.find(([pattern]) => pattern.test(text))?.[1] ?? "unknown" };
}
