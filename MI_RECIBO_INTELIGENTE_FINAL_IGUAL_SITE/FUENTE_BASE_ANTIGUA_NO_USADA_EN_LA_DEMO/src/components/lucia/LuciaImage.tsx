export default function LuciaImage({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? "lucia-avatar compact" : "lucia-avatar"}>
      <img src="/lucia-mascot-v5.png" alt="LucIA, asistente virtual" />
      <i aria-hidden="true" />
    </span>
  );
}
