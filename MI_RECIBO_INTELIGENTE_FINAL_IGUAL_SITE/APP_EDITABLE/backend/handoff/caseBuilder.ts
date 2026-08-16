import billing from "../data/demo/billing_data.json";
import type { HandoffCase } from "../../src/types/case";
import type { ChatMessage } from "../../src/types/lucia";

export function buildCase(conversation: ChatMessage[], reason: string): HandoffCase {
  const current = billing.receipts.at(-1)!;
  return {
    id: `CASO-${Date.now().toString().slice(-6)}`,
    customerName: billing.customer.full_name,
    line: billing.customer.line,
    question: [...conversation].reverse().find((item) => item.role === "user")?.text ?? "Consulta de facturación",
    receiptSlug: current.slug,
    evidence: current.evidence,
    conversation: conversation.slice(-8),
    reason,
    status: "new",
    createdAt: new Date().toISOString(),
    billingContext: {
      financialAccount: billing.customer.account,
      invoiceNumber: current.code,
      billingCycle: current.period,
      evidenceStatus: "VERIFIED",
      chargeCodes: ["PLAN_40GB", "PAQ_10GB", "MUSICA"],
      dataSources: ["FACTURACION-CLIENTES", "Ordenes", "CATALOGO-OFERTAS"],
    },
    contactPreference: "dashboard",
    callbackStatus: "not-requested",
  };
}
