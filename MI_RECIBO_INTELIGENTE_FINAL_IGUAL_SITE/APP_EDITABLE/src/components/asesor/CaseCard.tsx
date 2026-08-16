import type { HandoffCase } from "@/src/types/case";

export default function CaseCard({ item, onOpen }: { item: HandoffCase; onOpen: () => void }) {
  return <button className="advisor-case" onClick={onOpen}><span><strong>{item.id}</strong><small>{item.customerName} · {item.line}</small></span><p>{item.question}<small>{item.contactPreference === "callback" ? "☎ Llamada solicitada" : "Caso digital"} · {item.billingContext.evidenceStatus}</small></p><b className={item.status}>{item.status}</b></button>;
}
