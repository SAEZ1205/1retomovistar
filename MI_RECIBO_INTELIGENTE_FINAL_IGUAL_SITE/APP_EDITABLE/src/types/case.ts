import type { ChatMessage } from "./lucia";
import type { EvidenceStatus } from "./billing";

export type WhatsAppState = "idle" | "sending" | "sent" | "error";
export type CallCenterState = "idle" | "sending" | "requested" | "sent" | "error";
export type CaseStatus = "new" | "assigned" | "in-progress" | "resolved";
export type ContactPreference = "dashboard" | "callback" | "whatsapp";
export type CallbackStatus = "not-requested" | "requested" | "calling" | "completed" | "failed";

export type BillingContext = {
  financialAccount: string;
  invoiceNumber: string;
  billingCycle: string;
  evidenceStatus: EvidenceStatus;
  chargeCodes: string[];
  dataSources: string[];
};

export type HandoffCase = {
  id: string;
  customerName: string;
  line: string;
  question: string;
  receiptSlug: string;
  evidence: string[];
  conversation: ChatMessage[];
  reason: string;
  status: CaseStatus;
  createdAt: string;
  billingContext: BillingContext;
  contactPreference: ContactPreference;
  callbackStatus: CallbackStatus;
};

export type HandoffResponse = {
  ok: boolean;
  configured?: boolean;
  message: string;
  case?: HandoffCase;
};
