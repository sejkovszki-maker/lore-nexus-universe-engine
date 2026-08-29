import assert from 'node:assert/strict';
import { chmod, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const cli = path.join(scriptDirectory, 'raw-source-store.mjs');
const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'raw-source-store-test-'));
const source = path.join(temporaryRoot, 'source');
const store = path.join(temporaryRoot, 'store');

try {
  await mkdir(source);
  await writeFile(path.join(source, 'sample.txt'), 'immutable lore\n', 'utf8');

  execFileSync(process.execPath, [cli, 'import', source, store], { stdio: 'pipe' });
  execFileSync(process.execPath, [cli, 'import', source, store], { stdio: 'pipe' });
  execFileSync(process.execPath, [cli, 'verify', store], { stdio: 'pipe' });

  const indexLines = (await readFile(path.join(store, 'index.jsonl'), 'utf8')).trim().split(/\r?\n/);
  assert.equal(indexLines.length, 1, 'Repeated imports must be idempotent');
  const record = JSON.parse(indexLines[0]);
  assert.equal(record.byteLength, 15);
  assert.match(record.sourceId, /^src_sha256_[a-f0-9]{64}$/);
  assert.equal(record.mediaType, 'text/plain');

  await writeFile(path.join(source, 'sample.txt'), 'immutable lore version two\n', 'utf8');
  execFileSync(process.execPath, [cli, 'import', source, store], { stdio: 'pipe' });
  execFileSync(process.execPath, [cli, 'verify', store], { stdio: 'pipe' });
  const versionedLines = (await readFile(path.join(store, 'index.jsonl'), 'utf8')).trim().split(/\r?\n/);
  assert.equal(versionedLines.length, 2);
  const secondRecord = JSON.parse(versionedLines[1]);
  assert.equal(secondRecord.version, 2);
  assert.equal(secondRecord.logicalSourceId, record.logicalSourceId);
  assert.equal(secondRecord.previousVersionSourceId, record.sourceId);

  const objectPath = path.join(store, ...secondRecord.objectPath.split('/'));
  await chmod(objectPath, 0o644);
  await writeFile(objectPath, 'tampered lore\n', 'utf8');
  assert.throws(
    () => execFileSync(process.execPath, [cli, 'verify', store], { stdio: 'pipe' }),
    'Verification must reject modified source objects',
  );

  console.log('RAW SOURCE STORE TEST PASSED');
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
