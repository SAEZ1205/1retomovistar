import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReceiptHistory from "@/src/components/cliente/ReceiptHistory";
import ReceiptModal from "@/src/components/cliente/ReceiptModal";
import LuciaChat from "@/src/components/lucia/LuciaChat";
import LuciaFloatingButton from "@/src/components/lucia/LuciaFloatingButton";
import BottomNavigation from "@/src/components/shared/BottomNavigation";
import Layout from "@/src/components/shared/Layout";
import VisualSection from "@/src/components/cliente/VisualSection";
import Inicio from "@/src/pages/cliente/Inicio";
import MisRecibos from "@/src/pages/cliente/MisRecibos";
import EntiendeRecibo from "@/src/pages/cliente/EntiendeRecibo";
import ConoceRecibo from "@/src/pages/cliente/ConoceRecibo";
import AdvisorWorkspace from "@/src/pages/asesor/AdvisorWorkspace";
import { benefits, currentReceipt, customer, dailyUsage, offer } from "@/src/services/billingService";
import { sendHandoff } from "@/src/services/handoffService";
import { requestCallback } from "@/src/services/callCenterService";
import { askLucia } from "@/src/services/luciaService";
import { offerConfirmation } from "@/src/services/offerService";
import type { MainSection, Receipt, ReceiptView } from "@/src/types/billing";
import type { CallCenterState, WhatsAppState } from "@/src/types/case";
import type { ChatMessage, Resolution } from "@/src/types/lucia";
import type { OfferStatus } from "@/src/types/offer";

const quickQuestions = ["¿Por qué subió mi recibo?", "¿Qué me cobraron en mayo?", "¿Cuántos gigas me quedan?", "¿Qué beneficios ya tengo?"];

