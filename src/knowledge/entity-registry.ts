import type { Alias, Entity, EntityIdentityEvent } from '../domain/knowledge.ts';

export function normalizeAlias(value: string): string { return value.normalize('NFKC').trim().toLocaleLowerCase('en-US').replace(/[’'`]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim(); }

export class EntityRegistry {
  readonly #entities = new Map<string, Entity>(); readonly #aliases = new Map<string, Alias>(); readonly #history: EntityIdentityEvent[] = [];
  addEntity(entity: Entity): void { if (this.#entities.has(entity.id)) throw new Error(`Duplicate entity: ${entity.id}`); this.#entities.set(entity.id, structuredClone(entity)); }
  getEntity(id: string): Entity | null { const entity = this.#entities.get(id); return entity ? structuredClone(entity) : null; }
  listEntities(universeId?: string): Entity[] { return [...this.#entities.values()].filter((entity) => !universeId || entity.universeId === universeId).map((entity) => structuredClone(entity)); }
  updateEntity(entity: Entity): void { const current = this.#entities.get(entity.id); if (!current) throw new Error(`Entity missing: ${entity.id}`); if (current.universeId !== entity.universeId) throw new Error('Entity universe is immutable'); this.#entities.set(entity.id, structuredClone(entity)); }
  addAlias(alias: Alias): void {
    const entity = this.#entities.get(alias.entityId); if (!entity) throw new Error(`Alias target missing: ${alias.entityId}`);
    if (entity.universeId !== alias.universeId) throw new Error('Cross-universe alias is forbidden'); if (alias.normalizedValue !== normalizeAlias(alias.value)) throw new Error('Alias normalization mismatch');
    if (this.#aliases.has(alias.id)) throw new Error(`Duplicate alias: ${alias.id}`); this.#aliases.set(alias.id, structuredClone(alias));
  }
  resolve(universeId: string, text: string, locale?: string): Entity[] {
    const normalized = normalizeAlias(text); const ids = new Set<string>();
    for (const alias of this.#aliases.values()) if (alias.universeId === universeId && alias.normalizedValue === normalized && (!locale || alias.locale === locale)) ids.add(alias.entityId);
    for (const entity of this.#entities.values()) if (entity.universeId === universeId && Object.entries(entity.canonicalNames).some(([key, value]) => (!locale || key === locale) && normalizeAlias(value) === normalized)) ids.add(entity.id);
    return [...ids].map((id) => structuredClone(this.#entities.get(id)!));
  }
  aliasesFor(entityId: string): Alias[] { return [...this.#aliases.values()].filter((alias) => alias.entityId === entityId).map((alias) => structuredClone(alias)); }
  recordIdentityEvent(event: EntityIdentityEvent): void {
    if (!this.#entities.has(event.entityId)) throw new Error('Identity event entity missing');
    const involved = [...event.previousEntityIds, ...event.resultingEntityIds]; if (involved.some((id) => !this.#entities.has(id))) throw new Error('Identity event references missing entity');
    if (this.#history.some((item) => item.id === event.id)) throw new Error('Duplicate identity event'); this.#history.push(structuredClone(event));
  }
  history(entityId: string): EntityIdentityEvent[] { return this.#history.filter((event) => event.entityId === entityId || event.previousEntityIds.includes(entityId as never) || event.resultingEntityIds.includes(entityId as never)).map((event) => structuredClone(event)); }
}
