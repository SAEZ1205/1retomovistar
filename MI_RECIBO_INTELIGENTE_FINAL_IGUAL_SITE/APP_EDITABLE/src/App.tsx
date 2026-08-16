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
import { activeScenarioId, benefits, currentReceipt, customer, dailyUsage, offer, scenario } from "@/src/services/billingService";
import { sendHandoff } from "@/src/services/handoffService";
import { requestCallback } from "@/src/services/callCenterService";
import { askLucia } from "@/src/services/luciaService";
import { offerConfirmation } from "@/src/services/offerService";
import type { MainSection, Receipt, ReceiptView } from "@/src/types/billing";
import type { CallCenterState, WhatsAppState } from "@/src/types/case";
import type { ChatMessage, Resolution } from "@/src/types/lucia";
import type { OfferStatus } from "@/src/types/offer";

const scenarioQuestion: Record<string, string> = {
  normal: "¿Cambió algo en mi recibo?",
  prorrateo: "¿Qué es el prorrateo que me cobraron?",
  reconexion: "¿Por qué me cobraron reconexión?",
  descuento: "¿Por qué terminó mi descuento?",
};

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
  const [billingPending, setBillingPending] = useState(false);
  const [showResolutionPrompt, setShowResolutionPrompt] = useState(false);
  const [offerStatus, setOfferStatus] = useState<OfferStatus>("locked");
  const [whatsappState, setWhatsappState] = useState<WhatsAppState>("idle");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [callCenterState, setCallCenterState] = useState<CallCenterState>("idle");
  const [callCenterMessage, setCallCenterMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "bot", text: `Hola, soy LucIA. Estoy revisando tu caso de ${scenario.label.toLowerCase()}. Pregúntame como hablarías normalmente; usaré únicamente la evidencia disponible.`, source: `Caso demo ${scenario.label} · ${scenario.analysis.evidence_status}` }]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = useMemo(() => [scenarioQuestion[activeScenarioId], "¿Por qué cambió mi recibo?", "¿Cuántos gigas me quedan?", "¿Qué beneficios tengo?"], []);
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
    const historyBeforeQuestion = messages;
    setQuestion("");
    setShowResolutionPrompt(false);
    setHandoff(false);
    setOfferStatus("locked");
    setMessages((current) => [...current, { role: "user", text: clean }]);
    setAsking(true);
    try {
      const rawResult = await askLucia(clean, historyBeforeQuestion);
      const result = rawResult.showOffer && billingPending
        ? { ...rawResult, showOffer: false, answer: "Sí tengo una opción para tu línea, pero primero terminemos de aclarar el cobro actual. Cuando confirmes que quedó claro, pídeme la oferta y te la muestro.", source: "Regla comercial: problema pendiente → no oferta" }
        : rawResult;
      setMessages((current) => [...current, { role: "bot", text: result.answer, source: result.source, suggestHuman: result.suggestHuman }]);
      setShowResolutionPrompt(result.needsResolutionCheck);
      if (result.needsResolutionCheck) {
        setResolution("pending");
        setBillingPending(true);
      }
      if (result.suggestHuman) {
        setResolution("needs-help");
        setBillingPending(false);
        setHandoff(true);
      }
      if (result.showOffer && !billingPending) setOfferStatus("available");
    } finally { setAsking(false); }
  }

  function submitQuestion(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void ask(question); }

  function markResolved() {
    setResolution("resolved");
    setBillingPending(false);
    setShowResolutionPrompt(false);
    setHandoff(false);
    setOfferStatus("locked");
    setMessages((current) => [...current, { role: "bot", text: `Perfecto. Recuerda que tu plan ya incluye ${benefits.join(", ").toLowerCase()}. Si quieres revisar una oferta o mejorar tu plan, pídemelo y te mostraré una opción acorde a este caso.`, source: "Beneficios vigentes · oferta solo a pedido" }]);
  }

  function askForHuman() {
    setResolution("needs-help");
    setBillingPending(false);
    setShowResolutionPrompt(false);
    setOfferStatus("locked");
    setHandoff(true);
    setMessages((current) => [...current, { role: "bot", text: "De acuerdo. Preparé el contexto del recibo y la conversación para que un asesor pueda continuar sin que repitas todo.", source: "Resumen de derivación" }]);
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
    setMessages((current) => [...current, { role: "bot", text: offerConfirmation(offer), source: `Oferta demo controlada ${offer.id}` }]);
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
