import test from 'node:test';
import assert from 'node:assert/strict';
import { LegacyCompatibilityLayer, NonDestructiveMigrationStore } from '../../src/migration/legacy-migration.ts';

const articles = { tyrael: { id: 'tyrael', title: 'Tyrael', category: 'Angyalok', content: '<p>Justice</p>' } };
const timeline = [{ id: 'fall', title: 'Tyrael bukása', date: '1285' }];
const books = [{ id: 'doc-1', sourceId: 'src-1', title: 'Book of Tyrael', mediaType: 'text/plain', textSha256: 'a'.repeat(64), chunkCount: 2, processingStatus: 'processed' }];

test('legacy compatibility dry-run preserves all records and recognizes identities', async () => {
  const layer = new LegacyCompatibilityLayer('diablo', [{ id: 'ent-tyrael', names: ['Tyrael'] }]);
  const staged = await layer.stage('run-1', articles, timeline, books);
  const report = await layer.report('run-1', staged, { articles: 1, timelineItems: 1, books: 1 });
  assert.equal(staged.length, 3); assert.equal(report.staged, 3); assert.equal(report.matchedEntities, 3);
  assert.deepEqual(report.integrityErrors, []); assert.match(report.fingerprint, /^[a-f0-9]{64}$/);
});

test('migration is non-destructive and rollback restores the exact previous state', async () => {
  const layer = new LegacyCompatibilityLayer('diablo'); const store = new NonDestructiveMigrationStore();
  const first = await layer.stage('run-1', articles, [], []); store.commit('run-1', first); const baseline = store.list();
  const second = await layer.stage('run-2', {}, timeline, books); store.commit('run-2', second); assert.equal(store.list().length, 3);
  store.rollback('run-2'); assert.deepEqual(store.list(), baseline); assert.equal(first[0].status, 'staged');
});

test('duplicate and integrity checks make migration collisions visible', async () => {
  const layer = new LegacyCompatibilityLayer('diablo');
  const staged = await layer.stage('dupes', articles, [{ id: 'one', title: 'Same' }, { id: 'two', title: 'Same' }], []);
  const report = await layer.report('dupes', staged, { articles: 1, timelineItems: 2, books: 0 });
  assert.equal(report.duplicates.filter((item) => item.kind === 'normalized-title').length, 1); assert.deepEqual(report.integrityErrors, []);
});

test('invalid legacy article and unprocessed book are blocked before staging', async () => {
  const layer = new LegacyCompatibilityLayer('diablo');
  await assert.rejects(layer.stage('bad', { key: { id: 'other', title: 'Bad', content: '' } }, [], []), /key\/id mismatch/);
  await assert.rejects(layer.stage('bad', {}, [], [{ ...books[0], processingStatus: 'failed' }]), /not processed/);
});
