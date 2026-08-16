import Badge from "@/src/components/shared/Badge";
import Card from "@/src/components/shared/Card";
import Header from "@/src/components/shared/Header";
import Icon from "@/src/components/shared/Icon";
import { money, receipts } from "@/src/services/billingService";
import type { Receipt } from "@/src/types/billing";
import ReceiptTrend from "./ReceiptTrend";

export default function ReceiptHistory({ onBack, onSelect }: { onBack: () => void; onSelect: (receipt: Receipt) => void }) {
  return (
    <><Header title="Mis recibos" onBack={onBack} /><div className="screen-content history-screen"><Card><div className="section-title"><span><small>MARZO — AGOSTO 2026</small><h2>Historial verificado</h2></span><Badge tone="green">6 PDF</Badge></div><ReceiptTrend /></Card><Card className="receipt-list">{receipts.slice().reverse().map((receipt) => <button key={receipt.slug} onClick={() => onSelect(receipt)}><span className="pdf-mark">PDF</span><span><strong>{receipt.month}</strong><small>{receipt.note}</small></span><b>{money(receipt.amount)}</b><Icon name="arrow-right" /></button>)}</Card></div></>
  );
}
