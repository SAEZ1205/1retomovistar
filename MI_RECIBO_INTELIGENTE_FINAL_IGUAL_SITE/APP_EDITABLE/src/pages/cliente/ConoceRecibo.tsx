import LastSevenDays from "@/src/components/cliente/LastSevenDays";
import Card from "@/src/components/shared/Card";
import Header from "@/src/components/shared/Header";
import Icon from "@/src/components/shared/Icon";
import { currentReceipt, customer, usageCategories } from "@/src/services/billingService";

export default function ConoceRecibo({ usedPercent, remaining, average, onBack }: { usedPercent: number; remaining: number; average: number; onBack: () => void }) {
  return (
    <div className="consumption-screen"><Header title="Mi consumo" onBack={onBack} /><div className="screen-content"><Card className="usage-overview"><small>PLAN DE {customer.planData} GB</small><h2>Has usado {currentReceipt.usage.toFixed(1)} GB</h2><p>Te quedan <strong>{remaining.toFixed(1)} GB</strong> para los próximos {customer.daysRemaining} días.</p><div className="progress-track"><i style={{ width: `${usedPercent}%` }} /><b>{usedPercent}%</b></div><div className="metric-grid"><span>Promedio diario<strong>{average.toFixed(2)} GB</strong></span><span>Máximo del ciclo<strong>1.80 GB</strong></span></div></Card><Card className="week-card"><div className="section-title"><span><small>ÚLTIMOS 7 DÍAS</small><h2>Consumo día por día</h2></span></div><LastSevenDays /><p className="chart-note"><strong>Hoy usaste 1.8 GB.</strong> Video fue la categoría que más consumió.</p></Card><Card className="category-card"><div className="section-title"><span><small>TOTAL: {currentReceipt.usage.toFixed(1)} GB</small><h2>¿En qué usaste tus datos?</h2></span></div><div className="category-list">{usageCategories.map((category) => <div key={category.label}><i style={{ background: category.color }} /><span><strong>{category.label}</strong><small>{category.detail}</small><em><b style={{ width: `${category.value / currentReceipt.usage * 100}%`, background: category.color }} /></em></span><b>{category.value.toFixed(1)} GB</b></div>)}</div></Card><Card className="recommendation-card"><Icon name="check" /><div><small>RECOMENDACIÓN</small><h2>No necesitas cambiar de plan todavía</h2><p>Un solo mes alto no justifica pagar más todos los meses.</p></div></Card></div></div>
  );
}
