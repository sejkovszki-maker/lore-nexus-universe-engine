import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const artifact = JSON.parse(await readFile('artifacts/migration/diablo-legacy-dry-run-v1.json', 'utf8'));
const baseline = JSON.parse(await readFile('tests/regression/wiki-baseline.json', 'utf8'));
const { report, records } = artifact;
assert.equal(report.input.articles, baseline.articleCount, 'Every legacy article must be staged');
assert.equal(report.input.timelineItems, baseline.timelineCount, 'Every legacy timeline item must be staged');
assert.equal(report.staged, records.length, 'Report/staging count mismatch');
assert.equal(new Set(records.map((record) => record.migrationId)).size, records.length, 'Migration record IDs must be unique');
assert.equal(records.filter((record) => record.kind === 'article').length, baseline.articleCount);
assert.equal(records.filter((record) => record.kind === 'timeline').length, baseline.timelineCount);
assert.equal(records.filter((record) => record.kind === 'book').length, 6);
assert.ok(records.every((record) => record.status === 'staged'), 'Dry-run must never write committed records');
assert.ok(records.every((record) => /^[a-f0-9]{64}$/.test(record.sourceFingerprint)), 'Every source record needs a SHA-256 fingerprint');
assert.deepEqual(report.integrityErrors, []);
console.log(JSON.stringify({ command: 'verify-legacy-migration', articles: baseline.articleCount, timelineItems: baseline.timelineCount, books: 6, records: records.length, duplicates: report.duplicates.length }));
