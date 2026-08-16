import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { readLocalEnv } from "./env-reader.mjs";

const env = { ...process.env, ...readLocalEnv() };
const required = ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_WHATSAPP_FROM", "CALLCENTER_WHATSAPP_TO"];
const missing = required.filter((key) => !env[key]?.trim());
if (missing.length) {
  console.error(`✗ Faltan: ${missing.join(", ")}. Ejecuta: npm run configurar`);
  process.exit(1);
}

const rl = readline.createInterface({ input, output });
console.log(`Se enviará un mensaje de prueba a ${env.CALLCENTER_WHATSAPP_TO}.`);
const confirmation = (await rl.question("¿Ya enviaste el mensaje join del Sandbox y deseas continuar? (s/N): ")).trim().toLowerCase();
rl.close();
if (confirmation !== "s") {
  console.log("Prueba cancelada sin enviar nada.");
  process.exit(0);
}

const sid = env.TWILIO_ACCOUNT_SID.trim();
const auth = Buffer.from(`${sid}:${env.TWILIO_AUTH_TOKEN.trim()}`).toString("base64");
const form = new URLSearchParams({
  From: env.TWILIO_WHATSAPP_FROM.trim(),
  To: env.CALLCENTER_WHATSAPP_TO.trim(),
  Body: "Prueba LucIA: WhatsApp está conectado correctamente. Contenido ficticio de demo.",
});
const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`, {
  method: "POST",
  headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
  body: form,
});
const data = await response.json().catch(() => ({}));
if (!response.ok) {
  console.error(`✗ Twilio rechazó el envío (${data.code || response.status}): ${data.message || "sin detalle"}`);
  process.exit(1);
}
console.log(`✓ Mensaje enviado. Estado inicial: ${data.status || "queued"}.`);
