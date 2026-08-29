import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { SchemaRegistry } from '../../src/core/schema-registry.ts';
import { CitationEngine } from '../../src/knowledge/citation-engine.ts';
import { EntityRegistry, normalizeAlias } from '../../src/knowledge/entity-registry.ts';
import { EvidenceStore, evidenceQuoteHash } from '../../src/knowledge/evidence-store.ts';
import { FactEngine, validateUncertainty } from '../../src/knowledge/fact-engine.ts';
import { MultilingualKnowledge } from '../../src/knowledge/multilingual.ts';
import { ProvenanceStore } from '../../src/knowledge/provenance.ts';
import type { Alias, Claim, Entity, Evidence } from '../../src/domain/knowledge.ts';

const universeId = 'uni_28d4f26505646895777a86ad5de9e2ac' as never;
const entityId = 'ent_1111111111111111111111111111111111111111' as never;
const entity: Entity = { id: entityId, universeId, typeId: 'character', status: 'active', canonicalNames: { en: 'Tyrael', hu: 'Tyrael' }, description: {}, properties: {}, createdAtUtc: '2026-01-01T00:00:00Z', updatedAtUtc: '2026-01-01T00:00:00Z' };

test('entity aliases resolve within universe and identity history stays queryable', () => {
  const registry = new EntityRegistry(); registry.addEntity(entity);
  const alias: Alias = { id: 'alias-1', universeId, entityId, locale: 'en', value: 'The Archangel of Justice', normalizedValue: normalizeAlias('The Archangel of Justice'), kind: 'title', validFrom: null, validTo: null, evidenceIds: ['ev-1'] };
  registry.addAlias(alias); assert.deepEqual(registry.resolve(universeId, 'the archangel of justice', 'en').map((item) => item.id), [entityId]); assert.deepEqual(registry.resolve('other', alias.value), []);
  registry.recordIdentityEvent({ id: 'identity-1', universeId, entityId, type: 'renamed', timestampUtc: '2026-01-02T00:00:00Z', previousEntityIds: [entityId], resultingEntityIds: [entityId], reason: 'canonical localization', evidenceIds: ['ev-1'] });
  assert.equal(registry.history(entityId).length, 1);
});

test('multilingual knowledge uses requested locale and explicit fallback', () => {
  const knowledge = new MultilingualKnowledge(); knowledge.add({ id: 'tr-1', universeId, conceptId: 'justice', locale: 'hu', text: 'igazság', status: 'reviewed', sourceLocale: 'en', sourceText: 'justice', evidenceIds: ['ev-1'] });
  assert.equal(knowledge.translate(universeId, 'justice', 'de', ['hu'])?.text, 'igazság'); assert.equal(knowledge.entityLabel(entity, 'de', ['hu']), 'Tyrael');
});

function evidenceFixture(): Evidence {
  const quote = 'Tyrael is the Archangel of Justice.';
  return { id: 'ev-1', universeId, sourceId: 'src_sha256_' + 'a'.repeat(64) as never, documentId: 'doc-1', chunkId: 'chunk-1', locator: { page: 42, startOffset: 10, endOffset: 46 }, quote, quoteSha256: evidenceQuoteHash(quote), stance: 'supports', strength: 'direct', reliability: 0.95, createdAtUtc: '2026-01-01T00:00:00Z' };
}
function claimFixture(id = 'claim-1'): Claim {
  return { id, universeId, subjectEntityId: entityId, predicate: 'hasTitle', object: { kind: 'literal', value: 'Archangel of Justice', dataType: 'string' }, polarity: 'affirmative', modality: 'asserted', validFrom: null, validTo: null, uncertainty: { confidence: 0.9, lowerBound: 0.8, upperBound: 0.95, basis: 'explicit-source', reasons: [] }, evidenceIds: ['ev-1'], status: 'validated', createdAtUtc: '2026-01-01T00:00:00Z' };
}

test('Fact Engine only materializes accepted evidence-backed claims', () => {
  const evidence = new EvidenceStore(); evidence.add(evidenceFixture()); const engine = new FactEngine(evidence); const claim = claimFixture(); engine.stage(claim);
  assert.throws(() => engine.materializeFact(claim.id, 'editor-1', '2026-01-02T00:00:00Z'), /accepted/); engine.accept(claim.id);
  const fact = engine.materializeFact(claim.id, 'editor-1', '2026-01-02T00:00:00Z'); assert.equal(fact.confidence, 0.9); assert.deepEqual(fact.evidenceIds, ['ev-1']);
});

test('negative knowledge and uncertainty invariants reject ambiguous invalid state', () => {
  const invalid = { ...claimFixture('negative'), polarity: 'negative' as const, modality: 'unknown' as const }; assert.throws(() => validateUncertainty(invalid), /negative knowledge/);
  assert.throws(() => validateUncertainty({ ...claimFixture('interval'), uncertainty: { confidence: 0.5, lowerBound: 0.6, upperBound: 0.8, basis: 'editorial', reasons: [] } }), /interval/);
});

test('inference traces require existing premises and conclusion', () => {
  const evidence = new EvidenceStore(); evidence.add(evidenceFixture()); const engine = new FactEngine(evidence); engine.stage(claimFixture('premise')); engine.stage(claimFixture('conclusion'));
  engine.addInference({ id: 'inf-1', universeId, premiseClaimIds: ['premise'], ruleId: 'title-implies-role', ruleVersion: '1', conclusionClaimId: 'conclusion', confidenceMethod: 'minimum', createdAtUtc: '2026-01-01T00:00:00Z', status: 'validated' });
  assert.throws(() => engine.addInference({ id: 'bad', universeId, premiseClaimIds: ['missing'], ruleId: 'x', ruleVersion: '1', conclusionClaimId: 'conclusion', confidenceMethod: 'minimum', createdAtUtc: '2026-01-01T00:00:00Z', status: 'proposed' }), /unknown claim/);
});

test('citation and provenance retain exact evidence and processing identity', () => {
  const evidence = new EvidenceStore(); evidence.add(evidenceFixture()); const citation = new CitationEngine(evidence).cite('ev-1'); assert.equal(citation.locatorText, 'p. 42, offset 10-46'); assert.equal(citation.quoteSha256, evidenceFixture().quoteSha256);
  const provenance = new ProvenanceStore(); provenance.add({ id: 'prov-1', universeId, operation: 'claim.validate', actorType: 'human', actorId: 'editor-1', inputIds: ['claim-1'], outputIds: ['fact_claim-1'], softwareVersion: '1.0.0', modelVersion: null, promptVersion: null, parametersSha256: 'a'.repeat(64), startedAtUtc: '2026-01-01T00:00:00Z', completedAtUtc: '2026-01-01T00:00:01Z', status: 'succeeded' });
  assert.equal(provenance.forOutput('fact_claim-1')[0].actorId, 'editor-1');
});

test('Knowledge Core JSON schemas compile in strict mode and validate representative objects', async () => {
  const registry = new SchemaRegistry();
  for (const name of ['entity', 'claim', 'evidence', 'fact']) registry.register(name, 1, JSON.parse(await readFile(`schemas/${name}/v1.schema.json`, 'utf8')));
  assert.equal(registry.validate('entity', 1, entity).valid, true);
  assert.equal(registry.validate('claim', 1, claimFixture()).valid, true);
  assert.equal(registry.validate('evidence', 1, evidenceFixture()).valid, true);
});
