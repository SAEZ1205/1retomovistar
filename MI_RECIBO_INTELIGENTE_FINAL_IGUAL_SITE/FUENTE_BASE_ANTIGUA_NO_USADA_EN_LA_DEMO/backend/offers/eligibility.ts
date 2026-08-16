import type { OfferEligibility } from "../../src/types/offer";

export function checkEligibility({ queryResolved, usagePercent, hasCommercialRule }: { queryResolved: boolean; usagePercent: number; hasCommercialRule: boolean }): OfferEligibility {
  if (!queryResolved) return { eligible: false, reason: "Consulta no resuelta: no se permite mostrar una oferta." };
  if (!hasCommercialRule) return { eligible: false, reason: "No existe una regla comercial válida." };
  return usagePercent >= 85
    ? { eligible: true, reason: "Consulta resuelta, cliente elegible y regla comercial válida." }
    : { eligible: false, reason: "El consumo no alcanza el umbral controlado." };
}
