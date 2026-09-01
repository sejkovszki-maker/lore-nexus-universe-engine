import assert from 'node:assert/strict';
import test from 'node:test';
import { KnowledgeIngestionEngine, KnowledgePublishingEngine, KnowledgeSyncEngine } from '../../src/sync/knowledge-sync.ts';

test('document records preserve original and translated segments with provenance', async () => {
  const original=`Publisher notes and original introduction. ${'Metadata. '.repeat(8)}\n\nChapter 1\n${'Original English evidence. '.repeat(8)}`;
  const translated=`Kiadói jegyzetek és eredeti bevezető. ${'Metaadat. '.repeat(8)}\n\n1. fejezet\n${'Eredeti angol bizonyíték fordítása. '.repeat(8)}`;
  const record=await KnowledgeIngestionEngine.createRecord({universeId:'diablo',fileName:'book.txt',mediaType:'text/plain',fileSize:original.length,title:'Test Book',originalText:original,translatedText:translated,language:'en',translation:{sourceLanguage:'en',targetLanguage:'hu',method:'Local Translator',translatedAtUtc:'2026-09-01T00:00:00.000Z',confidence:.9}});
  assert.equal(record.visibility,'private');
  assert.equal(record.segments[0].kind,'front-matter');
  assert.match(record.segments[1].originalText,/Original English evidence/);
  assert.match(record.segments[1].translatedText||'',/angol bizonyíték fordítása/);
  assert.equal(record.segments[1].translation?.method,'Local Translator');
});

test('re-import creates a reversible section diff and preserves Work identity', async () => {
  const previous=await KnowledgeIngestionEngine.createRecord({universeId:'diablo',fileName:'book-v1.txt',mediaType:'text/plain',fileSize:100,title:'Test Book',originalText:`Chapter 1\n${'Stable. '.repeat(20)}`});
  const current=await KnowledgeIngestionEngine.createRecord({universeId:'diablo',fileName:'book-v2.txt',mediaType:'text/plain',fileSize:200,title:'Test Book',originalText:`Chapter 1\n${'Changed. '.repeat(20)}\n\nChapter 2\n${'New. '.repeat(30)}`,previous});
  const run=KnowledgeSyncEngine.compare(previous,current,'re-import');
  assert.equal(current.workId,previous.workId);
  assert.deepEqual(run.changeSet.segmentChanges.map(change=>change.kind),['changed','added']);
  assert.equal(run.changeSet.reversible,true);
  assert.equal(run.status,'review-required');
});

test('publishing embeds a fingerprinted snapshot that reverse import can identify', async () => {
  const result=await KnowledgePublishingEngine.markdown({title:'Diablo dossier',universeId:'diablo',profile:'research-dossier',knowledgeSnapshotId:'snapshot-1',sections:[{title:'Történet',content:'Forrásolt szöveg [1].'}],articleIds:['diablo'],sourceIds:['source-1']});
  assert.equal(KnowledgePublishingEngine.detectReverseImport(result.content)?.exportId,result.snapshot.exportId);
  assert.equal(result.snapshot.articleIds[0],'diablo');
  assert.equal(result.snapshot.sha256.length,64);
});
