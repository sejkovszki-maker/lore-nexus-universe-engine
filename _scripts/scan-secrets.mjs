import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(process.argv[2] ?? '.');
const excluded = new Set(['node_modules', '.git', 'dist', 'backups', 'raw-source-store', 'raw_books', 'artifacts']);
const textExtensions = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.json', '.md', '.yml', '.yaml', '.html', '.css', '.ps1', '.toml']);
const patterns = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ['openai-key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g],
  ['aws-access-key', /\bAKIA[0-9A-Z]{16}\b/g],
  ['github-token', /\bgh[pousr]_[A-Za-z0-9]{30,}\b/g],
  ['generic-secret-assignment', /\b(?:api[_-]?key|client[_-]?secret|password)\s*[:=]\s*["'][^"'\s]{12,}["']/gi],
];

async function files(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await files(fullPath));
    else if (entry.isFile() && textExtensions.has(path.extname(entry.name).toLowerCase())) result.push(fullPath);
  }
  return result;
}

const findings = [];
for (const file of await files(root)) {
  const content = await readFile(file, 'utf8');
  for (const [kind, regex] of patterns) {
    regex.lastIndex = 0;
    for (const match of content.matchAll(regex)) {
      const line = content.slice(0, match.index).split(/\r?\n/).length;
      findings.push({ kind, file: path.relative(root, file).split(path.sep).join('/'), line });
    }
  }
}
if (findings.length) {
  console.error(JSON.stringify({ status: 'failed', findings }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ status: 'passed', scannedRoot: root }));
