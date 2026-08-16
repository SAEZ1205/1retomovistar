import { activeScenarioId, benefits, currentReceipt, customer, money, offer, receipts, scenario, usageCategories } from "./billingService";
import type { ChatMessage, Intent, LuciaReply, ServiceStatus } from "@/src/types/lucia";

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function classify(message: string, history: ChatMessage[]): { intent: Intent; month?: string } {
  const text = normalize(message);
  const month = receipts.find((receipt) => text.includes(receipt.slug))?.slug;
  if (/\b(ya entendi|entendi|quedo claro|listo ya|ah ya|a ya|perfecto ya|ok ya|ta claro)\b/.test(text)) return { intent: "resolved" };
  if (/\b(hola|holi|buenas|buen dia|buenas tardes|buenas noches|oe|ola)\b/.test(text) && text.split(" ").length <= 4) return { intent: "greeting" };
  if (/\b(gracias|thanks|genial|perfecto|listo)\b/.test(text) && text.split(" ").length <= 5) return { intent: "thanks" };
  if (/asesor|humano|persona real|operador|ejecutivo|llamame|llamarme|quiero hablar|hablar con alguien/.test(text)) return { intent: "human" };
  if (month) return { intent: "receipt_month", month };
  const rules: [RegExp, Intent][] = [
    [/reconex|reconect|corte.*servicio|servicio.*cort|me cortaron|reactiv/, "reconnection"],
    [/prorr|prorate|parte proporcional|dias.*cobr|cobro proporcional/, "proration"],
    [/descuento|promo.*termin|promocion.*termin|fin.*promo|ya no.*descuento|subio.*promo/, "discount"],
    [/sub|aument|mas caro|vino mas|llego mas|variac|pago mas|cobran mas|xq.*caro|porque.*mas|por q.*mas|pq.*mas/, "increase"],
    [/que.*cobr|detalle|concept|total|monto|desglos|cargos|de donde sale|ese cobro|cobro ese/, "breakdown"],
    [/en que.*use|categoria|video|redes|youtube|streaming/, "categories"],
    [/giga|\bgb\b|dato|consum|queda|alcanz|internet/, "usage"],
    [/benefici|inclui|gratis|tengo en mi plan/, "benefits"],
    [/oferta|promo|recomiend|mejorar.*plan|otro plan|mas gigas|quiero pagar menos|plan mejor/, "offer"],
    [/pagar|pagado|pendiente|vence|vencimiento/, "payment"],
    [/plan|tarifa|precio mensual/, "plan"],
    [/recibo|historial|pdf|boleta|mes pasado|anterior/, "receipts"],
  ];
  const matched = rules.find(([pattern]) => pattern.test(text));
  if (matched) return { intent: matched[1] };
  if (/^(y )?(eso|ese|esa|por que|porque|pq|xq|como|cuando|y eso|explicame|no entendi|mas facil|osea|o sea|pero)/.test(text) && history.length > 1) return { intent: "followup" };
  return { intent: "unknown" };
}

function scenarioExplanation(short = false): string {
  if (activeScenarioId === "normal") return short ? "No hubo cargos extraordinarios; el total se mantuvo igual." : "Comparé el recibo actual con el anterior y no encontré variaciones extraordinarias: el total sigue en S/42.89.";
  if (activeScenarioId === "prorrateo") return short ? "Es un cobro proporcional de S/4.27 por un periodo parcial de 3 días." : "El cambio es un prorrateo de S/4.27: se cobró solo una parte del servicio porque estuvo activo durante un periodo parcial de 3 días. El monto y el periodo están asociados al recibo.";
  if (activeScenarioId === "reconexion") return short ? "Es un cargo de reconexión de S/4.58 y hay registro del corte y la reconexión." : "El aumento corresponde a una reconexión de S/4.58. El caso tiene registro de corte, reconexión y cargo asociado, por eso la causa está verificada.";
  return short ? "Terminó un descuento de S/7.98 y el recibo volvió al precio regular." : "El recibo volvió al precio regular porque terminó un descuento de S/7.98. El ciclo anterior todavía tenía la promoción y agosto ya no la aplica.";
}

function lastBotText(history: ChatMessage[]) {
  return history.filter((item) => item.role === "bot").at(-1)?.text || "";
}

