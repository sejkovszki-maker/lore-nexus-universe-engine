import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { LlmProvider } from '../../src/core/llm.ts';
import type { Alias, Entity } from '../../src/domain/knowledge.ts';
import { AiEntityResolutionService } from '../../src/knowledge/ai-entity-resolution.ts';
import { EntityRegistry, normalizeAlias } from '../../src/knowledge/entity-registry.ts';
import { EntityMutationEngine } from '../../src/knowledge/entity-mutation.ts';
import { evaluateEntityResolution } from '../../src/knowledge/entity-resolution-evaluation.ts';
import { EntityResolutionEngine, nameSimilarity } from '../../src/knowledge/entity-resolution.ts';

const universeId = 'uni_28d4f26505646895777a86ad5de9e2ac' as never;
const makeEntity = (suffix: string, name: string, typeId = 'character'): Entity => ({ id: (`ent_${suffix.repeat(40).slice(0, 40)}`) as never, universeId, typeId, status: 'active', canonicalNames: { en: name }, description: { en: `${name} archangel lore` }, properties: {}, createdAtUtc: '2026-01-01T00:00:00Z', updatedAtUtc: '2026-01-01T00:00:00Z' });
const tyrael = makeEntity('a', 'Tyrael'); const imperius = makeEntity('b', 'Imperius');
const alias = (id: string, entity: Entity, value: string): Alias => ({ id, universeId, entityId: entity.id, locale: 'en', value, normalizedValue: normalizeAlias(value), kind: 'title', validFrom: null, validTo: null, evidenceIds: ['ev-1'] });

test('resolution finds existing entity through exact alias and rejects universe leakage', () => {
  const engine = new EntityResolutionEngine(); const result = engine.resolve({ universeId, text: 'Archangel of Justice', locale: 'en', expectedTypeId: 'character', contextTerms: ['archangel'] }, [tyrael, imperius], [alias('alias-1', tyrael, 'Archangel of Justice')]);
  assert.equal(result.existingEntityId, tyrael.id); assert.equal(result.candidates[0].decision, 'exact'); assert.equal(engine.resolve({ universeId: 'other', text: 'Tyrael' }, [tyrael], []).candidates.length, 0);
});
test('duplicate detection uses fuzzy normalized names but respects type and universe', () => {
  const typo = makeEntity('c', 'Tyreal'); const location = makeEntity('d', 'Tyrael', 'location'); const duplicates = new EntityResolutionEngine().duplicates([tyrael, typo, location], [], 0.8);
  assert.deepEqual(duplicates.map((item) => [item.leftEntityId, item.rightEntityId]), [[tyrael.id, typo.id]]); assert.ok(nameSimilarity('Tyrael', 'Tyreal') >= 0.8);
});
test('merge preserves source entity, creates redirect and identity history', () => {
  const registry = new EntityRegistry(); registry.addEntity(tyrael); const duplicate = makeEntity('c', 'Tyreal'); registry.addEntity(duplicate); const mutation = new EntityMutationEngine(registry);
  mutation.merge(tyrael.id, [duplicate.id], 'same canonical character', ['ev-merge'], '2026-02-01T00:00:00Z'); assert.equal(registry.getEntity(duplicate.id)?.status, 'merged'); assert.equal(mutation.canonicalId(duplicate.id), tyrael.id); assert.equal(registry.history(duplicate.id)[0].type, 'merged');
});
test('split keeps original as split and creates two resulting identities', () => {
  const registry = new EntityRegistry(); const composite = makeEntity('e', 'The Wanderers'); registry.addEntity(composite); const left = makeEntity('f', 'Wanderer One'); const right = makeEntity('1', 'Wanderer Two'); const mutation = new EntityMutationEngine(registry);
  const event = mutation.split(composite.id, [left, right], 'two identities proven', ['ev-split'], '2026-02-01T00:00:00Z'); assert.equal(registry.getEntity(composite.id)?.status, 'split'); assert.deepEqual(event.resultingEntityIds, [left.id, right.id]);
});
test('AI entity resolution is staged and cannot invent candidate IDs', async () => {
  const provider: LlmProvider = { providerId: 'fake', capabilities: new Set(['structured-output']), async healthCheck() { return true; }, async generate() { return { provider: 'fake', model: 'fake-v1', content: '', structuredOutput: { action: 'link', entityId: tyrael.id, confidence: 0.91, rationale: 'exact title' }, requestId: 'req-1' }; } };
  const proposal = await new AiEntityResolutionService(provider).propose({ universeId, text: 'Tyrael' }, [{ entityId: tyrael.id, score: 0.9, decision: 'exact', signals: { exactAlias: 1, nameSimilarity: 1, typeMatch: 1, localeMatch: 1, contextOverlap: 1 } }]); assert.equal(proposal.status, 'staged'); assert.equal(proposal.proposedEntityId, tyrael.id); assert.equal(proposal.modelVersion, 'fake-v1');
  const hostile = { ...provider, async generate() { return { provider: 'fake', model: 'fake-v1', content: '', structuredOutput: { action: 'link', entityId: 'invented', confidence: 1, rationale: 'bad' } }; } }; await assert.rejects(() => new AiEntityResolutionService(hostile).propose({ universeId, text: 'x' }, []), /unknown candidate/);
});
test('evaluation reports precision, recall, F1, top-1 and false merge rate', () => {
  const engine = new EntityResolutionEngine(); const report = evaluateEntityResolution(engine, [{ id: 'positive', mention: { universeId, text: 'Tyrael', locale: 'en', expectedTypeId: 'character' }, expectedEntityId: tyrael.id }, { id: 'negative', mention: { universeId, text: 'Never Existing Person', locale: 'en' }, expectedEntityId: null }], [tyrael, imperius], []);
  assert.deepEqual({ precision: report.precision, recall: report.recall, f1: report.f1, falseMergeRate: report.falseMergeRate }, { precision: 1, recall: 1, f1: 1, falseMergeRate: 0 }); assert.equal(report.top1Accuracy, 1);
});
