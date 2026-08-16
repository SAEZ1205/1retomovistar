import Icon from "@/src/components/shared/Icon";
import LuciaImage from "./LuciaImage";

export default function LuciaButton({ onClick, compact = false }: { onClick: () => void; compact?: boolean }) {
  return (
    <button className={compact ? "lucia-entry compact" : "lucia-entry"} onClick={onClick}>
      <LuciaImage compact />
      <span className="lucia-entry-copy"><small><b>IA</b> LUCIA EN MI RECIBO</small><strong>¿Tienes dudas sobre este cobro?</strong><p>Pregúntale a LucIA y recibe una explicación con evidencia.</p><em>Abrir chat ahora</em></span>
      <span className="lucia-entry-arrow"><Icon name="arrow-right" /></span>
    </button>
  );
}
