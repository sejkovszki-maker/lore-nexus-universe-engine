import type { ProvenanceRecord } from '../domain/knowledge.ts';
export class ProvenanceStore {
  readonly #records = new Map<string, ProvenanceRecord>();
  add(record: ProvenanceRecord): void { if (this.#records.has(record.id)) throw new Error('Duplicate provenance record'); if (record.outputIds.length === 0) throw new Error('Provenance requires outputs'); if (Date.parse(record.completedAtUtc) < Date.parse(record.startedAtUtc)) throw new Error('Provenance completion precedes start'); this.#records.set(record.id, structuredClone(record)); }
  forOutput(outputId: string): ProvenanceRecord[] { return [...this.#records.values()].filter((record) => record.outputIds.includes(outputId)).map((record) => structuredClone(record)); }
}
