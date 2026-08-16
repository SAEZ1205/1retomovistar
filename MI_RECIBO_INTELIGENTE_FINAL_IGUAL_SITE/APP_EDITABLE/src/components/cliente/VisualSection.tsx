import Header from "@/src/components/shared/Header";
import Icon, { type IconName } from "@/src/components/shared/Icon";

type Kind = "beneficios" | "tienda" | "soporte";
const content: Record<Kind, { title: string; hero: string; description: string; items: { icon: IconName; title: string; detail: string }[] }> = {
  beneficios: { title: "Beneficios", hero: "Tu categoría Movistar Gold", description: "Disfruta descuentos, experiencias y sorpresas por ser parte del programa.", items: [{ icon: "gift", title: "Cine y entretenimiento", detail: "Beneficios exclusivos de tu categoría" }, { icon: "data", title: "Datos para tus apps", detail: "Revisa lo incluido en tu plan" }, { icon: "sparkles", title: "Promociones del mes", detail: "Nuevas opciones para ti" }] },
  tienda: { title: "Tienda", hero: "Mejora tu plan Hogar", description: "Encuentra el plan, paquete o equipo que mejor se adapta a ti.", items: [{ icon: "wifi", title: "Planes hogar", detail: "Internet y TV" }, { icon: "globe", title: "Mejorar mi plan", detail: "Opciones disponibles" }, { icon: "device", title: "Renovación de equipo", detail: "Precios especiales" }, { icon: "shop", title: "Comprar paquetes", detail: "Datos y adicionales" }] },
  soporte: { title: "Soporte", hero: "¿Cómo podemos ayudarte?", description: "", items: [{ icon: "support", title: "Tengo una avería", detail: "Realizar un autodiagnóstico" }, { icon: "data", title: "Medir velocidad de internet", detail: "" }, { icon: "chart", title: "Seguimiento de mi pedido y/o avería", detail: "" }, { icon: "wifi", title: "Ver centros de atención", detail: "" }, { icon: "phone", title: "Administrar mi línea", detail: "" }, { icon: "data", title: "Ver mi consumo de datos", detail: "" }, { icon: "sparkles", title: "Aprender tips de uso", detail: "Sácale provecho a tu servicio" }] },
};

export default function VisualSection({ kind, onBack }: { kind: Kind; onBack: () => void }) {
  const page = content[kind];
  return <><Header title={page.title} onBack={onBack} icon={kind === "tienda" ? "shop" : undefined} /><div className={`visual-page ${kind}`}><section className="visual-hero">{kind === "tienda" && <img src="/hero-movistar-v5.webp" alt="Familia disfrutando su plan hogar" />}<div><small>{kind === "soporte" ? "" : "MI MOVISTAR"}</small><h2>{page.hero}</h2>{page.description && <p>{page.description}</p>}</div>{kind === "soporte" && <i className="support-illustration"><Icon name="headset" size={70} /></i>}</section><div className="visual-grid">{page.items.map((item) => <button key={item.title}><i><Icon name={item.icon} /></i><span><strong>{item.title}</strong>{item.detail && <small>{item.detail}</small>}</span><Icon name="arrow-right" /></button>)}</div></div></>;
}
