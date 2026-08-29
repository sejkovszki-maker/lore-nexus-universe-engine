import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chunkText } from '../../src/document/chunking.ts';
import { validateFile } from '../../src/document/file-validation.ts';
import { UniversalDocumentIngestion } from '../../src/document/ingestion.ts';
import { LineageGraph } from '../../src/document/lineage.ts';
import { inspectMultimedia } from '../../src/document/multimedia.ts';
import { OcrFallbackPipeline } from '../../src/document/processing.ts';
import { detectStructure } from '../../src/document/structure.ts';

test('file validation uses signatures, UTF-8 and declared-type warnings', () => {
  const pdf = validateFile({ originalName: 'wrong.txt', declaredMediaType: 'text/plain', bytes: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]) });
  assert.equal(pdf.detectedMediaType, 'application/pdf'); assert.deepEqual(pdf.warnings, ['DECLARED_MEDIA_TYPE_MISMATCH']);
  assert.equal(validateFile({ originalName: 'empty.txt', bytes: new Uint8Array() }).valid, false);
});
test('structure detection and chunking preserve ordered source offsets', () => {
  const text = '# First\n' + 'A sentence. '.repeat(80) + '\n\n# Second\n' + 'B sentence. '.repeat(80); const sections = detectStructure(text); const chunks = chunkText(text, 300, 30);
  assert.deepEqual(sections.map((section) => section.heading), ['First', 'Second']); assert.ok(chunks.length > 2); assert.ok(chunks.every((chunk, index) => chunk.ordinal === index && chunk.endOffset > chunk.startOffset));
});
test('lineage graph traverses complete ancestors', () => {
  const graph = new LineageGraph(); const base = { universeId: 'uni' as never, processorId: 'test', processorVersion: '1', createdAtUtc: '2026-01-01T00:00:00Z', parametersSha256: 'x' };
  graph.add({ ...base, id: 'e1', from: { kind: 'raw-object', id: 'raw' }, to: { kind: 'source', id: 'src' }, operation: 'import' }); graph.add({ ...base, id: 'e2', from: { kind: 'source', id: 'src' }, to: { kind: 'document', id: 'doc' }, operation: 'extract' });
  assert.deepEqual(graph.ancestors('document', 'doc').map((edge) => edge.id), ['e2', 'e1']);
});
test('universal ingestion validates, processes, structures and chunks', async () => {
  const processor = { supports: (media: string) => media === 'text/plain', async process(bytes: Uint8Array) { return { processorId: 'test', processorVersion: '1', pages: [{ pageNumber: 1, text: new TextDecoder().decode(bytes), method: 'native' as const }], metadata: {} }; } };
  const output = await new UniversalDocumentIngestion([processor]).ingest({ originalName: 'book.txt', bytes: new TextEncoder().encode('# Chapter\n' + 'Lore '.repeat(1000)) });
  assert.equal(output.validation.valid, true); assert.ok(output.sections.length >= 1); assert.ok(output.chunks.length >= 1);
});
test('OCR pipeline only invokes OCR for pages without native text', async () => {
  let calls = 0; const pipeline = new OcrFallbackPipeline({ async renderPage() { return new Uint8Array([1]); } }, { id: 'fake', version: '1', async recognize() { calls += 1; return { text: 'recognized', confidence: 0.9 }; } });
  const pages = await pipeline.enrich(new Uint8Array(), [{ pageNumber: 1, text: 'enough native text content here', method: 'native' }, { pageNumber: 2, text: '', method: 'native' }]);
  assert.equal(calls, 1); assert.equal(pages[1].method, 'ocr'); assert.equal(pages[1].text, 'recognized');
});
test('multimedia inspection preserves image and audio technical metadata', () => {
  const png = new Uint8Array(24); png.set([0x89, 0x50, 0x4e, 0x47]); new DataView(png.buffer).setUint32(16, 1920, false); new DataView(png.buffer).setUint32(20, 1080, false);
  assert.deepEqual(inspectMultimedia(png, 'image/png'), { mediaType: 'image/png', width: 1920, height: 1080 });
  const wav = new Uint8Array(44); wav.set(new TextEncoder().encode('RIFF'), 0); wav.set(new TextEncoder().encode('WAVE'), 8); const view = new DataView(wav.buffer); view.setUint16(22, 2, true); view.setUint32(24, 48000, true); view.setUint32(28, 192000, true); view.setUint32(40, 192000, true);
  assert.deepEqual(inspectMultimedia(wav, 'audio/wav'), { mediaType: 'audio/wav', channels: 2, sampleRate: 48000, durationMs: 1000 });
});
