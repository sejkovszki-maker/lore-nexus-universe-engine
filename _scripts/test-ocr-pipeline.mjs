import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { existsSync } from 'node:fs';
const bundledPython = 'C:\\Users\\Lezli\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe';
const python = process.env.PDF_PYTHON_PATH || (existsSync(bundledPython) ? bundledPython : 'python');
const dependencies = path.resolve('.python-deps'); const temporary = await mkdtemp(path.join(os.tmpdir(), 'universe-ocr-')); const prefix = path.join(temporary, 'page');
function run(command, args, options = {}) { return new Promise((resolve, reject) => execFile(command, args, { windowsHide: true, timeout: 120_000, maxBuffer: 20 * 1024 * 1024, ...options }, (error, stdout, stderr) => error ? reject(new Error(stderr || error.message)) : resolve(stdout))); }
try {
  await run('pdftoppm', ['-f', '1', '-singlefile', '-png', '-r', '150', 'raw_books/document_compress.pdf', prefix]);
  const result = JSON.parse(await run(python, ['-I', '_scripts/ocr_image.py', `${prefix}.png`, '--dependencies', dependencies]));
  assert.equal(result.processorId, 'rapidocr-onnxruntime'); assert.ok(result.lineCount > 5); assert.match(result.text, /DIABLO/i); assert.ok(result.confidence > 0.5);
  console.log(`OCR PIPELINE PASSED: ${result.lineCount} lines, confidence ${result.confidence.toFixed(3)}`);
} finally { await rm(temporary, { recursive: true, force: true }); }
