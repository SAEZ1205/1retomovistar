import type { HandoffCase } from "@/src/types/case";
import CaseCard from "./CaseCard";

export default function CaseTable({ cases, onOpen }: { cases: HandoffCase[]; onOpen: (item: HandoffCase) => void }) {
  return <div className="advisor-cases">{cases.length ? cases.map((item) => <CaseCard key={item.id} item={item} onOpen={() => onOpen(item)} />) : <p>No hay casos derivados en este navegador.</p>}</div>;
}