function localReply(message: string, history: ChatMessage[] = []): LuciaReply {
  const { intent, month } = classify(message, history);
  const delta = Number((currentReceipt.amount - currentReceipt.previous).toFixed(2));
  const remaining = customer.planData - currentReceipt.usage;
  const base = { evidenceStatus: scenario.analysis.evidence_status as LuciaReply["evidenceStatus"], needsResolutionCheck: false };

  if (intent === "greeting") return { ...base, answer: "¡Hola! 😊 Cuéntame qué quieres revisar de tu recibo y te lo explico con los datos que tengo.", source: `Caso activo: ${scenario.label}`, intent };
  if (intent === "thanks") return { ...base, answer: "¡De nada! Si quieres seguimos con otro mes, consumo, beneficios o planes.", source: "Conversación LucIA", intent };
  if (intent === "resolved") return { ...base, answer: "Perfecto, quedó claro entonces 👍. Si quieres revisar otra cosa de tu cuenta, dime nomás.", source: "Conversación resuelta", intent };
  if (intent === "human") return { ...base, answer: "Claro. Si quieres hablar con una persona, preparo el contexto para que el asesor reciba tu caso sin hacerte repetir todo.", source: "Solicitud explícita del cliente", intent, suggestHuman: true };
  if (intent === "increase") return { ...base, answer: delta === 0 ? scenarioExplanation() : `Sí, este mes cambió ${delta > 0 ? `+${money(delta)}` : money(delta)} frente al anterior. ${scenarioExplanation(true)}`, source: scenario.analysis.evidence.join(" · "), intent };
  if (intent === "breakdown") return { ...base, answer: `Sale de esto: ${currentReceipt.charges.map((item) => `${item.label} ${money(item.amount)}`).join(" + ")}. Total: ${money(currentReceipt.amount)}. ${scenarioExplanation(true)}`, source: currentReceipt.evidence.join(" · "), intent };
  if (intent === "proration") return { ...base, answer: activeScenarioId === "prorrateo" ? scenarioExplanation() : "Revisé este recibo y no encuentro un prorrateo asociado, así que no te voy a decir que el cambio fue por eso.", source: scenario.analysis.evidence.join(" · "), intent };
  if (intent === "reconnection") return { ...base, answer: activeScenarioId === "reconexion" ? scenarioExplanation() : "En este recibo no encuentro una reconexión verificada. Si quieres, revisamos qué cargo sí explica la variación.", source: scenario.analysis.evidence.join(" · "), intent };
  if (intent === "discount") return { ...base, answer: activeScenarioId === "descuento" ? scenarioExplanation() : "No encuentro un descuento vencido que explique este recibo, así que prefiero no atribuírselo a una promoción.", source: scenario.analysis.evidence.join(" · "), intent };
  if (intent === "followup") {
    const last = normalize(lastBotText(history));
    if (/cuando|fecha/.test(normalize(message)) && activeScenarioId === "reconexion") return { ...base, answer: "En la evidencia del caso está registrada la reconexión dentro del ciclo facturado. Si quieres, también puedo explicarte cómo terminó reflejándose en el recibo.", source: scenario.analysis.evidence.join(" · "), intent };
    if (/facil|no entendi|osea|o sea/.test(normalize(message))) return { ...base, answer: `En simple: ${scenarioExplanation(true)}`, source: scenario.analysis.evidence.join(" · "), intent };
    return { ...base, answer: `${scenarioExplanation(true)} ${last.includes("total") ? "Ese es el motivo de la diferencia que ves en el total." : "Si quieres te lo separo paso a paso."}`, source: scenario.analysis.evidence.join(" · "), intent };
  }
  if (intent === "usage") return { ...base, answer: `Has usado ${currentReceipt.usage.toFixed(1)} GB de ${customer.planData} GB. Te quedan ${remaining.toFixed(1)} GB y ${customer.daysRemaining} días de ciclo.`, source: "Consumo del ciclo actual", intent };
  if (intent === "categories") return { ...base, answer: `Lo que más consumiste fue: ${usageCategories.map((item) => `${item.label} ${item.value.toFixed(1)} GB`).join(", ")}.`, source: "Consumo por categorías", intent };
  if (intent === "benefits") return { ...base, answer: `Tu plan incluye ${benefits.join(", ").toLowerCase()}. Eso ya viene incluido; no es un cobro adicional por sí solo.`, source: "Beneficios vigentes del plan", intent };
  if (intent === "offer") return { ...base, answer: `Sí, tengo una opción que encaja con este caso: ${offer.name} por ${money(offer.price)} ${offer.duration}. ${offer.reason}`, source: `Oferta demo controlada ${offer.id}`, intent, showOffer: true };
  if (intent === "plan") return { ...base, answer: `Tu plan actual es ${customer.planName} por ${money(customer.planPrice)} al mes.`, source: "Plan vigente", intent };
  if (intent === "payment") return { ...base, answer: `Tu recibo actual es de ${money(currentReceipt.amount)}, está ${currentReceipt.status.toLowerCase()} y vence el ${currentReceipt.due}.`, source: "Estado del recibo actual", intent };
  if (intent === "receipts") return { ...base, answer: `Tengo tus seis recibos de marzo a agosto. El último es ${money(currentReceipt.amount)} y el anterior fue ${money(currentReceipt.previous)}. Si me dices un mes, te digo cuánto fue y qué cambió.`, source: "Historial de seis recibos", intent };
  if (intent === "receipt_month" && month) {
    const receipt = receipts.find((item) => item.slug === month)!;
    return { ...base, answer: `En ${receipt.month} pagaste ${money(receipt.amount)}. ${receipt.explanation}`, source: receipt.evidence.join(" · "), intent };
  }

  const unknownCount = history.slice(-6).filter((item) => item.role === "bot" && item.source === "No pude identificar la intención").length;
  return {
    ...base,
    answer: unknownCount >= 2
      ? "No logro relacionar eso con la información disponible del recibo. Puedo intentarlo de otra forma o, si tú quieres, pasamos el caso a un asesor."
      : "No capté bien eso 😅. Escríbemelo como te salga; por ejemplo: “¿por qué subió?”, “¿qué es ese cobro?”, “¿cuánto pagué en julio?” o “¿qué plan me conviene?”.",
    source: "No pude identificar la intención",
    intent: "unknown",
    suggestHuman: false,
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
        body: JSON.stringify({ message, scenario: activeScenarioId, history: history.slice(-10) }),
      });
      if (response.ok) return await response.json() as LuciaReply;
    } catch { /* Si Gemini local no está activo, la demo sigue funcionando con reglas verificadas. */ }
  }
  await new Promise((resolve) => window.setTimeout(resolve, 220));
  return localReply(message, history);
}
