import EvidencePanel from "@/src/components/asesor/EvidencePanel";
import type { CaseStatus, HandoffCase } from "@/src/types/case";
import Icon from "@/src/components/shared/Icon";

export default function CasoDetalle({ item, onBack = () => undefined, onStatus = () => undefined }: { item?: HandoffCase; onBack?: () => void; onStatus?: (status: CaseStatus) => void }) {
  if (!item) return <p>Selecciona un caso para revisar su contexto.</p>;
  return <section className="advisor-detail"><button className="advisor-back" onClick={onBack}><Icon name="arrow-left" size={18} /> Volver a la bandeja</button><header><div><small>{item.id} · {item.billingContext.evidenceStatus}</small><h1>{item.customerName}</h1><p>{item.question}</p></div><span className={`advisor-status ${item.status}`}>{item.status}</span></header><div className="advisor-actionbar"><button onClick={() => onStatus("assigned")}>Tomar caso</button><button onClick={() => onStatus("in-progress")}>Iniciar atención</button><button onClick={() => onStatus("resolved")}>Marcar resuelto</button></div><EvidencePanel item={item} /></section>;
}
