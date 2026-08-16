import fs from "node:fs";
import { readLocalEnv } from "./env-reader.mjs";

const env = readLocalEnv();
const checks = [
  ["Node 22 o superior", Number(process.versions.node.split(".")[0]) >= 22],
  [".env.local creado", fs.existsSync(".env.local")],
  ["Gemini configurado", Boolean(env.GEMINI_API_KEY?.trim())],
  ["Modelo Gemini definido", Boolean(env.GEMINI_MODEL?.trim())],
  ["Twilio completo", ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_WHATSAPP_FROM", "CALLCENTER_WHATSAPP_TO"].every((key) => env[key]?.trim())],
  ["6 recibos PDF", fs.readdirSync("public/recibos").filter((name) => name.endsWith(".pdf")).length === 6],
];
console.log("\nDIAGNÓSTICO LOCAL\n");
for (const [label, ok] of checks) console.log(`${ok ? "✓" : "○"} ${label}`);
console.log("\nLos círculos indican configuración opcional pendiente; la app igualmente abre en modo demo.\n");
