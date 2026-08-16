import billing from "../data/demo/billing_data.json";
import type { Intent } from "../../src/types/lucia";
import { allowedIntents, classifyIntent, type Classification } from "./intents";
import { classificationPrompt } from "./prompts";

const current = billing.receipts.at(-1)!;
const months = billing.receipts.map((receipt) => receipt.slug);
const money = (value: number) => `S/${value.toFixed(2)}`;

export async function geminiClassification(message: string): Promise<Classification | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: classificationPrompt(months) }] },
      contents: [{ role: "user", parts: [{ text: message.slice(0, 500) }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0, maxOutputTokens: 80 },
    }),
  });
  if (!response.ok) return null;
  const data = await response.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) return null;
  const parsed = JSON.parse(raw) as { intent?: Intent; month?: string };
  if (!parsed.intent || !allowedIntents.includes(parsed.intent)) return null;
  return { intent: parsed.intent, month: parsed.month && months.includes(parsed.month) ? parsed.month : undefined };
}

export function localClassification(message: string) { return classifyIntent(message, months); }

export function answerFor({ intent, month }: Classification) {
  const delta = current.amount - current.previous;
  const remaining = billing.customer.plan_gb - current.usage_gb;
  if (intent === "increase") return { answer: `Tu recibo subió ${money(delta)} frente a julio. El plan sigue en ${money(billing.customer.plan_price)}. El aumento viene de 10 GB adicionales por S/15.00 y Movistar Música por S/8.00.`, evidence: current.evidence, needsResolutionCheck: true };
  if (intent === "breakdown") return { answer: `El total de ${money(current.amount)} se forma así: ${current.charges.map((item) => `${item.label} ${money(item.amount)}`).join(", ")}.`, evidence: ["Detalle del recibo agosto"], needsResolutionCheck: true };
  if (intent === "usage") return { answer: `Has usado ${current.usage_gb.toFixed(1)} GB y te quedan ${remaining.toFixed(1)} GB.`, evidence: ["Consumo del ciclo"], needsResolutionCheck: true };
  if (intent === "benefits") return { answer: `Tu plan incluye ${billing.benefits.join(", ").toLowerCase()}.`, evidence: ["Beneficios vigentes"], needsResolutionCheck: true };
  if (intent === "proration") return { answer: "En mayo se cobraron S/2.50 por cinco días de Protección Móvil. Fue un prorrateo verificado.", evidence: ["Recibo mayo", "Orden PRO-1105"], needsResolutionCheck: true };
  if (intent === "receipt_month" && month) { const receipt = billing.receipts.find((item) => item.slug === month)!; return { answer: `En ${receipt.label} el total fue ${money(receipt.amount)}. ${receipt.explanation}`, evidence: receipt.evidence, needsResolutionCheck: true }; }
  return { answer: "No existe evidencia suficiente para responder sin inventar. Debe derivarse a un asesor.", evidence: ["Evidencia insuficiente"], needsResolutionCheck: false };
}
