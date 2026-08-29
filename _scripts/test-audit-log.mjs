import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const cli = path.join(scriptDirectory, 'audit-log.mjs');
const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'audit-log-test-'));
const logPath = path.join(temporaryRoot, 'events.jsonl');

try {
  execFileSync(process.execPath, [cli, 'record', 'source.imported', 'sample', '{"count":1}', logPath]);
  execFileSync(process.execPath, [cli, 'record', 'backup.verified', 'sample.zip', '{}', logPath]);
  execFileSync(process.execPath, [cli, 'verify', logPath]);
  const lines = (await readFile(logPath, 'utf8')).trim().split(/\r?\n/);
  assert.equal(lines.length, 2);
  const first = JSON.parse(lines[0]);
  first.details.count = 999;
  lines[0] = JSON.stringify(first);
  await writeFile(logPath, `${lines.join('\n')}\n`, 'utf8');
  assert.throws(() => execFileSync(process.execPath, [cli, 'verify', logPath], { stdio: 'pipe' }));
  console.log('TAMPER-EVIDENT AUDIT TEST PASSED');
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
