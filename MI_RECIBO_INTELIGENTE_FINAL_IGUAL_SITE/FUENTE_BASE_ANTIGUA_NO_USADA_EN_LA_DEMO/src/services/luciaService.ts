import { activeScenarioId, benefits, currentReceipt, customer, money, offer, receipts, scenario, usageCategories } from "./billingService";
import type { ChatMessage, Intent, LuciaReply, ServiceStatus } from "@/src/types/lucia";

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function classify(message: string, history: ChatMessage[]): { intent: Intent; month?: string } {
  const text = normalize(message);
  const month = receipts.find((receipt) => text.includes(receipt.slug))?.slug;
  if (/\b(hola|holi|buenas|buen dia|buenas tardes|buenas noches)\b/.test(text)) return { intent: "greeting" };
  if (/\b(gracias|thanks|genial|perfecto|listo)\b/.test(text)) return { intent: "thanks" };
  if (/asesor|humano|persona real|operador|ejecutivo|llamame|llamarme|quiero hablar/.test(text)) return { intent: "human" };
  if (month) return { intent: "receipt_month", month };
  const rules: [RegExp, Intent][] = [
    [/reconex|reconect|corte.*servicio|servicio.*cort/, "reconnection"],
    [/prorr|prorate|parte proporcional|dias.*cobr/, "proration"],
    [/descuento|promo.*termin|promocion.*termin|fin.*promo|ya no.*descuento/, "discount"],
    [/sub|aument|mas caro|vino mas|llego mas|variac|pago mas|cobran mas|xq.*caro|porque.*mas/, "increase"],
    [/que.*cobr|detalle|concept|total|monto|desglos|cargos|de donde sale/, "breakdown"],
    [/en que.*use|categoria|video|redes|youtube|streaming/, "categories"],
    [/giga|\bgb\b|dato|consum|queda|alcanz|internet/, "usage"],
    [/benefici|inclui|gratis|tengo en mi plan/, "benefits"],
    [/oferta|promo|recomiend|mejorar.*plan|otro plan|mas gigas|quiero pagar menos/, "offer"],
    [/pagar|pagado|pendiente|vence|vencimiento/, "payment"],
    [/plan|tarifa|precio mensual/, "plan"],
    [/recibo|historial|pdf|boleta/, "receipts"],
  ];
  const matched = rules.find(([pattern]) => pattern.test(text));
  if (matched) return { intent: matched[1] };
  if (/^(y )?(eso|por que|porque|como|cuando|y eso|explicame|no entendi|mas facil|osea|o sea)/.test(text) && history.length > 1) return { intent: "followup" };
  return { intent: "unknown" };
}

function scenarioExplanation(): string {
  if (activeScenarioId === "normal") return "Comparé el recibo actual con el anterior y no encontré variaciones extraordinarias: el total sigue en S/42.89.";
  if (activeScenarioId === "prorrateo") return "El cambio es un prorrateo de S/4.27: se cobró solo una parte del servicio porque estuvo activo durante un periodo parcial. Encontré el monto y el periodo asociados al recibo.";
  if (activeScenarioId === "reconexion") return "El aumento corresponde a una reconexión de S/4.58. El caso tiene registro de corte, reconexión y cargo asociado, por eso la causa está verificada.";
  return "El recibo volvió al precio regular porque terminó un descuento de S/7.98. El ciclo anterior todavía tenía la promoción y agosto ya no la aplica.";
}

