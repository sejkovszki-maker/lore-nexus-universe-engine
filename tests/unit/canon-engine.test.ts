import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CanonEngine, SourceAuthorityModel } from '../../src/knowledge/canon-engine.ts';
import { ConflictEngine, ConflictReviewQueue } from '../../src/knowledge/conflict-engine.ts';
import { calculateKnowledgeQuality } from '../../src/knowledge/quality-score.ts';
import type { Claim } from '../../src/domain/knowledge.ts';

const universeId = 'uni_28d4f26505646895777a86ad5de9e2ac' as never; const subject = ('ent_' + 'a'.repeat(40)) as never;
function claim(id: string, value: string, polarity: Claim['polarity'] = 'affirmative', confidence = 0.9): Claim { return { id, universeId, subjectEntityId: subject, predicate: 'hasOrigin', object: { kind: 'literal', value, dataType: 'string' }, polarity, modality: 'asserted', validFrom: null, validTo: null, uncertainty: { confidence, lowerBound: Math.max(0, confidence - 0.1), upperBound: Math.min(1, confidence + 0.1), basis: 'explicit-source', reasons: [] }, evidenceIds: [`ev-${id}`], status: 'accepted', createdAtUtc: '2026-01-01T00:00:00Z' }; }

test('source authority selects highest-priority applicable rule', () => {
  const model = new SourceAuthorityModel(); model.add({ id: 'community', universeId, branchId: 'main', priority: 1, sourceKinds: ['wiki'], authorityTier: 'community', baseScore: 0.3, validFrom: null, validTo: null, notes: '' }); model.add({ id: 'game', universeId, branchId: 'main', priority: 10, sourceKinds: ['game'], authorityTier: 'primary', baseScore: 1, validFrom: null, validTo: null, notes: '' });
  assert.deepEqual(model.score(universeId, 'main', 'game'), { score: 1, tier: 'primary', ruleId: 'game' }); assert.equal(model.score(universeId, 'main', 'unknown').score, 0);
});
test('canon branches inherit assignments and child overrides remain isolated', () => {
  const engine = new CanonEngine(); engine.addBranch({ id: 'main', universeId, name: 'Main', parentBranchId: null, divergenceReason: null, createdAtUtc: '2026-01-01T00:00:00Z', status: 'active' }); engine.addBranch({ id: 'alternate', universeId, name: 'Alternate', parentBranchId: 'main', divergenceReason: 'adaptation', createdAtUtc: '2026-01-02T00:00:00Z', status: 'active' });
  engine.addClaim(claim('old', 'Heaven')); engine.addClaim(claim('new', 'Sanctuary')); engine.assign({ claimId: 'old', branchId: 'main', status: 'canonical', authorityScore: 0.8, decidedBy: 'editor', decidedAtUtc: '2026-01-01T00:00:00Z', reason: 'source' });
  assert.equal(engine.effectiveAssignments('alternate')[0].claimId, 'old'); engine.assign({ claimId: 'old', branchId: 'alternate', status: 'non-canonical', authorityScore: 0.8, decidedBy: 'editor', decidedAtUtc: '2026-01-02T00:00:00Z', reason: 'branch divergence' });
  assert.equal(engine.effectiveAssignments('alternate')[0].status, 'non-canonical'); assert.equal(engine.effectiveAssignments('main')[0].status, 'canonical');
});
test('retcon deprecates old canon and installs replacement', () => {
  const engine = new CanonEngine(); engine.addBranch({ id: 'main', universeId, name: 'Main', parentBranchId: null, divergenceReason: null, createdAtUtc: '2026-01-01T00:00:00Z', status: 'active' }); engine.addClaim(claim('old', 'Heaven')); engine.addClaim(claim('new', 'Sanctuary')); engine.assign({ claimId: 'old', branchId: 'main', status: 'canonical', authorityScore: 0.8, decidedBy: 'editor', decidedAtUtc: '2026-01-01T00:00:00Z', reason: 'old canon' });
  engine.applyRetcon({ id: 'retcon-1', universeId, branchId: 'main', supersededClaimIds: ['old'], replacementClaimIds: ['new'], effectiveAtUtc: '2026-02-01T00:00:00Z', reason: 'new primary source', evidenceIds: ['ev-new'], decidedBy: 'editor-2' });
  const assignments = new Map(engine.effectiveAssignments('main').map((item) => [item.claimId, item])); assert.equal(assignments.get('old')?.status, 'deprecated'); assert.equal(assignments.get('new')?.status, 'canonical');
});
test('conflict taxonomy detects object, polarity, authority and uncertainty contradictions', () => {
  const conflicts = new ConflictEngine().detect([{ claim: claim('left', 'Heaven', 'affirmative', 0.95), branchId: 'main', authorityScore: 1 }, { claim: claim('right', 'Sanctuary', 'negative', 0.4), branchId: 'alternate', authorityScore: 0.2 }], '2026-01-01T00:00:00Z');
  assert.equal(conflicts.length, 1); assert.deepEqual(conflicts[0].types, ['direct-object', 'polarity', 'canon-branch', 'source-authority', 'uncertainty']); assert.equal(conflicts[0].severity, 'critical');
});
test('conflict review queue requires a single terminal resolution', () => {
  const conflict = new ConflictEngine().detect([{ claim: claim('left', 'A'), branchId: 'main', authorityScore: 1 }, { claim: claim('right', 'B'), branchId: 'main', authorityScore: 1 }], '2026-01-01T00:00:00Z')[0]; const queue = new ConflictReviewQueue(); let notified = 0; queue.subscribe(() => notified += 1); queue.add(conflict);
  queue.resolve(conflict.id, { action: 'prefer-left', reviewer: 'editor', reason: 'primary evidence', resolvedAtUtc: '2026-01-02T00:00:00Z' }); assert.equal(queue.list('resolved').length, 1); assert.equal(notified, 2); assert.throws(() => queue.resolve(conflict.id, { action: 'dismiss', reviewer: 'x', reason: 'x', resolvedAtUtc: '2026-01-03T00:00:00Z' }), /already closed/);
});
test('knowledge quality score exposes penalties and production blockers', () => {
  const perfect = calculateKnowledgeQuality({ evidenceCoverage: 1, averageEvidenceReliability: 1, citationCompleteness: 1, authorityScore: 1, claimConfidence: 1, humanReviewed: true, openConflictSeverity: [] }); assert.deepEqual({ score: perfect.score, grade: perfect.grade, blockers: perfect.blockers }, { score: 100, grade: 'A', blockers: [] });
  const risky = calculateKnowledgeQuality({ evidenceCoverage: 0.5, averageEvidenceReliability: 0.7, citationCompleteness: 0.5, authorityScore: 0.4, claimConfidence: 0.6, humanReviewed: false, openConflictSeverity: ['critical'] }); assert.equal(risky.grade, 'F'); assert.ok(risky.blockers.includes('CRITICAL_CONFLICT'));
});
