import type { BillAnalysis, Receipt } from "../../src/types/billing";
import { buildEvidence } from "./evidence";

export function compareBills(current: Receipt, previous: Receipt): BillAnalysis {
  return {
    current,
    previous,
    difference: Number((current.amount - previous.amount).toFixed(2)),
    evidence: buildEvidence(current),
  };
}
