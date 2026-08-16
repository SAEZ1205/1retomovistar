import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const envPath = path.resolve(".env.local");
const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

function parseEnv(text) {
  return Object.fromEntries(text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#") && line.includes("=")).map((line) => {
    const index = line.indexOf("=");
    return [line.slice(0, index), line.slice(index + 1)];
  }));
}

const values = parseEnv(existing);
const ask = (prompt) => new Promise((resolve) => {
  const promptReader = readline.createInterface({ input: process.stdin, output: process.stdout });
  promptReader.question(prompt, (answer) => {
    promptReader.close();
    resolve(answer.trim());
  });
});

async function secret(prompt) {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") return ask(prompt);
  process.stdout.write(prompt);
  return new Promise((resolve) => {
    let value = "";
    process.stdin.setRawMode(true);
    process.stdin.resume();
    const onData = (buffer) => {
      const char = buffer.toString("utf8");
      if (char === "\u0003") process.exit(130);
      if (char === "\r" || char === "\n") {
        process.stdin.setRawMode(false);
        process.stdin.off("data", onData);
        process.stdout.write("\n");
        resolve(value);
        return;
      }
      if (char === "\u007f" || char === "\b") {
        if (value.length) { value = value.slice(0, -1); process.stdout.write("\b \b"); }
        return;
      }
      if (/^[\x20-\x7E]+$/.test(char)) { value += char; process.stdout.write("•".repeat(char.length)); }
    };
    process.stdin.on("data", onData);
  });
}

console.log("\nCONFIGURACIÓN LOCAL · MI MOVISTAR / LUCIA\n");
console.log("Las claves se guardan solo en .env.local, un archivo ignorado por Git.\n");

const geminiKey = await secret(`Clave GEMINI_API_KEY${values.GEMINI_API_KEY ? " (Enter para conservar la actual)" : ""}: `);
if (geminiKey) values.GEMINI_API_KEY = geminiKey;
const model = await ask(`Modelo Gemini [${values.GEMINI_MODEL || "gemini-2.5-flash"}]: `);
values.GEMINI_MODEL = model || values.GEMINI_MODEL || "gemini-2.5-flash";

const configureWhatsApp = (await ask("¿Quieres configurar también Twilio WhatsApp ahora? (s/N): ")).toLowerCase() === "s";
if (configureWhatsApp) {
  const sid = await ask(`TWILIO_ACCOUNT_SID${values.TWILIO_ACCOUNT_SID ? " (Enter para conservar)" : ""}: `);
  if (sid) values.TWILIO_ACCOUNT_SID = sid;
  const token = await secret(`TWILIO_AUTH_TOKEN${values.TWILIO_AUTH_TOKEN ? " (Enter para conservar)" : ""}: `);
  if (token) values.TWILIO_AUTH_TOKEN = token;
  const from = await ask(`Número Sandbox FROM [${values.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886"}]: `);
  values.TWILIO_WHATSAPP_FROM = from || values.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
  const to = await ask(`Tu WhatsApp destino [${values.CALLCENTER_WHATSAPP_TO || "whatsapp:+51968821435"}]: `);
  values.CALLCENTER_WHATSAPP_TO = to || values.CALLCENTER_WHATSAPP_TO || "whatsapp:+51968821435";
}

const output = [
  "# Generado por npm run configurar. No compartas este archivo.",
  `GEMINI_API_KEY=${values.GEMINI_API_KEY || ""}`,
  `GEMINI_MODEL=${values.GEMINI_MODEL || "gemini-2.5-flash"}`,
  "",
  `TWILIO_ACCOUNT_SID=${values.TWILIO_ACCOUNT_SID || ""}`,
  `TWILIO_AUTH_TOKEN=${values.TWILIO_AUTH_TOKEN || ""}`,
  `TWILIO_WHATSAPP_FROM=${values.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886"}`,
  `CALLCENTER_WHATSAPP_TO=${values.CALLCENTER_WHATSAPP_TO || "whatsapp:+51968821435"}`,
  "",
].join("\n");
fs.writeFileSync(envPath, output, { mode: 0o600 });
console.log("\n✓ Configuración guardada en .env.local.");
console.log("✓ Ahora ejecuta: npm run dev\n");
