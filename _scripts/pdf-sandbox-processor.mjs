import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), 'pdf_extract.py');
const bundledPython = 'C:\\Users\\Lezli\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe';
const defaultPython = existsSync(bundledPython) ? bundledPython : 'python';

export async function processPdfInSandbox(bytes, { maxPages = 0, timeoutMs = 120_000, pythonPath = process.env.PDF_PYTHON_PATH || defaultPython } = {}) {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'universe-pdf-')); const pdfPath = path.join(temporary, 'source.pdf');
  try {
    await writeFile(pdfPath, bytes, { flag: 'wx' });
    return await new Promise((resolve, reject) => {
      execFile(pythonPath, ['-I', script, pdfPath, '--max-pages', String(maxPages)], { timeout: timeoutMs, maxBuffer: 100 * 1024 * 1024, windowsHide: true, env: {} }, (error, stdout, stderr) => {
        if (error) reject(new Error(`PDF sandbox failed: ${stderr || error.message}`));
        else { try { resolve(JSON.parse(stdout)); } catch (parseError) { reject(parseError); } }
      });
    });
  } finally { await rm(temporary, { recursive: true, force: true }); }
}
