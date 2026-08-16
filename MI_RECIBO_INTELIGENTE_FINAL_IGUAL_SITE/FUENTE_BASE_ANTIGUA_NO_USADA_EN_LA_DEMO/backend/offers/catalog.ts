import billing from "../data/demo/billing_data.json";
import type { Offer } from "../../src/types/offer";

export const offerCatalog: Offer[] = [billing.offer];
export function getCatalogOffer(id: string) { return offerCatalog.find((offer) => offer.id === id); }
