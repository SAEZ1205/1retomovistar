import scenarios from "@/backend/data/demo/scenarios.json";

export type DemoScenarioId = "normal" | "prorrateo" | "reconexion" | "descuento";

const allowed: DemoScenarioId[] = ["normal", "prorrateo", "reconexion", "descuento"];

function resolveScenario(): DemoScenarioId {
  if (typeof window === "undefined") return "normal";
  const value = new URLSearchParams(window.location.search).get("caso") as DemoScenarioId | null;
  return value && allowed.includes(value) ? value : "normal";
}

export const activeScenarioId = resolveScenario();
export const activeScenario = scenarios[activeScenarioId];
export const demoScenarios = scenarios;

export default activeScenario;
