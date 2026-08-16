export type Resolution = "pending" | "resolved" | "needs-help";
export type Intent = "increase" | "breakdown" | "usage" | "categories" | "plan" | "receipts" | "receipt_month" | "payment" | "proration" | "discount_demo" | "benefits" | "offer" | "unknown";

export type ChatMessage = {
  role: "user" | "bot";
  text: string;
  source?: string;
  suggestHuman?: boolean;
};

export type LuciaMessage = ChatMessage;

export type ServiceStatus = {
  gemini: boolean;
  geminiModel: string;
  whatsapp: boolean;
  receipts: number;
  mode: "local" | "api";
};

export type LuciaReply = {
  answer: string;
  source: string;
  intent: Intent;
  needsResolutionCheck: boolean;
};

export type LuciaResponse = LuciaReply;
