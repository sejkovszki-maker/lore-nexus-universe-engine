import type { Entity, EntityIdentityEvent } from '../domain/knowledge.ts';
import type { EntityRegistry } from './entity-registry.ts';

export class EntityMutationEngine {
  readonly #redirects = new Map<string, string>(); readonly registry: EntityRegistry;
  constructor(registry: EntityRegistry) { this.registry = registry; }
  merge(targetId: string, sourceIds: string[], reason: string, evidenceIds: string[], timestampUtc: string): EntityIdentityEvent[] {
    const target = this.registry.getEntity(targetId); if (!target) throw new Error('Merge target missing'); if (sourceIds.length === 0 || new Set(sourceIds).size !== sourceIds.length || sourceIds.includes(targetId)) throw new Error('Invalid merge sources'); const events = [];
    for (const sourceId of sourceIds) { const source = this.registry.getEntity(sourceId); if (!source) throw new Error(`Merge source missing: ${sourceId}`); if (source.universeId !== target.universeId) throw new Error('Cross-universe merge forbidden'); if (source.status !== 'active') throw new Error('Only active entities can be merged'); this.registry.updateEntity({ ...source, status: 'merged', updatedAtUtc: timestampUtc }); this.#redirects.set(sourceId, targetId); const event: EntityIdentityEvent = { id: `merge:${sourceId}:${targetId}:${timestampUtc}`, universeId: target.universeId, entityId: source.id, type: 'merged', timestampUtc, previousEntityIds: [source.id], resultingEntityIds: [target.id], reason, evidenceIds: [...evidenceIds] }; this.registry.recordIdentityEvent(event); events.push(event); }
    return events;
  }
  split(sourceId: string, resultingEntities: Entity[], reason: string, evidenceIds: string[], timestampUtc: string): EntityIdentityEvent {
    const source = this.registry.getEntity(sourceId); if (!source || source.status !== 'active') throw new Error('Split source must be active'); if (resultingEntities.length < 2) throw new Error('Split requires at least two resulting entities'); if (resultingEntities.some((entity) => entity.universeId !== source.universeId || entity.id === source.id)) throw new Error('Invalid split result');
    for (const entity of resultingEntities) this.registry.addEntity(entity); this.registry.updateEntity({ ...source, status: 'split', updatedAtUtc: timestampUtc }); const event: EntityIdentityEvent = { id: `split:${sourceId}:${timestampUtc}`, universeId: source.universeId, entityId: source.id, type: 'split', timestampUtc, previousEntityIds: [source.id], resultingEntityIds: resultingEntities.map((entity) => entity.id), reason, evidenceIds: [...evidenceIds] }; this.registry.recordIdentityEvent(event); return event;
  }
  canonicalId(id: string): string { const visited = new Set<string>(); let current = id; while (this.#redirects.has(current)) { if (visited.has(current)) throw new Error('Entity redirect cycle'); visited.add(current); current = this.#redirects.get(current)!; } return current; }
}
