import type { PropsWithChildren } from "react";
import Icon from "./Icon";
import MovistarLogo from "./MovistarLogo";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <main className="app-stage">
      <aside className="desktop-brand-panel" aria-hidden="true">
        <div className="desktop-brand-logo"><MovistarLogo /><strong>Mi Movistar</strong></div>
        <span className="desktop-brand-kicker">TU LÍNEA, MÁS SIMPLE</span>
        <h1>Todo lo que necesitas, en un solo lugar.</h1>
        <p>Revisa tu consumo, entiende cada cobro y gestiona tu línea con la experiencia de Mi Movistar.</p>
        <div className="desktop-brand-features">
          <span><Icon name="receipt" /><b>Recibos claros</b></span>
          <span><Icon name="chart" /><b>Consumo al día</b></span>
          <span><Icon name="support" /><b>Ayuda inmediata</b></span>
        </div>
        <a className="desktop-advisor-link" href="?modo=asesor"><Icon name="headset" size={17} /> Abrir demo Call Center</a>
        <small>Vista de demostración · Navega desde la barra inferior</small>
      </aside>
      <div className="mobile-app">{children}</div>
    </main>
  );
}
