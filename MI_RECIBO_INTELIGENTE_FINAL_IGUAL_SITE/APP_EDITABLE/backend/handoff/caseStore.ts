import type { CaseStatus, HandoffCase } from "../../src/types/case";

const cases = new Map<string, HandoffCase>();
export function saveCase(item: HandoffCase) { cases.set(item.id, item); return item; }
export function listCases() { return [...cases.values()]; }
export function readCase(id: string) { return cases.get(id); }
export function setCaseStatus(id: string, status: CaseStatus) { const item = cases.get(id); if (!item) return undefined; const updated = { ...item, status }; cases.set(id, updated); return updated; }
