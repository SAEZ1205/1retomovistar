import { receipts } from "@/src/services/billingService";

export default function ReceiptTrend() {
  const amounts = receipts.map((receipt) => receipt.amount);
  const min = 54;
  const max = 88;
  const points = amounts.map((amount, index) => ({
    x: 36 + index * 96,
    y: 144 - ((amount - min) / (max - min)) * 94,
  }));
  const path = points.map((point, index) => `${index ? "L" : "M"}${point.x},${point.y}`).join(" ");
  const area = `${path} L${points.at(-1)?.x},164 L${points[0].x},164 Z`;

  return (
    <div className="trend-chart" role="img" aria-label="Evolución del recibo de marzo a agosto">
      <svg viewBox="0 0 560 190" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#00a9e0" stopOpacity=".28" />
            <stop offset="1" stopColor="#00a9e0" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[50, 97, 144].map((y) => <line key={y} x1="25" x2="530" y1={y} y2={y} className="grid-line" />)}
        <path d={area} className="trend-area" />
        <path d={path} className="trend-line" />
        {points.map((point, index) => (
          <g key={receipts[index].slug}>
            <circle cx={point.x} cy={point.y} r={index === points.length - 1 ? 7 : 5} className={index === points.length - 1 ? "trend-dot current" : "trend-dot"} />
            <text x={point.x} y="184" textAnchor="middle" className="trend-label">{receipts[index].shortMonth}</text>
          </g>
        ))}
      </svg>
      <div className="trend-callout"><span>Agosto</span><strong>S/82.90</strong><small>+S/23</small></div>
    </div>
  );
}
