import Modal from "@/src/components/shared/Modal";
import Icon from "@/src/components/shared/Icon";
import { money } from "@/src/services/billingService";
import type { Receipt } from "@/src/types/billing";

export default function ReceiptModal({ receipt, close }: { receipt: Receipt; close: () => void }) {
  return (
    <Modal title={`Recibo de ${receipt.month}`} close={close} className="pdf-modal">
      <header><div><span>PDF</span><strong>{receipt.month}</strong><small>{money(receipt.amount)} · {receipt.status}</small></div><button onClick={close}><Icon name="close" /></button></header>
      <iframe src={receipt.file} title={`Recibo de ${receipt.month}`} />
      <footer><a href={receipt.file} target="_blank" rel="noreferrer">Abrir PDF</a><a href={receipt.file} download><Icon name="download" size={18} /> Descargar</a></footer>
    </Modal>
  );
}
