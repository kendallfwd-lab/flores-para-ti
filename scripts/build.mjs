// Empaqueta todas las librerías, JavaScript y CSS en un HTML autónomo.
// No usa CDN: el archivo final también funciona sin conexión y con doble clic.
import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const result = await build({entryPoints:['src/main.js'], bundle:true, write:false, minify:true, format:'iife', target:['es2020'], legalComments:'inline'});
const template = await readFile('src/index.html','utf8');
const css = await readFile('src/styles.css','utf8');
const js = result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const html = template.replace('<link rel="stylesheet" href="./styles.css" />',()=>`<style>${css}</style>`).replace('<script type="module" src="./main.js"></script>',()=>`<script>${js}</script>`);
await writeFile('index.html',html);
await mkdir('dist', { recursive: true });
await writeFile('dist/index.html',html);
await mkdir('public', { recursive: true });
await writeFile('public/index.html',html);
console.log(`index.html listo: ${(Buffer.byteLength(html)/1024).toFixed(0)} KB (generado en raíz, dist/ y public/).`);

