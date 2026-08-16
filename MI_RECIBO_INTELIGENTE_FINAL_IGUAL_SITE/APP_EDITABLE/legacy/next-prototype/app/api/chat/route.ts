import { NextRequest, NextResponse } from "next/server";
import { answerFor, geminiClassification, localClassification } from "@/backend/ai/assistant";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json({ answer: "Escribe una pregunta para poder revisarla." }, { status: 400 });
    }

    let gemini = null;
    try { gemini = await geminiClassification(message); } catch { gemini = null; }
    const classification = gemini || localClassification(message);
    const result = answerFor(classification);
    return NextResponse.json({
      ...result,
      intent: classification.intent,
      grounded: true,
      provider: gemini ? "gemini" : "local",
      source: `${gemini ? "Gemini interpretó" : "Interpretación local"} · ${result.evidence.join(" · ")}`,
    });
  } catch {
    const result = answerFor({ intent: "unknown" });
    return NextResponse.json({ ...result, intent: "unknown", grounded: true, provider: "local", source: "Base verificada" });
  }
}
