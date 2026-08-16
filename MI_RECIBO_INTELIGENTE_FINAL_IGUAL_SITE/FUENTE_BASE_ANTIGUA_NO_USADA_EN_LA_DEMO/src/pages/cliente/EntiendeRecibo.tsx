import type { CSSProperties } from "react";
import BillBreakdown from "@/src/components/cliente/BillBreakdown";
import ReceiptTrend from "@/src/components/cliente/ReceiptTrend";
import LuciaButton from "@/src/components/lucia/LuciaButton";
import LuciaImage from "@/src/components/lucia/LuciaImage";
import Badge from "@/src/components/shared/Badge";
import Button from "@/src/components/shared/Button";
import Card from "@/src/components/shared/Card";
import Header from "@/src/components/shared/Header";
import Icon from "@/src/components/shared/Icon";
import { benefits, currentReceipt, customer, money, scenario } from "@/src/services/billingService";
import type { Resolution } from "@/src/types/lucia";

export default function EntiendeRecibo({ resolution, usedPercent, remaining, currentDelta, onBack, onHistory, onConsumption, onOpenChat, onResolved, onHuman }: { resolution: Resolution; usedPercent: number; remaining: number; currentDelta: number; onBack: () => void; onHistory: () => void; onConsumption: () => void; onOpenChat: () => void; onResolved: () => void; onHuman: () => void }) {
  const deltaLabel = currentDelta === 0 ? "Sin cambio" : `${currentDelta > 0 ? "+" : ""}${money(currentDelta)}`;
  const verified = scenario.analysis.evidence_status === "VERIFIED";
  return (
    <div className="assistant-screen">
      <Header title="Entiende tu recibo" onBack={onBack} />
      <div className="screen-content">
        <section className="assistant-hero"><LuciaImage compact /><div><small>LUCIA · ASISTENTE DE FACTURACIÓN</small><h2>{scenario.analysis.headline}</h2><p>{scenario.analysis.explanation}</p><div className="analysis-steps"><span><Icon name="check" size={15} /> Comparado</span><span><Icon name="check" size={15} /> {verified ? "Verificado" : "Revisado"}</span><span><Icon name="sparkles" size={15} /> Explicado</span></div></div><Badge tone={verified ? "green" : "blue"}>{scenario.analysis.evidence_status}</Badge></section>
        <Card className="difference-card"><span><small>Recibo anterior</small><strong>{money(currentReceipt.previous)}</strong></span><Icon name="arrow-right" /><span><small>Recibo actual</small><strong>{money(currentReceipt.amount)}</strong></span><b>{deltaLabel}</b></Card>
        <Card className="explanation-card"><div className="section-title"><span><small>DESGLOSE DEL TOTAL</small><h2>¿Qué cambió este mes?</h2></span><Badge tone="blue">Basado en evidencia</Badge></div><p className="plain-explanation">{scenario.analysis.explanation}</p><BillBreakdown /><div className="evidence-box"><Icon name="check" /><span><strong>Evidencia utilizada</strong><small>{scenario.analysis.evidence.join(" · ")}</small></span></div><details className="traceability"><summary><span><Icon name="sparkles" size={17} /> ¿Cómo llegamos a esta explicación?</span><Icon name="chevron-down" size={18} /></summary><div><p><b>1</b><span><strong>Comparamos el recibo actual con el anterior</strong><small>FACTURACION-CLIENTES · total y detalle de cargos</small></span></p><p><b>2</b><span><strong>Identificamos qué concepto cambió</strong><small>{currentReceipt.charges.map((item) => item.label).join(" · ")}</small></span></p><p><b>3</b><span><strong>Cruzamos la causa con el dataset correspondiente</strong><small>{scenario.datasetBasis.join(" · ")}</small></span></p><p><b>✓</b><span><strong>Resultado: {scenario.analysis.evidence_status}</strong><small>LucIA interpreta y redacta; los montos vienen de datos estructurados.</small></span></p></div></details></Card>
        <LuciaButton onClick={onOpenChat} compact />
        <Card className="trend-card"><div className="section-title"><span><small>ÚLTIMOS 6 MESES</small><h2>Así cambió tu recibo</h2></span><button onClick={onHistory}>Ver recibos</button></div><ReceiptTrend /><p className="chart-note"><strong>Escenario demo: {scenario.label}.</strong> {scenario.analysis.explanation}</p></Card>
        <Card className="usage-summary"><div><small>DATOS MÓVILES</small><h2>Te quedan {remaining.toFixed(1)} GB</h2><p>de {customer.planData} GB para {customer.daysRemaining} días.</p><Button variant="secondary" onClick={onConsumption}>Ver mi consumo</Button></div><div className="usage-ring" style={{ "--usage": `${usedPercent * 3.6}deg` } as CSSProperties}><span><strong>{usedPercent}%</strong><small>usado</small></span></div></Card>
        <Card className="benefit-reminder"><Icon name="gift" /><div><small>YA ESTÁ INCLUIDO EN TU PLAN</small><h2>No pagues dos veces por lo que ya tienes</h2><p>{benefits.join(" · ")}</p></div></Card>
        <Card className={`decision-card ${resolution}`}><div><small>SIGUIENTE PASO</small><h2>{resolution === "resolved" ? "Consulta resuelta" : resolution === "needs-help" ? "Podemos preparar el caso para un asesor" : "¿La explicación resolvió tu duda?"}</h2><p>{resolution === "resolved" ? "Si quieres una oferta o mejorar tu plan, pídeselo a LucIA. No aparecerá una promoción sin que la solicites." : resolution === "needs-help" ? "La derivación conserva el contexto para que no tengas que repetir la historia." : "Si aún tienes dudas, LucIA intentará explicarlo de otra forma antes de derivarte."}</p></div>{resolution === "pending" && <footer><Button onClick={onResolved}>Sí, quedó claro</Button><Button variant="secondary" onClick={onOpenChat}>Explícamelo mejor</Button></footer>}{resolution === "resolved" && <Button onClick={onOpenChat}>Seguir conversando con LucIA</Button>}{resolution === "needs-help" && <Button onClick={onHuman}>Preparar derivación</Button>}</Card>
      </div>
    </div>
  );
}
