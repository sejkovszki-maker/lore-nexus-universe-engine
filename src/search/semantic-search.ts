export interface EmbeddingVersion { id: string; provider: string; model: string; dimensions: number; normalization: 'none' | 'l2'; createdAtUtc: string; modelFingerprint: string; status: 'active' | 'deprecated' }
export interface VectorMetadata { universeId: string; kind: string; locale?: string; canonStatus?: 'canonical' | 'contested' | 'non-canonical' | 'deprecated'; validFrom?: number | null; validTo?: number | null; [key: string]: string | number | boolean | null | undefined }
export interface VectorRecord { id: string; embeddingVersionId: string; vector: number[]; contentFingerprint: string; storageRef: string; metadata: VectorMetadata }
export interface SearchHit { id: string; score: number; storageRef: string; metadata: VectorMetadata; signals: { semantic?: number; lexical?: number; graph?: number } }
export interface SearchFilters { kinds?: string[]; locale?: string; canonStatuses?: VectorMetadata['canonStatus'][]; atTime?: number; metadata?: Record<string, string | number | boolean> }

export class EmbeddingVersionRegistry {
  #versions = new Map<string, EmbeddingVersion>();
  register(version: EmbeddingVersion): void { if (this.#versions.has(version.id)) throw new Error(`Embedding version is immutable: ${version.id}`); if (!Number.isInteger(version.dimensions) || version.dimensions < 2 || version.dimensions > 65_536) throw new Error('Invalid embedding dimensions'); if (!/^[a-f0-9]{64}$/.test(version.modelFingerprint)) throw new Error('Invalid model fingerprint'); this.#versions.set(version.id, structuredClone(version)); }
  get(id: string): EmbeddingVersion { const version = this.#versions.get(id); if (!version) throw new Error(`Embedding version missing: ${id}`); return structuredClone(version); }
  deprecate(id: string): EmbeddingVersion { const version = this.get(id); const replacement = { ...version, status: 'deprecated' as const }; this.#versions.set(id, replacement); return structuredClone(replacement); }
}

function magnitude(vector: number[]): number { return Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)); }
function cosine(left: number[], right: number[]): number { const lm = magnitude(left); const rm = magnitude(right); return left.reduce((sum, value, index) => sum + value * right[index], 0) / (lm * rm); }
function passes(metadata: VectorMetadata, filters: SearchFilters): boolean {
  if (filters.kinds && !filters.kinds.includes(metadata.kind)) return false; if (filters.locale && metadata.locale !== filters.locale) return false;
  if (filters.canonStatuses && (!metadata.canonStatus || !filters.canonStatuses.includes(metadata.canonStatus))) return false;
  if (filters.atTime !== undefined && ((metadata.validFrom ?? -Infinity) > filters.atTime || (metadata.validTo ?? Infinity) < filters.atTime)) return false;
  return !filters.metadata || Object.entries(filters.metadata).every(([key, value]) => metadata[key] === value);
}

export class VectorIndex {
  #records = new Map<string, VectorRecord>(); #vectorOwners = new Map<string, string>();
  readonly versions: EmbeddingVersionRegistry; readonly maxAbsoluteComponent: number;
  constructor(versions: EmbeddingVersionRegistry, maxAbsoluteComponent = 100) { this.versions = versions; this.maxAbsoluteComponent = maxAbsoluteComponent; }
  add(record: VectorRecord): void {
    if (this.#records.has(record.id)) throw new Error(`Duplicate vector record: ${record.id}`); const version = this.versions.get(record.embeddingVersionId);
    if (version.status !== 'active') throw new Error('Deprecated embedding version cannot accept records'); if (record.vector.length !== version.dimensions) throw new Error('Embedding dimension mismatch');
    if (record.vector.some((value) => !Number.isFinite(value) || Math.abs(value) > this.maxAbsoluteComponent) || magnitude(record.vector) === 0) throw new Error('Potentially poisoned embedding');
    if (!/^[a-f0-9]{64}$/.test(record.contentFingerprint) || !record.storageRef || !record.metadata.universeId) throw new Error('Vector provenance is incomplete');
    const signature = `${record.metadata.universeId}:${record.embeddingVersionId}:${record.vector.join(',')}`; const owner = this.#vectorOwners.get(signature);
    if (owner && owner !== record.contentFingerprint) throw new Error('Embedding collision with conflicting content fingerprint');
    this.#vectorOwners.set(signature, record.contentFingerprint); this.#records.set(record.id, structuredClone(record));
  }
  search(universeId: string, embeddingVersionId: string, query: number[], limit = 20, filters: SearchFilters = {}): SearchHit[] {
    const version = this.versions.get(embeddingVersionId); if (query.length !== version.dimensions || query.some((value) => !Number.isFinite(value)) || magnitude(query) === 0) throw new Error('Invalid query embedding');
    if (!Number.isInteger(limit) || limit < 1 || limit > 200) throw new Error('Search limit must be between 1 and 200');
    return [...this.#records.values()].filter((record) => record.metadata.universeId === universeId && record.embeddingVersionId === embeddingVersionId && passes(record.metadata, filters))
      .map((record) => ({ id: record.id, score: cosine(query, record.vector), storageRef: record.storageRef, metadata: structuredClone(record.metadata), signals: { semantic: cosine(query, record.vector) } }))
      .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, limit);
  }
}

export interface RankedCandidate { id: string; storageRef: string; metadata: VectorMetadata; lexical?: number; graph?: number }
export class HybridSearchEngine {
  readonly vector: VectorIndex;
  constructor(vector: VectorIndex) { this.vector = vector; }
  search(input: { universeId: string; embeddingVersionId: string; queryVector: number[]; candidates?: RankedCandidate[]; filters?: SearchFilters; limit?: number; weights?: { semantic: number; lexical: number; graph: number } }): SearchHit[] {
    const limit = input.limit ?? 20; const weights = input.weights ?? { semantic: 0.6, lexical: 0.25, graph: 0.15 };
    if (Object.values(weights).some((value) => value < 0) || Math.abs(Object.values(weights).reduce((a, b) => a + b, 0) - 1) > 1e-9) throw new Error('Hybrid ranking weights must sum to 1');
    const semantic = this.vector.search(input.universeId, input.embeddingVersionId, input.queryVector, 200, input.filters); const merged = new Map<string, SearchHit>();
    for (const hit of semantic) merged.set(hit.id, { ...hit, score: weights.semantic * Math.max(0, hit.score) });
    for (const item of input.candidates ?? []) { if (item.metadata.universeId !== input.universeId || !passes(item.metadata, input.filters ?? {})) continue; const current = merged.get(item.id) ?? { id: item.id, score: 0, storageRef: item.storageRef, metadata: structuredClone(item.metadata), signals: {} }; current.signals.lexical = item.lexical; current.signals.graph = item.graph; current.score += weights.lexical * (item.lexical ?? 0) + weights.graph * (item.graph ?? 0); merged.set(item.id, current); }
    return [...merged.values()].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, limit);
  }
}
