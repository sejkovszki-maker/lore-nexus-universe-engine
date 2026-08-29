import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import type { Evidence } from '../domain/knowledge.ts';

export function evidenceQuoteHash(quote: string): string { return bytesToHex(sha256(new TextEncoder().encode(quote.normalize('NFC')))); }
export class EvidenceStore {
  readonly #evidence = new Map<string, Evidence>();
  add(evidence: Evidence): void {
    if (this.#evidence.has(evidence.id)) throw new Error(`Duplicate evidence: ${evidence.id}`); if (evidence.reliability < 0 || evidence.reliability > 1) throw new Error('Evidence reliability must be between 0 and 1');
    if (evidence.quoteSha256 !== evidenceQuoteHash(evidence.quote)) throw new Error('Evidence quote fingerprint mismatch');
    const hasLocator = Object.values(evidence.locator).some((value) => value !== undefined); if (!hasLocator) throw new Error('Evidence requires a precise locator'); this.#evidence.set(evidence.id, structuredClone(evidence));
  }
  get(id: string): Evidence | null { const value = this.#evidence.get(id); return value ? structuredClone(value) : null; }
  require(ids: string[]): Evidence[] { return ids.map((id) => { const evidence = this.get(id); if (!evidence) throw new Error(`Missing evidence: ${id}`); return evidence; }); }
}
