import LuciaImage from "./LuciaImage";

export default function LuciaFloatingButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="lucia-floating-button" onClick={onClick} aria-label="Abrir chat con LucIA">
      <LuciaImage compact />
      <span><small>ASISTENTE IA</small><strong>Pregúntale a LucIA</strong></span>
      <i aria-hidden="true" />
    </button>
  );
}
