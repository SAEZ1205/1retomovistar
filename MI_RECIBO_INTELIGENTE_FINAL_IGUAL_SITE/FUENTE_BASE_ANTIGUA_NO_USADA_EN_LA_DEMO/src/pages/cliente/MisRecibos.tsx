import LuciaButton from "@/src/components/lucia/LuciaButton";
import MonthlyBillChart from "@/src/components/cliente/MonthlyBillChart";
import Card from "@/src/components/shared/Card";
import Header from "@/src/components/shared/Header";
import Icon from "@/src/components/shared/Icon";
import { currentReceipt, customer, money, receipts, scenario } from "@/src/services/billingService";
import type { Receipt } from "@/src/types/billing";

export default function MisRecibos({ onBack, onAssistant, onOpenChat, onConsumption, onHistory, onSelectReceipt, showAlert, dismissAlert }: { onBack: () => void; onAssistant: () => void; onOpenChat: () => void; onConsumption: () => void; onHistory: () => void; onSelectReceipt: (receipt: Receipt) => void; showAlert: boolean; dismissAlert: () => void }) {
  const recent = receipts.slice(-3);
  return (
    <div className="receipt-screen">
      <Header title="Mi recibo" onBack={onBack} />
      <div className="screen-content">
        <nav className="month-tabs" aria-label="Recibos por mes"><button className="month-back" aria-label="Mes anterior"><Icon name="arrow-left" /></button>{recent.map((receipt) => <button key={receipt.slug} className={receipt.slug === currentReceipt.slug ? "active" : ""} aria-current={receipt.slug === currentReceipt.slug ? "page" : undefined}>{receipt.shortMonth}</button>)}</nav>
        <Card className="current-bill-card"><div className="bill-status"><span><small>Estado:</small><strong className={currentReceipt.status === "Pendiente" ? "pending" : undefined}>{currentReceipt.status}</strong></span><span><small>Total:</small><b>{money(currentReceipt.amount)}</b></span></div><dl><div><dt>Vencimiento:</dt><dd>{currentReceipt.due}</dd></div><div><dt>Código de pago:</dt><dd>{currentReceipt.code}</dd></div><div><dt>Escenario demo:</dt><dd>{scenario.label}</dd></div></dl></Card>

        <h2 className="receipt-section-title notification-title">¿Necesitas ayuda?</h2>
        <div className="lucia-notification-wrap"><LuciaButton onClick={onOpenChat} />{showAlert && <button className="lucia-notification-close" onClick={dismissAlert} aria-label="Cerrar aviso"><Icon name="close" size={18} /></button>}</div>
        <button className="receipt-analysis-link" onClick={onAssistant}><span><Icon name="sparkles" size={18} /> Ver análisis completo del recibo</span><Icon name="arrow-right" size={18} /></button>

        <h2 className="receipt-section-title">Plan y adicionales</h2>
        <Card className="plan-card"><div><i><Icon name="phone" /></i><span><strong>{customer.planName}</strong><small>Plan contratado vigente</small></span><b>{money(customer.planPrice)}</b></div><button onClick={onAssistant}><i><Icon name="gift" /></i><span>{currentReceipt.charges.length > 1 ? `${currentReceipt.charges.length - 1} concepto(s) adicional(es) este ciclo` : "Sin cargos adicionales este ciclo"}</span><Icon name="chevron-down" /></button></Card>

        <div className="section-heading receipt-tools-heading"><h2>Gestiona tu recibo</h2><small>Todo en un toque</small></div>
        <div className="receipt-tools" aria-label="Accesos de recibo">
          <button onClick={onAssistant}><i className="ai"><Icon name="sparkles" /></i><span><strong>Entender cobros</strong><small>{scenario.analysis.evidence_status} · {scenario.label}</small></span><Icon name="arrow-right" /></button>
          <button onClick={onConsumption}><i className="usage"><Icon name="chart" /></i><span><strong>Conoce tu consumo</strong><small>Día por día</small></span><Icon name="arrow-right" /></button>
          <button onClick={onHistory}><i className="history"><Icon name="receipt" /></i><span><strong>Mis 6 recibos</strong><small>Compara montos</small></span><Icon name="arrow-right" /></button>
          <button onClick={() => onSelectReceipt(currentReceipt)}><i className="pdf"><Icon name="download" /></i><span><strong>Ver mi recibo</strong><small>Documento demo imprimible</small></span><Icon name="arrow-right" /></button>
        </div>

        <div className="section-heading"><h2>Evolutivo mensual</h2><button onClick={onHistory}>Ver detalle</button></div>
        <Card className="monthly-chart-card"><MonthlyBillChart /></Card>

        <h2 className="receipt-section-title">Otros</h2>
        <Card className="other-actions"><button><i className="green"><Icon name="receipt" /></i><span><strong>Afiliación al Recibo Digital</strong><small>Puedes registrar o actualizar tus datos para recibirlo por correo.</small></span><Icon name="arrow-right" /></button><button onClick={() => onSelectReceipt(currentReceipt)}><i><Icon name="download" /></i><span><strong>Visualiza tu recibo</strong><small>Aquí encontrarás el documento generado para este escenario.</small></span><Icon name="arrow-right" /></button><button onClick={onHistory}><i className="purple"><Icon name="chart" /></i><span><strong>Historial de recibos</strong><small>Compara los últimos seis meses.</small></span><Icon name="arrow-right" /></button></Card>
      </div>
    </div>
  );
}
