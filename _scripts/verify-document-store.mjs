import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const sha = (value) => createHash('sha256').update(value).digest('hex'); const store = path.resolve('document-store');
const records = (await readFile(path.join(store, 'index.jsonl'), 'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse); const lineage = (await readFile(path.join(store, 'lineage.jsonl'), 'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse);
const ids = new Set(); let chunks = 0;
for (const record of records) {
  assert.ok(!ids.has(record.id)); ids.add(record.id); const object = path.join(store, ...record.objectPath.split('/')); const text = await readFile(path.join(object, 'text.txt'), 'utf8'); const sections = JSON.parse(await readFile(path.join(object, 'sections.json'), 'utf8')); const documentChunks = JSON.parse(await readFile(path.join(object, 'chunks.json'), 'utf8'));
  assert.equal(text.length, record.textLength); assert.equal(sha(text), record.textSha256); assert.equal(sections.length, record.sectionCount); assert.equal(documentChunks.length, record.chunkCount); assert.ok(documentChunks.every((chunk) => sha(chunk.text) === chunk.fingerprint)); chunks += documentChunks.length;
}
assert.equal(lineage.length, records.length); assert.ok(lineage.every((edge) => ids.has(edge.to.id)));
console.log(JSON.stringify({ command: 'verify-document-store', documents: records.length, lineageEdges: lineage.length, chunks }));
