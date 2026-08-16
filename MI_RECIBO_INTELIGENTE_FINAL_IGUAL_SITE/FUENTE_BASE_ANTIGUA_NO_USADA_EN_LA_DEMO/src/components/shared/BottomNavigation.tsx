import type { MainSection } from "@/src/types/billing";
import Icon, { type IconName } from "./Icon";

const items: { id: MainSection; label: string; icon: IconName }[] = [
  { id: "inicio", label: "Inicio", icon: "home" },
  { id: "recibo", label: "Recibo", icon: "receipt" },
  { id: "beneficios", label: "Beneficios", icon: "gift" },
  { id: "tienda", label: "Tienda", icon: "shop" },
  { id: "soporte", label: "Soporte", icon: "support" },
];

export default function BottomNavigation({ active, onChange }: { active: MainSection; onChange: (section: MainSection) => void }) {
  return (
    <nav className="bottom-navigation" aria-label="Navegación principal">
      {items.map((item) => (
        <button key={item.id} className={`${active === item.id ? "active" : ""} ${item.id === "beneficios" ? "featured" : ""}`} onClick={() => onChange(item.id)} aria-current={active === item.id ? "page" : undefined}>
          <span><Icon name={item.icon} size={24} /></span><small>{item.label}</small>
        </button>
      ))}
    </nav>
  );
}
