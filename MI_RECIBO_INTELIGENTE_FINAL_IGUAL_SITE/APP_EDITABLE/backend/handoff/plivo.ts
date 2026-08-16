export type PlivoCallbackRequest = {
  advisorNumber: string;
  customerNumber: string;
  answerUrl: string;
};

export function plivoConfigured() {
  return Boolean(
    process.env.PLIVO_AUTH_ID?.trim()
    && process.env.PLIVO_AUTH_TOKEN?.trim()
    && process.env.PLIVO_FROM_NUMBER?.trim()
    && process.env.CALLCENTER_ADVISOR_NUMBER?.trim()
    && process.env.PLIVO_ANSWER_URL?.trim(),
  );
}

export function buildCustomerBridgeXml(customerNumber: string) {
  const safeNumber = customerNumber.replace(/[^+\d]/g, "");
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Speak>Conectando con el cliente de Mi Movistar.</Speak><Dial><Number>${safeNumber}</Number></Dial></Response>`;
}

export async function requestPlivoCallback(request: PlivoCallbackRequest) {
  if (!plivoConfigured()) {
    return { ok: false, configured: false, message: "Plivo todavía no está configurado en el backend." };
  }

  const authId = process.env.PLIVO_AUTH_ID!.trim();
  const authToken = process.env.PLIVO_AUTH_TOKEN!.trim();
  const from = process.env.PLIVO_FROM_NUMBER!.trim();
  const credentials = Buffer.from(`${authId}:${authToken}`).toString("base64");
  const response = await fetch(`https://api.plivo.com/v1/Account/${encodeURIComponent(authId)}/Call/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: request.advisorNumber,
      answer_url: request.answerUrl,
      answer_method: "POST",
    }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      ok: false,
      configured: true,
      message: typeof data?.error === "string" ? data.error : "Plivo rechazó la solicitud de llamada.",
    };
  }
  return { ok: true, configured: true, message: "Plivo inició la llamada al asesor.", requestUuid: data?.request_uuid };
}
