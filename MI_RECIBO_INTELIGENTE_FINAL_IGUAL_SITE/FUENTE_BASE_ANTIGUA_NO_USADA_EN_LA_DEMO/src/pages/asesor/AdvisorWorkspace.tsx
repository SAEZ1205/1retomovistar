import { useState } from "react";
import CasoDetalle from "./CasoDetalle";
import DashboardAsesor from "./DashboardAsesor";
import { getCases, updateCaseStatus } from "@/src/services/handoffService";
import type { CaseStatus, HandoffCase } from "@/src/types/case";
import Icon from "@/src/components/shared/Icon";
import MovistarLogo from "@/src/components/shared/MovistarLogo";

export default function AdvisorWorkspace() {
  const [cases, setCases] = useState<HandoffCase[]>(() => getCases());
  const [selected, setSelected] = useState<HandoffCase | undefined>();

  function changeStatus(status: CaseStatus) {
    if (!selected) return;
    const updated = updateCaseStatus(selected.id, status);
    if (updated) setSelected(updated);
    setCases(getCases());
  }

  return (
    <main className="advisor-workspace">
      <nav className="advisor-topbar"><div><MovistarLogo /><strong>LucIA · Consola de atención</strong></div><a href="/"><Icon name="phone" size={18} /> Volver a Mi Movistar</a></nav>
      {selected
        ? <CasoDetalle item={selected} onBack={() => setSelected(undefined)} onStatus={changeStatus} />
        : <DashboardAsesor cases={cases} onOpen={setSelected} onRefresh={() => setCases(getCases())} />}
    </main>
  );
}
