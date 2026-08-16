import billing from "@/src/data/mocks/billingData";
import type { BillAnalysis, Receipt } from "@/src/types/billing";

export type { Receipt } from "@/src/types/billing";

export const customer = {
  name: billing.customer.name,
  fullName: billing.customer.full_name,
  line: billing.customer.line,
  account: billing.customer.account,
  planName: billing.customer.plan_name,
  planPrice: billing.customer.plan_price,
  planData: billing.customer.plan_gb,
  cycleStart: billing.customer.cycle_start,
  cycleEnd: billing.customer.cycle_end,
  daysRemaining: billing.customer.days_remaining,
};

export const receipts: Receipt[] = billing.receipts.map((receipt) => ({
  slug: receipt.slug,
  month: receipt.label,
  shortMonth: receipt.short_month,
  period: receipt.period,
  issued: receipt.issued,
  due: receipt.due,
  code: receipt.code,
  amount: receipt.amount,
  previous: receipt.previous,
  status: receipt.status as Receipt["status"],
  usage: receipt.usage_gb,
  note: receipt.note,
  charges: receipt.charges as Receipt["charges"],
  explanation: receipt.explanation,
  evidence: receipt.evidence,
  file: receipt.file,
}));

export const currentReceipt = receipts.at(-1)!;
export const previousReceipt = receipts.at(-2)!;
export const dailyUsage = billing.daily_usage;
export const benefits = billing.benefits;
export const offer = billing.offer;
export const usageCategories = billing.usage_categories.map((item) => ({
  label: item.label,
  detail: item.detail,
  value: item.gb,
  color: item.color,
}));

export async function getBills() { return receipts; }
export async function getCurrentBill() { return currentReceipt; }
export async function getBillAnalysis(): Promise<BillAnalysis> {
  return {
    current: currentReceipt,
    previous: previousReceipt,
    difference: currentReceipt.amount - previousReceipt.amount,
    evidence: { status: "VERIFIED", sources: currentReceipt.evidence, explanation: currentReceipt.explanation },
  };
}

export function money(value: number) { return `S/${value.toFixed(2)}`; }
