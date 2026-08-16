import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const distRoot = new URL("../dist/", import.meta.url);
const clientRoot = new URL("../dist/client/", import.meta.url);
const serverRoot = new URL("../dist/server/", import.meta.url);
const packagedConfigRoot = new URL("../dist/.openai/", import.meta.url);

await mkdir(clientRoot, { recursive: true });
await mkdir(serverRoot, { recursive: true });
await mkdir(packagedConfigRoot, { recursive: true });

const excluded = new Set(["client", "server", ".openai"]);
for (const entry of await readdir(distRoot, { withFileTypes: true })) {
  if (excluded.has(entry.name)) continue;
  await cp(join(distRoot.pathname, entry.name), join(clientRoot.pathname, entry.name), { recursive: true, force: true });
}

const hosting = await readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8");
JSON.parse(hosting);
await writeFile(new URL("../dist/.openai/hosting.json", import.meta.url), hosting);

const worker = `const worker = {
  async fetch(request, env) {
    if (!env?.ASSETS?.fetch) {
      return new Response("Mi Movistar no pudo cargar sus recursos.", { status: 503 });
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;

    const url = new URL(request.url);
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");
    if (!acceptsHtml && url.pathname.includes(".")) return response;

    url.pathname = "/index.html";
    return env.ASSETS.fetch(new Request(url, request));
  },
};

export default worker;
`;

await writeFile(new URL("../dist/server/index.js", import.meta.url), worker);
