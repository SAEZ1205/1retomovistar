import billing from "../data/demo/billing_data.json";

export type ConversationLine = { role: "user" | "bot"; text: string };

export function whatsappConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim()
    && process.env.TWILIO_AUTH_TOKEN?.trim()
    && process.env.TWILIO_WHATSAPP_FROM?.trim()
    && process.env.CALLCENTER_WHATSAPP_TO?.trim(),
  );
}

export function buildHandoffSummary(conversation: ConversationLine[]) {
  const recent = conversation
    .slice(-6)
    .map((line) => `${line.role === "user" ? "Cliente" : "LucIA"}: ${line.text}`)
    .join("\n");
  return [
    "*Resumen de atención LucIA — DEMO*",
    `Cliente: ${billing.customer.full_name}`,
    `Línea: ${billing.customer.line}`,
    "Consulta: aumento del recibo de agosto.",
    "Hallazgo: +S/23.00 por paquete 10 GB (S/15.00) y Movistar Música (S/8.00).",
    "Plan: no cambió; continúa en S/59.90.",
    "Evidencia: recibo agosto, orden PAQ-0810 y alta MUS-0731.",
    "Estado: solicita apoyo de un asesor.",
    recent ? `\nÚltimos mensajes:\n${recent}` : "",
    "\nContenido ficticio para prototipo académico.",
  ].filter(Boolean).join("\n");
}

export async function sendWhatsAppSummary(conversation: ConversationLine[]) {
  if (!whatsappConfigured()) {
    return {
      ok: false,
      configured: false,
      message: "WhatsApp todavía no está configurado. Completa las cuatro variables de Twilio en .env.local.",
    };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID!.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN!.trim();
  const from = process.env.TWILIO_WHATSAPP_FROM!.trim();
  const to = process.env.CALLCENTER_WHATSAPP_TO!.trim();
  const body = new URLSearchParams({ From: from, To: to, Body: buildHandoffSummary(conversation) });
  const auth = btoa(`${accountSid}:${authToken}`);
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const providerMessage = typeof data?.message === "string" ? data.message : "Twilio rechazó el envío.";
    return { ok: false, configured: true, message: providerMessage, code: data?.code };
  }
  return {
    ok: true,
    configured: true,
    message: "Resumen enviado al WhatsApp configurado.",
    sid: data?.sid,
    status: data?.status,
  };
}
