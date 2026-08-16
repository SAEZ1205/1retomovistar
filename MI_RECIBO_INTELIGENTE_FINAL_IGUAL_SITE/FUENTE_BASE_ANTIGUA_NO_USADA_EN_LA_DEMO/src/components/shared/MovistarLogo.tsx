export default function MovistarLogo({ withName = false }: { withName?: boolean }) {
  return (
    <span className="movistar-logo" aria-label="Movistar">
      <svg viewBox="0 0 72 50" role="img" aria-hidden="true">
        <path d="M8 15C12 4 24 2 31 12l5 7 5-7C48 2 60 4 64 15c5 13-1 28-12 31-8 2-11-8-16-8s-8 10-16 8C9 43 3 28 8 15Z" fill="currentColor" />
      </svg>
      {withName && <strong>movistar</strong>}
    </span>
  );
}
