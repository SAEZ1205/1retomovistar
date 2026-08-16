import CaseTable from "@/src/components/asesor/CaseTable";
import type { HandoffCase } from "@/src/types/case";
import Icon from "@/src/components/shared/Icon";

export default function DashboardAsesor({ cases, onOpen = () => undefined, onRefresh = () => undefined }: { cases: HandoffCase[]; onOpen?: (item: HandoffCase) => void; onRefresh?: () => void }) {
  const pending = cases.filter((item) => item.status !== "resolved").length;
  const callbacks = cases.filter((item) => item.callbackStatus === "requested").length;
  return <section className="advisor-dashboard"><header><span><small>CALL CENTER · BANDEJA EN TIEMPO REAL</small><h1>Casos derivados por LucIA</h1><p>El asesor recibe el contexto antes de atender al cliente.</p></span><button onClick={onRefresh}><Icon name="refresh" size={18} /> Actualizar</button></header><div className="advisor-metrics"><article><small>CASOS TOTALES</small><strong>{cases.length}</strong></article><article><small>POR ATENDER</small><strong>{pending}</strong></article><article><small>LLAMADAS SOLICITADAS</small><strong>{callbacks}</strong></article></div><CaseTable cases={cases} onOpen={onOpen} /></section>;
}
