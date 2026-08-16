export default function Loader({ label = "Cargando" }: { label?: string }) {
  return <span className="ui-loader" role="status"><i /><span>{label}</span></span>;
}
