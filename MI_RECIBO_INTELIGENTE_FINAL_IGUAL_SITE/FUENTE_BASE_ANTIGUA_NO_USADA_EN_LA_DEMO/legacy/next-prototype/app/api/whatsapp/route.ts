import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppSummary, type ConversationLine } from "@/backend/handoff/whatsapp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const conversation = Array.isArray(body?.conversation)
      ? body.conversation
          .filter((line: unknown): line is ConversationLine => {
            if (!line || typeof line !== "object") return false;
            const item = line as Record<string, unknown>;
            return (item.role === "user" || item.role === "bot") && typeof item.text === "string";
          })
          .map((line: ConversationLine) => ({ role: line.role, text: line.text.slice(0, 700) }))
      : [];
    const result = await sendWhatsAppSummary(conversation);
    return NextResponse.json(result, { status: result.ok || !result.configured ? 200 : 502 });
  } catch {
    return NextResponse.json({ ok: false, configured: true, message: "No se pudo preparar el resumen." }, { status: 500 });
  }
}
