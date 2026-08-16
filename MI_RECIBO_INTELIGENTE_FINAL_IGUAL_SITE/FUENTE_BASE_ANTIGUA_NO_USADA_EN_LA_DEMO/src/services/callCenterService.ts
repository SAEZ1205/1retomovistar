import type { ChatMessage } from "@/src/types/lucia";
import type { HandoffResponse } from "@/src/types/case";
import { createCase } from "./handoffService";

export async function requestCallback(messages: ChatMessage[]): Promise<HandoffResponse> {
  const handoffCase = createCase(messages, {
    contactPreference: "callback",
    callbackStatus: "requested",
  });
  const endpoint = import.meta.env.VITE_CALL_CENTER_API_URL?.trim();

  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CALLBACK_REQUESTED", case: handoffCase }),
      });
      if (response.ok) {
        return {
          ok: true,
          configured: true,
          message: `${handoffCase.id}: llamada solicitada. El asesor recibirá el resumen antes de contactarte.`,
          case: handoffCase,
        };
      }
    } catch { /* La solicitud local permanece disponible para la demo. */ }
  }

  return {
    ok: true,
    configured: false,
    message: `${handoffCase.id}: solicitud guardada para la demo. Falta conectar el endpoint seguro de telefonía.`,
    case: handoffCase,
  };
}
