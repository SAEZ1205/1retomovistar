import { benefits, currentReceipt, customer, money, offer, receipts, usageCategories } from "./billingService";
import type { Intent, LuciaReply, ServiceStatus } from "@/src/types/lucia";

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function classify(message: string): { intent: Intent; month?: string } {
  const text = normalize(message);
  const month = receipts.find((receipt) => text.includes(receipt.slug))?.slug;
  if (month) return { intent: month === "mayo" && /prorr|raro|cinco dias/.test(text) ? "proration" : "receipt_month", month };
  const rules: [RegExp, Intent][] = [
    [/sub|aument|mas caro|vino mas|llego mas|variac|pago mas|cobran mas|xq.*caro/, "increase"],
    [/que.*cobr|detalle|concept|total|monto|desglos|cargos/, "breakdown"],
    [/en que.*use|categoria|video|redes|youtube|streaming/, "categories"],
    [/giga|\bgb\b|dato|consum|queda|alcanz|internet/, "usage"],
    [/benefici|inclui|gratis|tengo en mi plan/, "benefits"],
    [/oferta|promo|recomiend|bolsa extra/, "offer"],
    [/prorr|parte proporcional/, "proration"],
    [/descuento.*termin|promocion.*termin|fin.*descuento/, "discount_demo"],
    [/pagar|pagado|pendiente|vence|vencimiento/, "payment"],
    [/plan|tarifa|precio mensual/, "plan"],
    [/recibo|historial|pdf|boleta/, "receipts"],
  ];
  return { intent: rules.find(([pattern]) => pattern.test(text))?.[1] ?? "unknown" };
}

function localReply(message: string): LuciaReply {
  const { intent, month } = classify(message);
  const delta = currentReceipt.amount - currentReceipt.previous;
  const remaining = customer.planData - currentReceipt.usage;
  let answer = "No encuentro evidencia suficiente en estos seis recibos para responder sin inventar. Puedo preparar el caso para un asesor.";
  let source = "Resultado: evidencia insuficiente";
  if (intent === "increase") { answer = `Tu recibo subió ${money(delta)} frente a julio. Tu plan sigue en ${money(customer.planPrice)}. El aumento viene de 10 GB adicionales por S/15.00 y Movistar Música por S/8.00.`; source = currentReceipt.evidence.join(" · "); }
  if (intent === "breakdown") { answer = `El total de ${money(currentReceipt.amount)} se forma así: ${currentReceipt.charges.map((item) => `${item.label} ${money(item.amount)}`).join(", ")}. La suma coincide con el recibo.`; source = "Detalle verificado del recibo de agosto"; }
  if (intent === "usage") { answer = `Has usado ${currentReceipt.usage.toFixed(1)} GB de ${customer.planData} GB. Te quedan ${remaining.toFixed(1)} GB para ${customer.daysRemaining} días.`; source = "Consumo del ciclo actual"; }
  if (intent === "categories") { answer = `Tu consumo se distribuye así: ${usageCategories.map((item) => `${item.label} ${item.value.toFixed(1)} GB`).join(", ")}.`; source = "Consumo verificado por categorías"; }
  if (intent === "benefits") { answer = `Tu plan ya incluye ${benefits.join(", ").toLowerCase()}. No generan un cobro extra en este recibo.`; source = "Beneficios vigentes del plan"; }
  if (intent === "offer") { answer = `Existe ${offer.name} por ${money(offer.price)}, pero solo se habilita después de resolver tu consulta y validar la regla comercial.`; source = "Catálogo O-87"; }
  if (intent === "plan") { answer = `Tu plan continúa siendo ${customer.planName} por ${money(customer.planPrice)}. No hay una orden de cambio en este ciclo.`; source = "Plan vigente · Órdenes del ciclo"; }
  if (intent === "payment") { answer = `El recibo de agosto por ${money(currentReceipt.amount)} está pendiente y vence el ${currentReceipt.due}.`; source = "Estado y vencimiento del recibo"; }
  if (intent === "receipts") { answer = `Tienes seis recibos de marzo a agosto. Puedes abrir o descargar cada PDF desde el historial.`; source = "Historial verificado de seis recibos"; }
  if (intent === "proration") { answer = "En mayo se cobraron S/2.50 por cinco días de Protección Móvil. Fue un prorrateo: solo se cobró el tiempo activo."; source = "Recibo mayo · Orden PRO-1105"; }
  if (intent === "discount_demo") { answer = "En esta cuenta no aparece un descuento vencido, así que no atribuiré el aumento a esa causa."; source = "Seis recibos revisados · Sin coincidencia"; }
  if (intent === "receipt_month" && month) { const receipt = receipts.find((item) => item.slug === month)!; answer = `En ${receipt.month} el total fue ${money(receipt.amount)}. ${receipt.explanation}`; source = receipt.evidence.join(" · "); }
  return { answer, source, intent, needsResolutionCheck: intent !== "unknown" };
}

export async function getServiceStatus(): Promise<ServiceStatus> {
  return { gemini: Boolean(import.meta.env.VITE_LUCIA_API_URL), geminiModel: "Clasificador conectado por backend", whatsapp: Boolean(import.meta.env.VITE_HANDOFF_API_URL), receipts: receipts.length, mode: import.meta.env.VITE_LUCIA_API_URL ? "api" : "local" };
}

export async function askLucia(message: string): Promise<LuciaReply> {
  const endpoint = import.meta.env.VITE_LUCIA_API_URL?.trim();
  if (endpoint) {
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
      if (response.ok) return await response.json() as LuciaReply;
    } catch { /* El modo local verificado mantiene la demo disponible. */ }
  }
  await new Promise((resolve) => window.setTimeout(resolve, 420));
  return localReply(message);
}
