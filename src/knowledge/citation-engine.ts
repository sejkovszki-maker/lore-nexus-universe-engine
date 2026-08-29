import type { Citation } from '../domain/knowledge.ts';
import type { EvidenceStore } from './evidence-store.ts';
export class CitationEngine {
  readonly evidence: EvidenceStore;
  constructor(evidence: EvidenceStore) { this.evidence = evidence; }
  cite(evidenceId: string): Citation {
    const evidence = this.evidence.get(evidenceId); if (!evidence) throw new Error(`Evidence not found: ${evidenceId}`); const parts: string[] = [];
    if (evidence.locator.page !== undefined) parts.push(`p. ${evidence.locator.page}`); if (evidence.locator.sectionId) parts.push(`section ${evidence.locator.sectionId}`);
    if (evidence.locator.startOffset !== undefined) parts.push(`offset ${evidence.locator.startOffset}-${evidence.locator.endOffset ?? '?'}`); if (evidence.locator.timestampMs !== undefined) parts.push(`t=${evidence.locator.timestampMs}ms`);
    if (parts.length === 0) throw new Error('Citation locator is incomplete'); return { evidenceId, sourceId: evidence.sourceId, documentId: evidence.documentId, locatorText: parts.join(', '), quote: evidence.quote, quoteSha256: evidence.quoteSha256 };
  }
  completeness(evidenceIds: string[]): { complete: boolean; missing: string[] } { const missing = evidenceIds.filter((id) => !this.evidence.get(id)); return { complete: missing.length === 0, missing }; }
}
