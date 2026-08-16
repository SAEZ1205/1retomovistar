import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scenarios = JSON.parse(await fs.readFile(path.join(root, "backend/data/demo/scenarios.json"), "utf8"));
const outDir = path.join(root, "public/recibos/demo");
await fs.mkdir(outDir, { recursive: true });

const money = (n) => `S/${Number(n).toFixed(2)}`;
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (m) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));

for (const [scenarioId, data] of Object.entries(scenarios)) {
  for (const receipt of data.receipts) {
    const charges = receipt.charges.map((c) => `<tr><td>${escapeHtml(c.label)}</td><td>${money(c.amount)}</td></tr>`).join("");
    const evidence = receipt.evidence.map((e) => `<li>${escapeHtml(e)}</li>`).join("");
    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(receipt.label)} · Mi recibo</title><style>body{font-family:Arial,sans-serif;background:#f4f5f7;color:#222;margin:0}.wrap{max-width:760px;margin:28px auto;background:#fff;border-radius:18px;padding:28px;box-shadow:0 10px 32px #0001}.brand{color:#019be1;font-size:28px;font-weight:800}.tag{display:inline-block;background:#e9f7fd;color:#006e9f;border-radius:999px;padding:7px 12px;font-size:13px}h1{margin-bottom:6px}.total{font-size:42px;font-weight:800;margin:18px 0}.meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#f7f8fa;padding:16px;border-radius:12px}table{width:100%;border-collapse:collapse;margin-top:18px}td{padding:12px;border-bottom:1px solid #eee}td:last-child{text-align:right;font-weight:700}.explain{margin-top:20px;padding:16px;border-left:4px solid #019be1;background:#f2fbff}.evidence{margin-top:20px;padding:16px;background:#f8f8fa;border-radius:12px}.foot{font-size:12px;color:#666;margin-top:24px}.print{margin-top:18px;padding:11px 16px;border:0;border-radius:10px;background:#019be1;color:white;font-weight:700;cursor:pointer}@media print{body{background:#fff}.wrap{box-shadow:none;margin:0}.print{display:none}}</style></head><body><main class="wrap"><div class="brand">movistar <span style="font-weight:400">· demo académica</span></div><p class="tag">Escenario: ${escapeHtml(data.label)}</p><h1>Recibo ${escapeHtml(receipt.label)}</h1><div class="total">${money(receipt.amount)}</div><div class="meta"><div><b>Periodo</b><br>${escapeHtml(receipt.period)}</div><div><b>Vencimiento</b><br>${escapeHtml(receipt.due)}</div><div><b>N.º recibo</b><br>${escapeHtml(receipt.code)}</div><div><b>Estado</b><br>${escapeHtml(receipt.status)}</div></div><h2>Detalle</h2><table>${charges}</table><section class="explain"><b>¿Qué pasó este mes?</b><p>${escapeHtml(receipt.explanation)}</p></section><section class="evidence"><b>Evidencia usada por LucIA</b><ul>${evidence}</ul></section><button class="print" onclick="window.print()">Imprimir / Guardar como PDF</button><p class="foot">Recibo generado para la demostración del Reto 1. Datos anonimizados y estructura inspirada en el dataset oficial compartido para la hackathon.</p></main></body></html>`;
    await fs.writeFile(path.join(outDir, `${scenarioId}-${receipt.slug}.html`), html, "utf8");
  }
}
console.log(`Recibos demo generados en ${outDir}`);
