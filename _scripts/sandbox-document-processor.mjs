import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
const worker = path.join(path.dirname(fileURLToPath(import.meta.url)), 'document-sandbox-worker.mjs');
export function processInSandbox(bytes, mediaType, timeoutMs = 10_000) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--permission', worker], { cwd: process.cwd(), env: {}, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
    let stdout = ''; let stderr = ''; let outputBytes = 0; let settled = false;
    const fail = (error) => { if (!settled) { settled = true; reject(error); } };
    const timer = setTimeout(() => { child.kill(); fail(new Error('Sandbox processor timeout')); }, timeoutMs);
    child.stdout.on('data', (chunk) => { outputBytes += chunk.length; if (outputBytes > 50 * 1024 * 1024) { child.kill(); fail(new Error('Sandbox output limit exceeded')); } else stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; }); child.on('error', fail);
    child.on('close', (code) => { clearTimeout(timer); if (settled) return; settled = true; if (code !== 0) reject(new Error(`Sandbox failed (${code}): ${stderr.trim()}`)); else { try { resolve(JSON.parse(stdout)); } catch (error) { reject(error); } } });
    child.stdin.end(JSON.stringify({ mediaType, base64: Buffer.from(bytes).toString('base64') }));
  });
}
