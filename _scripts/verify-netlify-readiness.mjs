import assert from 'node:assert/strict'; import { readFile, stat } from 'node:fs/promises';
const config = await readFile('netlify.toml', 'utf8');
for (const required of ['command = "npm run build"', 'publish = "dist"', 'to = "/index.html"', 'Content-Security-Policy', 'Cache-Control']) assert.ok(config.includes(required), `Missing Netlify configuration: ${required}`);
for (const file of ['dist/index.html', 'dist/sw.js', 'dist/manifest.webmanifest']) assert.ok((await stat(file)).isFile(), `Missing deploy artifact: ${file}`);
const html = await readFile('dist/index.html', 'utf8'); assert.ok(html.includes('<diablo-app>')); assert.ok(!html.includes('/src/main.ts'), 'Production HTML still points to source entry');
console.log(JSON.stringify({ status: 'ready', publishDirectory: 'dist', spaFallback: true, pwa: true, securityHeaders: true }));
