import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { deterministicEntityId, deterministicUniverseId } from '../../src/core/deterministic-id.ts';
import { MigrationExecutor, MigrationRegistry } from '../../src/core/migrations.ts';
import { validateReferences } from '../../src/core/referential-integrity.ts';
import { SchemaRegistry } from '../../src/core/schema-registry.ts';
import { OntologyEngine } from '../../src/domain/ontology.ts';

test('Universe schema accepts valid data and rejects extra or malformed fields', async () => {
  const schema = JSON.parse(await readFile('schemas/universe/v1.schema.json', 'utf8'));
  const registry = new SchemaRegistry(); registry.register('universe', 1, schema);
  const id = await deterministicUniverseId('diablo');
  const valid = { id, schemaVersion: 1, slug: 'diablo', name: 'Diablo', defaultLocale: 'hu-HU', supportedLocales: ['hu-HU'], createdAtUtc: '2026-08-28T00:00:00Z', status: 'active' };
  assert.equal(registry.validate('universe', 1, valid).valid, true);
  assert.equal(registry.validate('universe', 1, { ...valid, unexpected: true }).valid, false);
});

test('deterministic IDs normalize equivalent identity input', async () => {
  assert.equal(await deterministicEntityId('UNI', 'Character', ' Tyrael  '), await deterministicEntityId('uni', 'character', 'tyrael'));
  assert.notEqual(await deterministicEntityId('uni-a', 'character', 'tyrael'), await deterministicEntityId('uni-b', 'character', 'tyrael'));
});

test('ontology versions are chained and backward compatibility is enforced', () => {
  const engine = new OntologyEngine();
  const v1 = { ontologyId: 'core', version: 1, previousVersion: null, releasedAtUtc: '2026-01-01T00:00:00Z', types: [{ id: 'character', kind: 'entity' as const, label: { en: 'Character' }, requiredProperties: ['name'], allowedProperties: ['name'] }] };
  engine.register(v1);
  const v2 = { ...v1, version: 2, previousVersion: 1, types: [{ ...v1.types[0], allowedProperties: ['name', 'title'] }] };
  assert.equal(engine.isBackwardCompatible('core', v2), true); engine.register(v2);
  assert.equal(engine.latest('core')?.version, 2);
  assert.equal(engine.isBackwardCompatible('core', { ...v2, version: 3, previousVersion: 2, types: [] }), false);
});

test('referential integrity reports missing and self references', () => {
  const violations = validateReferences([{ id: 'a', references: [{ field: 'parent', targetId: 'missing', required: true }, { field: 'self', targetId: 'a', required: false }] }]);
  assert.deepEqual(violations.map((item) => item.code), ['MISSING_REQUIRED_REFERENCE', 'SELF_REFERENCE_NOT_ALLOWED']);
});

test('migration registry creates contiguous forward and reverse plans', () => {
  const registry = new MigrationRegistry();
  const migration = (version: number) => ({ version, name: `v${version}`, async up() {}, async down() {} });
  registry.register(migration(1)); registry.register(migration(2));
  assert.deepEqual(registry.plan(0).map((item) => item.version), [1, 2]);
  assert.deepEqual(registry.rollbackPlan(2, 0).map((item) => item.version), [2, 1]);
});

test('migration executor advances and rolls back persisted schema version', async () => {
  const calls: string[] = []; let version = 0; const registry = new MigrationRegistry();
  for (const number of [1, 2]) registry.register({ version: number, name: `v${number}`, async up() { calls.push(`up${number}`); }, async down() { calls.push(`down${number}`); } });
  const executor = new MigrationExecutor(registry, { async currentVersion() { return version; }, async setVersion(next) { version = next; } }, { async execute() {} });
  await executor.migrate(); assert.equal(version, 2); await executor.rollback(0); assert.equal(version, 0);
  assert.deepEqual(calls, ['up1', 'up2', 'down2', 'down1']);
});
