import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.pdf':'application/pdf'};

http.createServer(async (req,res)=>{
  try {
    const clean = decodeURIComponent((req.url || '/').split('?')[0]);
    let file = path.join(root, clean === '/' ? 'index.html' : clean.replace(/^\//,''));
    const s = await stat(file).catch(()=>null);
    if (!s || s.isDirectory()) file = path.join(root,'index.html');
    const data = await readFile(file);
    res.writeHead(200, {'Content-Type': types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});
    res.end(data);
  } catch (e) {
    res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'}); res.end('No encontrado');
  }
}).listen(port, '0.0.0.0', ()=>console.log(`LucIA disponible en http://localhost:${port}`));
