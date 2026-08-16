import { useState } from "react";
import AccountPanel from "@/src/components/cliente/AccountPanel";
import Icon from "@/src/components/shared/Icon";
import MovistarLogo from "@/src/components/shared/MovistarLogo";
import { currentReceipt, customer, money } from "@/src/services/billingService";

export default function Inicio({ onReceipt, onBenefits, onStore }: { onReceipt: () => void; onBenefits: () => void; onStore: () => void }) {
  const remaining = customer.planData - currentReceipt.usage;
  const [showPromo, setShowPromo] = useState(true);
  const [promoIndex, setPromoIndex] = useState(0);
  const promos = [
    { kicker: "BENEFICIO PARA TI", title: "Conecta con los que más quieres", action: "Descubre aquí", onClick: onBenefits, position: "68% center" },
    { kicker: "RENUEVA TU EQUIPO", title: "Tecnología para estar siempre conectado", action: "Ver equipos", onClick: onStore, position: "78% center" },
    { kicker: "TU RECIBO ACTUAL", title: "Revisa el detalle de tus consumos", action: "Ver recibo", onClick: onReceipt, position: "62% center" },
  ];
  const promo = promos[promoIndex];
  return (
    <div className="home-screen">
      <AccountPanel />
      <div className="home-content">
        <section className={`promo-banner promo-${promoIndex}`}><img src="/hero-movistar-v5.webp" alt="Jóvenes usando su celular" style={{ objectPosition: promo.position }} /><div><small>{promo.kicker}</small><strong>{promo.title}</strong><button onClick={promo.onClick}>{promo.action}</button></div></section>
        <div className="carousel-dots" aria-label="Promociones">{promos.map((item, index) => <button key={item.kicker} className={index === promoIndex ? "active" : ""} onClick={() => setPromoIndex(index)} aria-label={`Ver promoción ${index + 1}`} aria-current={index === promoIndex ? "true" : undefined} />)}</div>
        <div className="home-shortcuts"><button><i><Icon name="globe" /></i><strong>Mejorar<br />mi plan</strong></button><button onClick={onStore}><i><Icon name="device" /></i><strong>Renovar<br />mi equipo</strong></button></div>
        <section className="consumption-home"><h2>Mis consumos</h2><p>Se renuevan al cierre del ciclo · {customer.daysRemaining} días</p><div className="consumption-cards"><article><strong>Datos del plan</strong><span><i style={{ "--progress": `${Math.min(360, (currentReceipt.usage / customer.planData) * 360)}deg` } as React.CSSProperties} /><b>{remaining.toFixed(1)} GB</b><small>de {customer.planData} GB</small></span></article><article><strong>Apps ilimitadas</strong><span className="free"><i style={{ "--progress": "360deg" } as React.CSSProperties} /><b>Activo</b><small>en tu plan</small></span></article></div></section>
        <section className="home-bill"><Icon name="receipt" /><span><small>{currentReceipt.month}</small><strong>{money(currentReceipt.amount)} {currentReceipt.status.toLowerCase()}</strong></span><button onClick={onReceipt}>Ver recibo</button></section>
        <h2 className="access-title">Accesos directos</h2>
        <div className="direct-grid"><button><Icon name="wifi" /><strong>Planes hogar</strong><small>Internet y TV</small></button><button onClick={onStore}><Icon name="device" /><strong>Renovar mi equipo</strong><small>Precios especiales</small></button><button><Icon name="receipt" /><strong>Mejorar mi plan</strong><small>Revisa alternativas</small></button><button><Icon name="home" /><strong>Movistar Total</strong><small>Todos tus servicios</small></button></div>
      </div>
      {showPromo && <aside className="renew-promo"><MovistarLogo /><span><strong>Es momento de RENOVAR tu CELU</strong><small>Aprovecha precios especiales y envío gratis.</small></span><button onClick={() => setShowPromo(false)} aria-label="Cerrar promoción"><Icon name="close" size={20} /></button></aside>}
    </div>
  );
}
