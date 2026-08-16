import { NextResponse } from "next/server";
import { whatsappConfigured } from "@/backend/handoff/whatsapp";

export async function GET() {
  return NextResponse.json({
    gemini: Boolean(process.env.GEMINI_API_KEY?.trim()),
    geminiModel: process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash",
    whatsapp: whatsappConfigured(),
    receipts: 6,
    financialAnswers: "verified",
  });
}
