export type BillingScenario = "prorrateo" | "reconexion" | "fin-descuento" | "cambio-plan" | "cargo-adicional";

export const scenarioLabels: Record<BillingScenario, string> = {
  prorrateo: "Cobro proporcional por días activos",
  reconexion: "Cargo registrado por reconexión",
  "fin-descuento": "Retorno al precio regular al terminar una promoción",
  "cambio-plan": "Variación respaldada por una orden de cambio de plan",
  "cargo-adicional": "Servicio o paquete agregado durante el ciclo",
};

export function describeScenario(scenario: BillingScenario) { return scenarioLabels[scenario]; }
