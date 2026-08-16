import type { Evidence, Receipt } from "../../src/types/billing";

export function buildEvidence(receipt?: Receipt): Evidence {
  if (!receipt) return { status: "NONE", sources: [], explanation: "No existe un recibo asociado." };
  if (!receipt.evidence.length) return { status: "PARTIAL", sources: [], explanation: receipt.explanation };
  return { status: "VERIFIED", sources: receipt.evidence, explanation: receipt.explanation };
}
