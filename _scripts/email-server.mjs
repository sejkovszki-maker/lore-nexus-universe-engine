import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = dirname(fileURLToPath(import.meta.url));
const host = '127.0.0.1';
const port = 18765;
const mime = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'], ['.json', 'application/json; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json'], ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg'], ['.svg', 'image/svg+xml'],
  ['.ico', 'image/x-icon'], ['.wasm', 'application/wasm'],
]);

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', `http://${host}`).pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    let file = normalize(join(root, relative));
    if (!file.startsWith(root)) throw new Error('Tiltott elérési út.');
    try {
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    } catch {
      file = join(root, 'index.html');
    }
    const body = await readFile(file);
    response.writeHead(200, {
      'Content-Type': mime.get(extname(file).toLowerCase()) ?? 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(body);
  } catch (error) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('A fájl nem található.');
  }
});

const openApplication = () => {
  const url = `http://${host}:${port}/#/wiki`;
  const command = process.platform === 'win32' ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  spawn(command, args, { detached: true, stdio: 'ignore', windowsHide: true }).unref();
};

server.on('error', (error) => {
  if (error && typeof error === 'object' && 'code' in error && error.code === 'EADDRINUSE') {
    console.log('A Lore Nexus már fut; a meglévő helyi példány megnyitása.');
    openApplication();
    process.exit(0);
  }
  console.error('A helyi kiszolgáló nem indítható.', error);
  process.exit(1);
});

server.listen(port, host, () => {
  const url = `http://${host}:${port}/#/wiki`;
  console.log(`Lore Nexus elindult: ${url}`);
  console.log('A bezáráshoz nyomd meg a Ctrl+C billentyűket.');
  openApplication();
});

process.on('SIGINT', () => server.close(() => process.exit(0)));
