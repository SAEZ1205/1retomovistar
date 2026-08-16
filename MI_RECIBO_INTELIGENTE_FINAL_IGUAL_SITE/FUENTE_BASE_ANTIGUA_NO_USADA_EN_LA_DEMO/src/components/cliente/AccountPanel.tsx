import Icon from "@/src/components/shared/Icon";
import MobileStatusBar from "@/src/components/shared/MobileStatusBar";
import { customer } from "@/src/services/billingService";

export default function AccountPanel() {
  return (
    <section className="account-panel">
      <MobileStatusBar />
      <header><button aria-label="Menú"><Icon name="menu" size={30} /></button><h1>¡Hola, {customer.name}!</h1><button aria-label="Actualizar"><Icon name="refresh" size={30} /></button></header>
      <div className="gold-row"><span><i><Icon name="gift" /></i> Movistar Gold</span><button>Ver beneficios <Icon name="arrow-right" /></button></div>
      <button className="line-row" aria-label={`Línea ${customer.line}, Postpago`}><Icon name="phone" /><span><strong>{customer.line}</strong><small>Postpago</small></span><Icon name="chevron-down" /></button>
    </section>
  );
}
