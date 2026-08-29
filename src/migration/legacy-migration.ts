import { normalizeAlias } from '../knowledge/entity-registry.ts';

export interface LegacyArticle { id: string; category?: string; title: string; subtitle?: string; infobox?: Record<string, unknown>; content: string; [key: string]: unknown }
export interface LegacyTimelineItem { id: string; title: string; date?: string; [key: string]: unknown }
export interface LegacyBookDocument { id: string; sourceId: string; title: string; mediaType: string; textSha256: string; chunkCount: number; processingStatus: string }
export interface ExistingIdentity { id: string; names: string[] }
export interface StagedLegacyRecord {
  migrationId: string; universeId: string; kind: 'article' | 'timeline' | 'book'; legacyId: string; title: string;
  sourceFingerprint: string; payload: Readonly<Record<string, unknown>>; matchedEntityIds: string[]; status: 'staged' | 'committed';
}
export interface MigrationDuplicate { kind: 'legacy-id' | 'fingerprint' | 'normalized-title'; key: string; recordIds: string[] }
export interface MigrationReport {
  migrationId: string; mode: 'dry-run' | 'committed'; input: { articles: number; timelineItems: number; books: number };
  staged: number; matchedEntities: number; duplicates: MigrationDuplicate[]; integrityErrors: string[]; fingerprint: string;
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonical(item)]));
  return value;
}

async function fingerprint(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(canonical(value)));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function findExisting(title: string, identities: ExistingIdentity[]): string[] {
  const normalized = normalizeAlias(title);
  return identities.filter((identity) => identity.names.some((name) => normalized === normalizeAlias(name) || normalized.includes(normalizeAlias(name)))).map(({ id }) => id).sort();
}

function duplicates(records: StagedLegacyRecord[]): MigrationDuplicate[] {
  const result: MigrationDuplicate[] = [];
  const fields: Array<[MigrationDuplicate['kind'], (record: StagedLegacyRecord) => string]> = [
    ['legacy-id', (record) => `${record.kind}:${record.legacyId}`],
    ['fingerprint', (record) => `${record.kind}:${record.sourceFingerprint}`],
    ['normalized-title', (record) => `${record.kind}:${normalizeAlias(record.title)}`],
  ];
  for (const [kind, keyOf] of fields) {
    const groups = new Map<string, string[]>();
    for (const record of records) groups.set(keyOf(record), [...(groups.get(keyOf(record)) ?? []), record.migrationId]);
    for (const [key, recordIds] of groups) if (recordIds.length > 1) result.push({ kind, key, recordIds: recordIds.sort() });
  }
  return result.sort((a, b) => `${a.kind}:${a.key}`.localeCompare(`${b.kind}:${b.key}`));
}

export class NonDestructiveMigrationStore {
  #committed = new Map<string, StagedLegacyRecord>();
  #snapshots = new Map<string, Map<string, StagedLegacyRecord>>();
  list(): StagedLegacyRecord[] { return structuredClone([...this.#committed.values()]); }
  commit(migrationId: string, staged: StagedLegacyRecord[]): void {
    if (this.#snapshots.has(migrationId)) throw new Error(`Migration already committed: ${migrationId}`);
    this.#snapshots.set(migrationId, structuredClone(this.#committed));
    for (const record of staged) {
      const key = `${record.universeId}:${record.kind}:${record.legacyId}`;
      if (this.#committed.has(key)) throw new Error(`Committed legacy record already exists: ${key}`);
      this.#committed.set(key, { ...structuredClone(record), status: 'committed' });
    }
  }
  rollback(migrationId: string): void {
    const snapshot = this.#snapshots.get(migrationId); if (!snapshot) throw new Error(`Migration snapshot missing: ${migrationId}`);
    this.#committed = structuredClone(snapshot); this.#snapshots.delete(migrationId);
  }
}

export class LegacyCompatibilityLayer {
  readonly universeId: string;
  readonly identities: ExistingIdentity[];
  constructor(universeId: string, identities: ExistingIdentity[] = []) {
    if (!universeId) throw new Error('Universe ID is required');
    this.universeId = universeId; this.identities = structuredClone(identities);
  }
  async stage(migrationId: string, articles: Record<string, LegacyArticle>, timeline: LegacyTimelineItem[], books: LegacyBookDocument[]): Promise<StagedLegacyRecord[]> {
    const records: StagedLegacyRecord[] = [];
    const add = async (kind: StagedLegacyRecord['kind'], legacyId: string, title: string, payload: Record<string, unknown>) => records.push({
      migrationId: `${migrationId}:${kind}:${legacyId}`, universeId: this.universeId, kind, legacyId, title,
      sourceFingerprint: await fingerprint(payload), payload: structuredClone(payload), matchedEntityIds: findExisting(title, this.identities), status: 'staged',
    });
    for (const [key, article] of Object.entries(articles)) { if (key !== article.id) throw new Error(`Article key/id mismatch: ${key}`); await add('article', article.id, article.title, article); }
    for (const item of timeline) await add('timeline', item.id, item.title, item);
    for (const book of books) { if (book.processingStatus !== 'processed') throw new Error(`Book is not processed: ${book.id}`); await add('book', book.id, book.title, book as unknown as Record<string, unknown>); }
    return records;
  }
  async report(migrationId: string, records: StagedLegacyRecord[], input: MigrationReport['input'], mode: MigrationReport['mode'] = 'dry-run'): Promise<MigrationReport> {
    const integrityErrors: string[] = [];
    if (records.length !== input.articles + input.timelineItems + input.books) integrityErrors.push('Input/staging record count mismatch');
    if (records.some((record) => record.universeId !== this.universeId)) integrityErrors.push('Cross-universe staged record');
    if (records.some((record) => !/^[a-f0-9]{64}$/.test(record.sourceFingerprint))) integrityErrors.push('Invalid source fingerprint');
    const foundDuplicates = duplicates(records);
    const reportBase = { migrationId, mode, input, staged: records.length, matchedEntities: records.filter((record) => record.matchedEntityIds.length > 0).length, duplicates: foundDuplicates, integrityErrors };
    return { ...reportBase, fingerprint: await fingerprint(reportBase) };
  }
}