export default function App() {
  const [section, setSection] = useState<MainSection>("inicio");
  const [receiptView, setReceiptView] = useState<ReceiptView>("overview");
  const [showChangeAlert, setShowChangeAlert] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const [resolution, setResolution] = useState<Resolution>("pending");
  const [showResolutionPrompt, setShowResolutionPrompt] = useState(false);
  const [offerStatus, setOfferStatus] = useState<OfferStatus>("locked");
  const [whatsappState, setWhatsappState] = useState<WhatsAppState>("idle");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [callCenterState, setCallCenterState] = useState<CallCenterState>("idle");
  const [callCenterMessage, setCallCenterMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "bot", text: "Hola, soy LucIA. Puedo explicarte tus recibos y tu consumo usando únicamente datos verificados.", source: "Base financiera de seis recibos" }]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const usedPercent = Math.round((currentReceipt.usage / customer.planData) * 100);
  const remaining = customer.planData - currentReceipt.usage;
  const average = currentReceipt.usage / dailyUsage.length;
  const currentDelta = currentReceipt.amount - currentReceipt.previous;
  const advisorMode = useMemo(() => new URLSearchParams(window.location.search).get("modo") === "asesor", []);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [section, receiptView]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, asking, handoff, showResolutionPrompt, offerStatus]);

  const visiblePage = useMemo(() => {
    if (section === "inicio") return <Inicio onReceipt={() => navigate("recibo")} onBenefits={() => navigate("beneficios")} onStore={() => navigate("tienda")} />;
    if (section === "beneficios" || section === "tienda" || section === "soporte") return <VisualSection kind={section} onBack={() => navigate("inicio")} />;
    if (receiptView === "assistant") return <EntiendeRecibo resolution={resolution} usedPercent={usedPercent} remaining={remaining} currentDelta={currentDelta} onBack={() => setReceiptView("overview")} onHistory={() => setReceiptView("history")} onConsumption={() => setReceiptView("consumption")} onOpenChat={() => setShowChat(true)} onResolved={markResolved} onHuman={askForHuman} />;
    if (receiptView === "consumption") return <ConoceRecibo usedPercent={usedPercent} remaining={remaining} average={average} onBack={() => setReceiptView("assistant")} />;
    if (receiptView === "history") return <ReceiptHistory onBack={() => setReceiptView("overview")} onSelect={setSelectedReceipt} />;
    return <MisRecibos onBack={() => navigate("inicio")} onAssistant={() => setReceiptView("assistant")} onOpenChat={() => setShowChat(true)} onConsumption={() => setReceiptView("consumption")} onHistory={() => setReceiptView("history")} onSelectReceipt={setSelectedReceipt} showAlert={showChangeAlert} dismissAlert={() => setShowChangeAlert(false)} />;
  }, [section, receiptView, resolution, usedPercent, remaining, currentDelta, average, showChangeAlert]);

  function navigate(next: MainSection) {
    setSection(next);
    if (next === "recibo") setReceiptView("overview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function ask(raw: string) {
    const clean = raw.trim();
    if (!clean || asking) return;
    setQuestion("");
    setResolution("pending");
    setShowResolutionPrompt(false);
    setOfferStatus("locked");
    setMessages((current) => [...current, { role: "user", text: clean }]);
    setAsking(true);
    try {
      const result = await askLucia(clean);
      setMessages((current) => [...current, { role: "bot", text: result.answer, source: result.source, suggestHuman: result.intent === "unknown" }]);
      setShowResolutionPrompt(result.needsResolutionCheck);
      if (result.intent === "unknown") setHandoff(true);
    } finally { setAsking(false); }
  }

  function submitQuestion(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void ask(question); }

  function markResolved() {
    setResolution("resolved");
    setShowResolutionPrompt(false);
    setHandoff(false);
    setOfferStatus("available");
    setMessages((current) => [...current, { role: "bot", text: `Perfecto. Recuerda que tu plan ya incluye ${benefits.join(", ").toLowerCase()}. Como tu consulta quedó resuelta, ahora sí puedo mostrar una opción pertinente.`, source: "Beneficios vigentes · Regla comercial O-87" }]);
  }

  function askForHuman() {
    setResolution("needs-help");
    setShowResolutionPrompt(false);
    setOfferStatus("locked");
    setHandoff(true);
    setMessages((current) => [...current, { role: "bot", text: "Preparé un resumen con tu línea, recibo, evidencia y conversación para que no tengas que repetirlo.", source: "Resumen de derivación" }]);
  }

  async function prepareHandoff() {
    if (whatsappState === "sending") return;
    setWhatsappState("sending");
    const result = await sendHandoff(messages);
    setWhatsappMessage(result.message);
    setWhatsappState(result.ok ? "sent" : "error");
  }

  async function prepareCallback() {
    if (callCenterState === "sending") return;
    setCallCenterState("sending");
    const result = await requestCallback(messages);
    setCallCenterMessage(result.message);
    setCallCenterState(result.ok ? "requested" : "error");
  }

  function acceptOffer() {
    setOfferStatus("accepted");
    setMessages((current) => [...current, { role: "bot", text: offerConfirmation(offer), source: "Catálogo controlado · Oferta O-87" }]);
  }

  if (advisorMode) return <AdvisorWorkspace />;

  return (
    <Layout>
      {visiblePage}
      {section === "recibo" && !showChat && <LuciaFloatingButton onClick={() => setShowChat(true)} />}
      <BottomNavigation active={section} onChange={navigate} />
      {showChat && <LuciaChat messages={messages} asking={asking} question={question} questions={quickQuestions} showFeedback={showResolutionPrompt} offerStatus={offerStatus} offer={offer} handoff={handoff} whatsappState={whatsappState} whatsappMessage={whatsappMessage} callCenterState={callCenterState} callCenterMessage={callCenterMessage} endRef={chatEndRef} onClose={() => setShowChat(false)} onQuestion={setQuestion} onSubmit={submitQuestion} onAsk={(value) => void ask(value)} onResolved={markResolved} onHuman={askForHuman} onAcceptOffer={acceptOffer} onDeclineOffer={() => setOfferStatus("declined")} onSendHandoff={() => void prepareHandoff()} onRequestCallback={() => void prepareCallback()} />}
      {selectedReceipt && <ReceiptModal receipt={selectedReceipt} close={() => setSelectedReceipt(null)} />}
    </Layout>
  );
}
