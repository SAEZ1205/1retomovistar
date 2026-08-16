import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const port = Number(process.env.PORT || 3000);
const root = process.cwd();
const mime = {".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".png":"image/png",".svg":"image/svg+xml",".pdf":"application/pdf",".webp":"image/webp",".jpg":"image/jpeg",".jpeg":"image/jpeg"};

http.createServer(async (req,res)=>{
  try {
    const raw = new URL(req.url, `http://${req.headers.host}`).pathname;
    let rel = decodeURIComponent(raw === "/" ? "/index.html" : raw);
    rel = normalize(rel).replace(/^(\.\.(\/|\\|$))+/, "");
    let file = join(root, rel);
    try { if ((await stat(file)).isDirectory()) file = join(file,"index.html"); }
    catch {
      // This app uses query params rather than path routing, but SPA fallback is useful for hosting.
      if (!extname(rel)) file = join(root,"index.html");
      else throw new Error("not found");
    }
    const data = await readFile(file);
    res.writeHead(200,{"Content-Type":mime[extname(file).toLowerCase()]||"application/octet-stream","Cache-Control":"no-cache"});
    res.end(data);
  } catch {
    res.writeHead(404,{"Content-Type":"text/plain; charset=utf-8"});
    res.end("404 Not Found");
  }
}).listen(port,"0.0.0.0",()=>console.log(`Mi Recibo Inteligente: http://localhost:${port}`));
