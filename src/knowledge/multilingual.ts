import type { Entity, TranslationRecord } from '../domain/knowledge.ts';

export class MultilingualKnowledge {
  readonly #translations = new Map<string, TranslationRecord>();
  add(record: TranslationRecord): void { const key = `${record.universeId}:${record.conceptId}:${record.locale}`; if (this.#translations.has(key)) throw new Error(`Translation already exists: ${key}`); this.#translations.set(key, structuredClone(record)); }
  translate(universeId: string, conceptId: string, locale: string, fallbackLocales: string[] = []): TranslationRecord | null {
    for (const candidate of [locale, ...fallbackLocales]) { const record = this.#translations.get(`${universeId}:${conceptId}:${candidate}`); if (record) return structuredClone(record); }
    return null;
  }
  entityLabel(entity: Entity, locale: string, fallbackLocales: string[] = []): string | null {
    for (const candidate of [locale, ...fallbackLocales]) if (entity.canonicalNames[candidate]) return entity.canonicalNames[candidate]; return Object.values(entity.canonicalNames)[0] ?? null;
  }
}
