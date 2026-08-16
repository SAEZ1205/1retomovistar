import { dailyUsage } from "@/src/services/billingService";

export default function LastSevenDays() {
  const values = dailyUsage.slice(-7);
  const labels = ["4 Ago", "5", "6", "7", "8", "9", "Hoy"];
  const max = Math.max(...values);
  return (
    <div className="week-chart" role="img" aria-label="Consumo de datos de los últimos siete días">
      {values.map((value, index) => (
        <div className="week-bar" key={`${labels[index]}-${value}`}>
          <strong>{value.toFixed(1)}</strong>
          <div><i className={index === values.length - 1 ? "today" : ""} style={{ height: `${Math.max(22, value / max * 100)}%` }} /></div>
          <small>{labels[index]}</small>
        </div>
      ))}
    </div>
  );
}
