export type OfferStatus = "locked" | "available" | "accepted" | "declined";

export type Offer = {
  id: string;
  name: string;
  price: number;
  duration: string;
  reason: string;
  rule: string;
};

export type OfferEligibility = {
  eligible: boolean;
  reason: string;
};
