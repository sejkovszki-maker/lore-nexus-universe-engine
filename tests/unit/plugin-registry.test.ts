import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PluginRegistry, type UniversePlugin } from '../../src/core/plugins.ts';

function plugin(id = 'test.importer'): UniversePlugin & { initialized: boolean; disposed: boolean } {
  return {
    id, version: '1.0.0', apiVersion: 1, capabilities: new Set(['import']), initialized: false, disposed: false,
    async initialize() { this.initialized = true; },
    async dispose() { this.disposed = true; },
  };
}

test('plugin registry enforces identity, lifecycle and capability lookup', async () => {
  const registry = new PluginRegistry();
  const importer = plugin();
  await registry.register(importer);
  assert.equal(importer.initialized, true);
  assert.deepEqual(registry.byCapability('import'), [importer]);
  await assert.rejects(() => registry.register(plugin()), /already registered/);
  assert.equal(await registry.unregister(importer.id), true);
  assert.equal(importer.disposed, true);
});

test('plugin registry rejects invalid ids and API versions', async () => {
  const registry = new PluginRegistry();
  await assert.rejects(() => registry.register(plugin('X')), /Invalid plugin id/);
  const incompatible = { ...plugin('test.incompatible'), apiVersion: 2 as 1 };
  await assert.rejects(() => registry.register(incompatible), /Unsupported plugin API version/);
});
