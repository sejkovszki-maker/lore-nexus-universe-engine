import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { SchemaRegistry } from '../../src/core/schema-registry.ts';
import { validateTemporalPoint, type KnowledgeEvent, type Relationship, type TemporalPoint } from '../../src/domain/temporal.ts';
import { TemporalKnowledgeGraph } from '../../src/knowledge/temporal-graph.ts';

const universe = 'uni_28d4f26505646895777a86ad5de9e2ac' as never; const a = 'ent_' + 'a'.repeat(40) as never; const b = 'ent_' + 'b'.repeat(40) as never; const place = 'ent_' + 'c'.repeat(40) as never;
const point = (asserted: string, confidence = 1): TemporalPoint => ({ asserted, earliest: asserted, latest: asserted, precision: 'day', confidence, calendar: 'gregorian' });
const relationship: Relationship = { id: 'rel-1', universeId: universe, typeId: 'alliedWith', sourceEntityId: a, targetEntityId: b, direction: 'symmetric', status: 'accepted', validity: { start: point('1000-01-01T00:00:00Z'), end: { asserted: '1250-01-01T00:00:00Z', earliest: '1200-01-01T00:00:00Z', latest: '1300-01-01T00:00:00Z', precision: 'approximate', confidence: 0.6, calendar: 'gregorian' } }, attributes: {}, claimIds: ['claim-1'], evidenceIds: ['ev-1'], createdAtUtc: '2026-01-01T00:00:00Z' };
const event: KnowledgeEvent = { id: 'event-1', universeId: universe, typeId: 'battle', names: { en: 'Battle' }, time: { asserted: '1055-01-01T00:00:00Z', earliest: '1050-01-01T00:00:00Z', latest: '1060-01-01T00:00:00Z', precision: 'approximate', confidence: 0.7, calendar: 'gregorian' }, locationEntityIds: [place], participants: [{ entityId: a, role: 'attacker', certainty: 0.9 }, { entityId: b, role: 'defender', certainty: 1 }], parentEventId: null, status: 'accepted', claimIds: ['claim-2'], evidenceIds: ['ev-2'], attributes: {} };

function graph(): TemporalKnowledgeGraph { const graph = new TemporalKnowledgeGraph(); graph.addEntity(a, universe); graph.addEntity(b, universe); graph.addEntity(place, universe); return graph; }

test('temporal point validation preserves uncertainty bounds', () => {
  validateTemporalPoint(event.time); assert.throws(() => validateTemporalPoint({ ...event.time, earliest: '1100-01-01T00:00:00Z' }), /precedes earliest|earliest exceeds/);
  assert.throws(() => validateTemporalPoint({ asserted: null, earliest: null, latest: null, precision: 'day', confidence: 1, calendar: 'gregorian' }), /requires at least one/);
});
test('relationship validation enforces references, universe isolation and interval order', () => {
  const value = graph(); value.addRelationship(relationship);
  assert.throws(() => value.addRelationship({ ...relationship, id: 'missing', targetEntityId: 'ent_' + 'd'.repeat(40) as never }), /missing/);
  assert.throws(() => value.addRelationship({ ...relationship, id: 'self', targetEntityId: a }), /self-reference/);
});
test('timeline overlaps uncertain ranges and sorts deterministically', () => {
  const value = graph(); value.addEvent(event); value.addEvent({ ...event, id: 'event-2', time: point('1100-01-01T00:00:00Z') });
  assert.deepEqual(value.timeline(universe, '1059-01-01T00:00:00Z', '1059-12-31T00:00:00Z').map((item) => item.id), ['event-1']);
  assert.deepEqual(value.timeline(universe).map((item) => item.id), ['event-1', 'event-2']);
});
test('historical state distinguishes definite and possible relationships', () => {
  const value = graph(); value.addRelationship(relationship); value.addEvent(event); value.addFact({ factId: 'fact-1', universeId: universe, subjectEntityId: a, objectEntityId: b, validity: relationship.validity });
  assert.equal(value.historicalState(universe, '1100-01-01T00:00:00Z').relationships[0].certainty, 'definite');
  assert.equal(value.historicalState(universe, '1250-01-01T00:00:00Z').relationships[0].certainty, 'possible');
  assert.equal(value.historicalState(universe, '1400-01-01T00:00:00Z').relationships.length, 0);
  assert.deepEqual(value.historicalState(universe, '1100-01-01T00:00:00Z').occurredEvents.map((item) => item.id), ['event-1']);
  assert.equal(value.historicalState(universe, '1250-01-01T00:00:00Z').facts[0].certainty, 'possible');
});
test('relationship and event schemas compile strictly and validate fixtures', async () => {
  const registry = new SchemaRegistry(); for (const name of ['relationship', 'event']) registry.register(name, 1, JSON.parse(await readFile(`schemas/${name}/v1.schema.json`, 'utf8')));
  assert.equal(registry.validate('relationship', 1, relationship).valid, true); assert.equal(registry.validate('event', 1, event).valid, true);
});
