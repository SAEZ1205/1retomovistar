import type { CSSProperties, FormEvent, RefObject } from "react";
import Button from "@/src/components/shared/Button";
import Icon from "@/src/components/shared/Icon";
import type { CallCenterState, WhatsAppState } from "@/src/types/case";
import type { ChatMessage } from "@/src/types/lucia";
import type { Offer, OfferStatus } from "@/src/types/offer";
import LuciaImage from "./LuciaImage";
import LuciaMessage from "./LuciaMessage";
import TypingIndicator from "./TypingIndicator";
import QuickQuestions from "./QuickQuestions";

type Props = {
  messages: ChatMessage[]; asking: boolean; question: string; questions: string[];
  showFeedback: boolean; offerStatus: OfferStatus; offer: Offer; handoff: boolean;
  whatsappState: WhatsAppState; whatsappMessage: string; endRef: RefObject<HTMLDivElement | null>;
  callCenterState: CallCenterState; callCenterMessage: string;
  onClose: () => void; onQuestion: (value: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onAsk: (question: string) => void; onResolved: () => void; onHuman: () => void;
  onAcceptOffer: () => void; onDeclineOffer: () => void; onSendHandoff: () => void;
  onRequestCallback: () => void;
};

const offerBannerStyle: CSSProperties = {
  width: "100%",
  height: 118,
  objectFit: "cover",
  objectPosition: "center",
  borderRadius: 14,
  display: "block",
  marginBottom: 12,
};

function bannerForOffer(offer: Offer) {
  const text = `${offer.id} ${offer.name}`.toLowerCase();
  if (/30\s?gb|bono/.test(text)) return "/promos/plan-30gb.png";
  if (/49|225|cambia|port/.test(text)) return "/promos/inicio-cambiate.png";
  return "/promos/inicio-postpago.png";
}

export default function LuciaChat(props: Props) {
  const showStarterQuestions = props.messages.length <= 1 && !props.asking && !props.handoff && props.offerStatus === "locked";

  return (
    <div className="chat-backdrop" onMouseDown={(event) => event.target === event.currentTarget && props.onClose()}>
      <aside className="chat-panel" aria-label="Chat con LucIA">
        <header><div><LuciaImage compact /><span><strong>LucIA</strong><small><i /> En línea · respuestas verificadas</small></span></div><button onClick={props.onClose} aria-label="Cerrar"><Icon name="close" /></button></header>
        <div className="trust-strip"><Icon name="check" size={17} /> La IA interpreta; los montos salen de tus recibos.</div>
        <div className="chat-scroll">
          {props.messages.map((message, index) => <LuciaMessage key={`${message.role}-${index}`} message={message} onHuman={props.onHuman} />)}
          {props.asking && <TypingIndicator />}
          {props.offerStatus !== "locked" && (
            <section className="offer-card">
              <img src={bannerForOffer(props.offer)} alt={`Promoción recomendada: ${props.offer.name}`} style={offerBannerStyle} />
              <small>OFERTA CONTEXTUAL</small><h3>{props.offer.name}</h3><p>S/{props.offer.price.toFixed(2)} · {props.offer.duration}</p><span>{props.offer.reason}</span>
              {props.offerStatus === "available" && <div><Button onClick={props.onAcceptOffer}>Simular contratación</Button><Button variant="ghost" onClick={props.onDeclineOffer}>No gracias</Button></div>}
              {props.offerStatus === "accepted" && <b>✓ Contratación simulada; no se realizó ningún cobro.</b>}
              {props.offerStatus === "declined" && <b>Entendido. No volveré a mostrarla en esta sesión.</b>}
            </section>
          )}
          {props.handoff && (
            <section className="handoff-card"><Icon name="headset" /><div><small className="handoff-eyebrow">ATENCIÓN CON CONTEXTO</small><strong>El asesor ya puede recibir tu caso</strong><p>Le enviaremos tu pregunta, recibo, evidencia y conversación para que no repitas todo.</p><div className="handoff-actions"><Button onClick={props.onRequestCallback} disabled={props.callCenterState === "sending"}>{props.callCenterState === "sending" ? "Solicitando…" : "Quiero que me llamen"}</Button><Button variant="secondary" onClick={props.onSendHandoff} disabled={props.whatsappState === "sending"}>{props.whatsappState === "sending" ? "Preparando…" : "Solo enviar el caso"}</Button></div>{props.callCenterMessage && <small className="handoff-result">{props.callCenterMessage}</small>}{props.whatsappMessage && <small className="handoff-result">{props.whatsappMessage}</small>}<small className="handoff-privacy"><Icon name="check" size={13} /> Tu número no se muestra en la conversación.</small></div></section>
          )}
          {showStarterQuestions && <QuickQuestions questions={props.questions} onAsk={props.onAsk} />}
          <div ref={props.endRef} />
        </div>
        <form className="chat-input" onSubmit={props.onSubmit}><input value={props.question} onChange={(event) => props.onQuestion(event.target.value)} placeholder="Escríbeme como hablas normalmente…" aria-label="Pregunta para LucIA" /><button disabled={props.asking} aria-label="Enviar"><Icon name="send" size={20} /></button></form>
      </aside>
    </div>
  );
}
