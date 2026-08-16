import { money, offer } from "./billingService";
import type { Offer, OfferEligibility } from "@/src/types/offer";

export function getOffer(): Offer { return offer; }

export function getOfferEligibility(queryResolved: boolean, explicitlyRequested = false): OfferEligibility {
  if (!queryResolved) return { eligible: false, reason: "Primero debemos resolver la duda de facturación." };
  if (!explicitlyRequested) return { eligible: false, reason: "La oferta solo se muestra cuando el cliente la solicita." };
  return { eligible: true, reason: offer.reason };
}

export function offerConfirmation(selected: Offer) {
  return `Simulación completada: elegiste ${selected.name} por ${money(selected.price)}. No se realizó ningún cobro real.`;
}
