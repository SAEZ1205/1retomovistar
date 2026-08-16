export default function FeedbackButtons({ onResolved, onHuman }: { onResolved: () => void; onHuman: () => void }) {
  return (
    <div className="resolution-card">
      <strong>¿La explicación resolvió tu duda?</strong>
      <p>Tu respuesta decide si corresponde una oferta o una derivación.</p>
      <div><button onClick={onResolved}>Sí, quedó claro</button><button onClick={onHuman}>Todavía tengo dudas</button></div>
    </div>
  );
}
