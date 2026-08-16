import { money, receipts } from "@/src/services/billingService";

export default function MonthlyBillChart() {
  const max = Math.max(...receipts.map((receipt) => receipt.amount));
  return (
    <div className="monthly-bars" role="img" aria-label="Evolución mensual de los últimos seis recibos">
      {receipts.map((receipt) => (
        <div key={receipt.slug}><strong>{money(receipt.amount).replace(".00", "")}</strong><span><i style={{ height: `${Math.max(48, receipt.amount / max * 118)}px` }} /></span><b>{receipt.shortMonth}</b><small>2026</small></div>
      ))}
    </div>
  );
}