function localReply(message: string, history: ChatMessage[] = []): LuciaReply {
  const { intent, month } = classify(message, history);
  const delta = Number((currentReceipt.amount - currentReceipt.previous).toFixed(2));
  const remaining = customer.planData - currentReceipt.usage;
  const base = { evidenceStatus: scenario.analysis.evidence_status as LuciaReply["evidenceStatus"] };

  if (intent === "greeting") return { ...base, answer: `¡Hola! Soy LucIA 😊. Estoy viendo tu escenario de ${scenario.label.toLowerCase()}. Puedes preguntarme por qué cambió el recibo, un cargo, prorrateo, reconexión, descuentos, consumo, beneficios u ofertas.`, source: `Caso activo: ${scenario.label}`, intent, needsResolutionCheck: false };
  if (intent === "thanks") return { ...base, answer: "¡De nada! Si quieres, también puedo explicarte otro cargo o revisar otro mes.", source: "Conversación LucIA", intent, needsResolutionCheck: false };
  if (intent === "human") return { ...base, answer: "Claro. Puedo preparar el contexto para un asesor sin hacerte repetir toda la conversación.", source: "Solicitud explícita del cliente", intent, needsResolutionCheck: false, suggestHuman: true };
  if (intent === "increase") return { ...base, answer: delta === 0 ? scenarioExplanation() : `Tu recibo cambió ${delta > 0 ? `+${money(delta)}` : money(delta)} frente al mes anterior. ${scenarioExplanation()}`, source: scenario.analysis.evidence.join(" · "), intent, needsResolutionCheck: true };
  if (intent === "breakdown") return { ...base, answer: `El total de ${money(currentReceipt.amount)} se forma así: ${currentReceipt.charges.map((item) => `${item.label} ${money(item.amount)}`).join(", ")}. ${scenario.analysis.explanation}`, source: currentReceipt.evidence.join(" · "), intent, needsResolutionCheck: true };
  if (intent === "proration") return { ...base, answer: activeScenarioId === "prorrateo" ? scenarioExplanation() : "Revisé este caso y no encuentro un prorrateo en el recibo actual, así que no voy a atribuirle el cambio a esa causa.", source: scenario.analysis.evidence.join(" · "), intent, needsResolutionCheck: true };
  if (intent === "reconnection") return { ...base, answer: activeScenarioId === "reconexion" ? scenarioExplanation() : "En este caso no encuentro un cargo de reconexión verificado en el recibo actual.", source: scenario.analysis.evidence.join(" · "), intent, needsResolutionCheck: true };
  if (intent === "discount") return { ...base, answer: activeScenarioId === "descuento" ? scenarioExplanation() : "No encuentro un descuento vencido que explique el recibo actual. Prefiero no atribuirle el cambio a una promoción sin evidencia.", source: scenario.analysis.evidence.join(" · "), intent, needsResolutionCheck: true };
  if (intent === "followup") return { ...base, answer: `${scenarioExplanation()} Si quieres, te explico el cálculo paso a paso o te digo exactamente qué evidencia encontré.`, source: scenario.analysis.evidence.join(" · "), intent, needsResolutionCheck: true };
  if (intent === "usage") return { ...base, answer: `Has usado ${currentReceipt.usage.toFixed(1)} GB de ${customer.planData} GB. Te quedan ${remaining.toFixed(1)} GB para ${customer.daysRemaining} días.`, source: "Consumo del ciclo actual", intent, needsResolutionCheck: true };
  if (intent === "categories") return { ...base, answer: `Tu consumo se distribuye así: ${usageCategories.map((item) => `${item.label} ${item.value.toFixed(1)} GB`).join(", ")}.`, source: "Consumo por categorías", intent, needsResolutionCheck: true };
  if (intent === "benefits") return { ...base, answer: `Tu plan incluye ${benefits.join(", ").toLowerCase()}. Estos beneficios forman parte de tu plan y no generan un cobro adicional por sí solos.`, source: "Beneficios vigentes del plan", intent, needsResolutionCheck: true };
  if (intent === "offer") return { ...base, answer: `Sí. Para este caso tengo como opción ${offer.name} por ${money(offer.price)} ${offer.duration}. ${offer.reason}`, source: `Oferta demo controlada ${offer.id}`, intent, needsResolutionCheck: false, showOffer: true };
  if (intent === "plan") return { ...base, answer: `Tu plan actual es ${customer.planName} por ${money(customer.planPrice)} al mes.`, source: "Plan vigente", intent, needsResolutionCheck: true };
  if (intent === "payment") return { ...base, answer: `El recibo actual es de ${money(currentReceipt.amount)}, está ${currentReceipt.status.toLowerCase()} y vence el ${currentReceipt.due}.`, source: "Estado del recibo actual", intent, needsResolutionCheck: true };
  if (intent === "receipts") return { ...base, answer: `Tengo seis recibos disponibles, de marzo a agosto. Puedo explicarte cualquiera de ellos por mes.`, source: "Historial de seis recibos", intent, needsResolutionCheck: false };
  if (intent === "receipt_month" && month) {
    const receipt = receipts.find((item) => item.slug === month)!;
    return { ...base, answer: `En ${receipt.month} el total fue ${money(receipt.amount)}. ${receipt.explanation}`, source: receipt.evidence.join(" · "), intent, needsResolutionCheck: true };
  }

  const previousUnknown = history.slice(-3).some((item) => item.role === "bot" && item.source === "No pude identificar la intención");
  return {
    ...base,
    answer: previousUnknown
      ? "Todavía no logro relacionar esa pregunta con la información disponible. Si quieres, puedo pasar el contexto a un asesor."
      : "No entendí del todo esa pregunta. Puedes decírmelo como hablas normalmente; por ejemplo: “¿por qué vino más caro?”, “¿qué es ese cobro?”, “¿terminó mi descuento?” o “¿hubo reconexión?”.",
    source: "No pude identificar la intención",
    intent: "unknown",
    needsResolutionCheck: false,
    suggestHuman: previousUnknown,
  };
}

export async function getServiceStatus(): Promise<ServiceStatus> {
  const endpoint = import.meta.env.VITE_LUCIA_API_URL?.trim();
  return { gemini: Boolean(endpoint), geminiModel: endpoint ? "Gemini por backend local" : "Modo conversacional local", whatsapp: Boolean(import.meta.env.VITE_HANDOFF_API_URL), receipts: receipts.length, mode: endpoint ? "api" : "local" };
}

export async function askLucia(message: string, history: ChatMessage[] = []): Promise<LuciaReply> {
  const endpoint = import.meta.env.VITE_LUCIA_API_URL?.trim();
  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, scenario: activeScenarioId, history: history.slice(-8) }),
      });
      if (response.ok) return await response.json() as LuciaReply;
    } catch { /* Si Gemini local no está activo, la demo sigue funcionando con reglas verificadas. */ }
  }
  await new Promise((resolve) => window.setTimeout(resolve, 300));
  return localReply(message, history);
}
