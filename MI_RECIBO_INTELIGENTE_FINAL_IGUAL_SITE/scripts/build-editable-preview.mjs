import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const app = join(root, "APP_EDITABLE");
const appDist = join(app, "dist");
const output = join(root, "dist");

console.log("[preview] Instalando dependencias de APP_EDITABLE...");
execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", ["ci"], {
  cwd: app,
  stdio: "inherit",
});

console.log("[preview] Compilando React editable...");
execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "build"], {
  cwd: app,
  stdio: "inherit",
});

if (!existsSync(appDist)) {
  throw new Error("APP_EDITABLE/dist no fue generado.");
}

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync(appDist, output, { recursive: true });
console.log(`[preview] Preview lista en ${output}`);
