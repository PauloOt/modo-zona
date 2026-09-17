/* Servidor estático mínimo, sem dependências.
 * O service worker e a instalação como PWA só funcionam em origem
 * segura — localhost conta.
 *
 *   node tools/serve.mjs [porta]
 */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize, extname } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.argv[2]) || 5173;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon'
};

createServer(async (req, res) => {
  let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if(rel.endsWith('/')) rel += 'index.html';

  // impede sair da pasta do projeto
  const file = join(root, normalize(rel).replace(/^(\.\.[/\\])+/, ''));
  if(!file.startsWith(root)){ res.writeHead(403).end('403'); return; }

  try{
    const info = await stat(file);
    if(!info.isFile()) throw new Error('nao e arquivo');
    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': body.length,
      // o SW controla o cache; o servidor de desenvolvimento não deve atrapalhar
      'Cache-Control': 'no-cache'
    });
    res.end(body);
  }catch{
    res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'}).end('404 ' + rel);
  }
}).listen(port, () => {
  console.log('Modo Zona em http://localhost:' + port);
});
