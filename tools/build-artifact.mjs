/* Gera dist/artifact.html a partir do index.html.
 *
 * A plataforma de Artifacts do Claude injeta o próprio esqueleto
 * (<!doctype>, <html>, <head>, <body> e um reset) na hora de publicar.
 * Este script tira daqui o que lá é duplicado — os blocos marcados
 * com <!--#standalone--> e as tags de documento — para não haver
 * dois fontes para manter.
 *
 *   node tools/build-artifact.mjs
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const src = await readFile(join(root, 'index.html'), 'utf8');

const out = src
  // blocos exclusivos da versão standalone (manifest, reset, registro do SW)
  .replace(/[ \t]*<!--#standalone-->[\s\S]*?<!--\/#standalone-->\n?/g, '')
  // tags de documento — a plataforma põe as dela
  .replace(/^<!doctype html>\n?/i, '')
  .replace(/^<html[^>]*>\n?/im, '')
  .replace(/<\/html>\s*$/i, '')
  .replace(/^[ \t]*<\/?(head|body)>\n?/gim, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim() + '\n';

for(const tag of ['<!doctype', '<html', '<head>', '<body>', 'manifest.webmanifest', 'serviceWorker']){
  if(out.toLowerCase().includes(tag.toLowerCase())){
    console.error(`! sobrou "${tag}" no arquivo gerado — confira os marcadores #standalone`);
    process.exit(1);
  }
}

await mkdir(join(root, 'dist'), { recursive: true });
await writeFile(join(root, 'dist', 'artifact.html'), out, 'utf8');

const kb = (Buffer.byteLength(out) / 1024).toFixed(1);
console.log(`dist/artifact.html — ${kb} kB, ${out.split('\n').length} linhas`);
