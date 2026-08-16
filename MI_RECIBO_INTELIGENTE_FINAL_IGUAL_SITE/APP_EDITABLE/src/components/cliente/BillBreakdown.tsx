import Icon from "@/src/components/shared/Icon";
import { currentReceipt, money } from "@/src/services/billingService";

export default function BillBreakdown() {
  return (
    <div className="bill-breakdown">
      {currentReceipt.charges.map((charge) => (
        <div key={charge.label} className={charge.kind === "plan" ? "plan" : "extra"}>
          <span><i><Icon name={charge.kind === "plan" ? "phone" : "sparkles"} size={19} /></i><strong>{charge.label}</strong></span>
          <b>{money(charge.amount)}</b>
        </div>
      ))}
      <div className="total"><span>Total verificado</span><b>{money(currentReceipt.amount)}</b></div>
    </div>
  );
}
