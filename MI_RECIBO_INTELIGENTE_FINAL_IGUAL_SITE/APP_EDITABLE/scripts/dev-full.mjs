import { spawn } from "node:child_process";

const shell = process.platform === "win32";
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

const ai = spawn(npm, ["run", "dev:ai"], { stdio: "inherit", shell });
const web = spawn(npm, ["run", "dev"], { stdio: "inherit", shell });

function stop() {
  ai.kill("SIGTERM");
  web.kill("SIGTERM");
}

process.on("SIGINT", () => { stop(); process.exit(0); });
process.on("SIGTERM", () => { stop(); process.exit(0); });

ai.on("exit", (code) => { if (code && code !== 0) console.error(`LucIA local terminó con código ${code}`); });
web.on("exit", (code) => { if (code && code !== 0) console.error(`Vite terminó con código ${code}`); });
