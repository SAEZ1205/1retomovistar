import { currentReceipt, customer, money, offer } from "./billingService";
import type { Offer, OfferEligibility } from "@/src/types/offer";

export function getOffer(): Offer { return offer; }
export function getOfferEligibility(queryResolved: boolean): OfferEligibility {
  if (!queryResolved) return { eligible: false, reason: "La consulta todavía no está resuelta." };
  const usedPercent = currentReceipt.usage / customer.planData;
  return usedPercent >= 0.85
    ? { eligible: true, reason: offer.reason }
    : { eligible: false, reason: "El consumo todavía no supera la regla comercial." };
}
export function offerConfirmation(selected: Offer) { return `Simulación completada: elegiste ${selected.name} por ${money(selected.price)}. No se realizó ningún cobro real.`; }
