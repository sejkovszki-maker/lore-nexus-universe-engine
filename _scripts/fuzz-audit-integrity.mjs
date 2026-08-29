import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cli = path.join(path.dirname(fileURLToPath(import.meta.url)), 'audit-log.mjs');
const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'audit-fuzz-'));
const validLog = path.join(temporaryRoot, 'valid.jsonl');
const mutatedLog = path.join(temporaryRoot, 'mutated.jsonl');

try {
  execFileSync(process.execPath, [cli, 'record', 'fuzz.seed', 'fixture', '{"safe":true}', validLog]);
  const original = await readFile(validLog);
  let rejected = 0;
  for (let index = 0; index < 128; index += 1) {
    const mutation = Buffer.from(original);
    const position = (index * 7919) % mutation.length;
    mutation[position] = mutation[position] ^ ((index % 254) + 1);
    await writeFile(mutatedLog, mutation);
    try { execFileSync(process.execPath, [cli, 'verify', mutatedLog], { stdio: 'pipe' }); }
    catch { rejected += 1; }
  }
  assert.equal(rejected, 128, 'Every mutated audit log must be rejected.');
  console.log('AUDIT FUZZ TEST PASSED: 128/128 mutations rejected');
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
