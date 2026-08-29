import { createHash } from 'node:crypto';
import { appendFile, chmod, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chunkText } from '../src/document/chunking.ts';
import { validateFile } from '../src/document/file-validation.ts';
import { detectStructure } from '../src/document/structure.ts';
import { deterministicUniverseId } from '../src/core/deterministic-id.ts';
import { processInSandbox } from './sandbox-document-processor.mjs';
import { processPdfInSandbox } from './pdf-sandbox-processor.mjs';

const root = path.resolve('.'); const store = path.join(root, 'document-store'); const indexPath = path.join(store, 'index.jsonl'); const lineagePath = path.join(store, 'lineage.jsonl');
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex');
const existing = new Set<string>();
try { for (const line of (await readFile(indexPath, 'utf8')).split(/\r?\n/).filter(Boolean)) existing.add(JSON.parse(line).id); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const sources = (await readFile('raw-source-store/index.jsonl', 'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse);
const universeId = await deterministicUniverseId('diablo'); await mkdir(path.join(store, 'objects'), { recursive: true }); await mkdir(path.join(store, 'tmp'), { recursive: true });
let imported = 0; let skipped = 0;

for (const source of sources) {
  const filePath = path.join(root, ...source.sourcePath.split('/')); const bytes = await readFile(filePath);
  const validation = validateFile({ originalName: source.originalName, declaredMediaType: source.mediaType, bytes });
  if (!validation.valid) throw new Error(`${source.originalName}: ${validation.errors.join(',')}`);
  const processorKey = validation.detectedMediaType === 'application/pdf' ? 'pdfplumber@1' : 'sandbox.text@1';
  const id = `doc_sha256_${sha(`${source.sourceId}\u001f${processorKey}`)}`; if (existing.has(id)) { skipped += 1; continue; }
  const processing: any = validation.detectedMediaType === 'application/pdf' ? await processPdfInSandbox(bytes) : await processInSandbox(bytes, validation.detectedMediaType, 30_000);
  const text = processing.pages.map((page: any) => page.text).join('\n\n'); const sections = detectStructure(text).map((section) => ({ ...section, id: `sec_${sha(`${id}\u001f${section.ordinal}`).slice(0, 40)}`, documentId: id, parentSectionId: null }));
  const chunks = chunkText(text).map((chunk) => ({ ...chunk, id: `chk_${sha(`${id}\u001f${chunk.ordinal}\u001f${chunk.text}`).slice(0, 40)}`, documentId: id, sectionId: sections.find((section) => chunk.startOffset >= section.startOffset && chunk.startOffset < section.endOffset)?.id ?? null, fingerprint: sha(chunk.text) }));
  const temporary = path.join(store, 'tmp', id); const target = path.join(store, 'objects', id); await rm(temporary, { recursive: true, force: true }); await mkdir(temporary, { recursive: true });
  await writeFile(path.join(temporary, 'text.txt'), text, 'utf8'); await writeFile(path.join(temporary, 'sections.json'), JSON.stringify(sections, null, 2), 'utf8'); await writeFile(path.join(temporary, 'chunks.json'), JSON.stringify(chunks, null, 2), 'utf8');
  await rename(temporary, target);
  const record = { id, universeId, sourceId: source.sourceId, schemaVersion: 1, title: source.originalName.replace(/\.[^.]+$/, ''), language: null, mediaType: validation.detectedMediaType, processingStatus: 'processed', processorId: processing.processorId, processorVersion: processing.processorVersion, createdAtUtc: new Date().toISOString(), textLength: text.length, pageCount: processing.metadata.pageCount ?? processing.pages.length, sectionCount: sections.length, chunkCount: chunks.length, objectPath: path.relative(store, target).split(path.sep).join('/'), textSha256: sha(text) };
  const lineage = { id: `lin_${sha(`${source.sourceId}\u001f${id}`).slice(0, 40)}`, universeId, from: { kind: 'source', id: source.sourceId }, to: { kind: 'document', id }, operation: 'document.extract', processorId: processing.processorId, processorVersion: processing.processorVersion, createdAtUtc: record.createdAtUtc, parametersSha256: sha(JSON.stringify({ mediaType: validation.detectedMediaType, chunkMaximumCharacters: 4000, chunkOverlapCharacters: 400 })) };
  await appendFile(indexPath, `${JSON.stringify(record)}\n`); await appendFile(lineagePath, `${JSON.stringify(lineage)}\n`);
  for (const file of ['text.txt', 'sections.json', 'chunks.json']) await chmod(path.join(target, file), 0o444);
  existing.add(id); imported += 1;
}
await rm(path.join(store, 'tmp'), { recursive: true, force: true });
console.log(JSON.stringify({ command: 'document-ingest', scanned: sources.length, imported, skipped, store }));
