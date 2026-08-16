import { readLocalEnv } from "./env-reader.mjs";

const env = { ...process.env, ...readLocalEnv() };
const key = env.GEMINI_API_KEY?.trim();
const model = env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
if (!key) {
  console.error("✗ Falta GEMINI_API_KEY. Ejecuta: npm run configurar");
  process.exit(1);
}

console.log(`Probando Gemini con ${model}...`);
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-goog-api-key": key },
  body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Devuelve únicamente la palabra OK" }] }], generationConfig: { temperature: 0, maxOutputTokens: 8 } }),
});
if (!response.ok) {
  const detail = await response.text();
  console.error(`✗ Gemini respondió ${response.status}. ${detail.slice(0, 300)}`);
  process.exit(1);
}
console.log("✓ Gemini respondió correctamente. La clave y el modelo funcionan.");
