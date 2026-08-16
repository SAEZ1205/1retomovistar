export type MainSection = "inicio" | "recibo" | "beneficios" | "tienda" | "soporte";
export type ReceiptView = "overview" | "assistant" | "consumption" | "history";
export type Tab = "resumen" | "consumo" | "recibos";
export type EvidenceStatus = "VERIFIED" | "PARTIAL" | "NONE";

export type BillItem = {
  label: string;
  amount: number;
  kind: "plan" | "extra" | "adjustment";
};

export type Evidence = {
  status: EvidenceStatus;
  sources: string[];
  explanation: string;
};

export type Receipt = {
  slug: string;
  month: string;
  shortMonth: string;
  period: string;
  issued: string;
  due: string;
  code: string;
  amount: number;
  previous: number;
  status: "Pagado" | "Pendiente";
  usage: number;
  note: string;
  charges: BillItem[];
  explanation: string;
  evidence: string[];
  file: string;
};

export type Bill = Receipt;

export type BillAnalysis = {
  current: Receipt;
  previous: Receipt;
  difference: number;
  evidence: Evidence;
};
