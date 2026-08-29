import { bytesToHex } from '@noble/hashes/utils.js';
import { sha256 } from '@noble/hashes/sha2.js';
import type { CanonClaimView, ContradictionType, KnowledgeConflict } from '../domain/canon.ts';

const canonical = (value: unknown): string => JSON.stringify(value, Object.keys(value as object).sort());
const hash = (value: string): string => bytesToHex(sha256(new TextEncoder().encode(value)));
function overlaps(left: CanonClaimView['claim'], right: CanonClaimView['claim']): boolean { const start = Math.max(left.validFrom ? Date.parse(left.validFrom) : -Infinity, right.validFrom ? Date.parse(right.validFrom) : -Infinity); const end = Math.min(left.validTo ? Date.parse(left.validTo) : Infinity, right.validTo ? Date.parse(right.validTo) : Infinity); return start <= end; }

export class ConflictEngine {
  detect(views: CanonClaimView[], detectedAtUtc = new Date().toISOString()): KnowledgeConflict[] {
    const conflicts: KnowledgeConflict[] = [];
    for (let i = 0; i < views.length; i += 1) for (let j = i + 1; j < views.length; j += 1) {
      const left = views[i]; const right = views[j]; if (left.claim.universeId !== right.claim.universeId || left.claim.subjectEntityId !== right.claim.subjectEntityId || left.claim.predicate !== right.claim.predicate) continue;
      const types: ContradictionType[] = []; const timeOverlap = overlaps(left.claim, right.claim);
      if (timeOverlap && canonical(left.claim.object) !== canonical(right.claim.object)) types.push('direct-object'); if (timeOverlap && left.claim.polarity !== right.claim.polarity) types.push('polarity');
      if (!timeOverlap && canonical(left.claim.object) !== canonical(right.claim.object)) types.push('temporal'); if (left.branchId !== right.branchId) types.push('canon-branch');
      if (Math.abs(left.authorityScore - right.authorityScore) >= 0.3) types.push('source-authority'); if (Math.abs(left.claim.uncertainty.confidence - right.claim.uncertainty.confidence) >= 0.4) types.push('uncertainty');
      if (types.length === 0 || (types.length === 1 && types[0] === 'canon-branch')) continue; const critical = types.includes('polarity') && types.includes('direct-object'); const severity = critical ? 'critical' : types.includes('direct-object') ? 'high' : types.length >= 2 ? 'medium' : 'low';
      conflicts.push({ id: `conf_${hash([left.claim.id, right.claim.id, ...types].sort().join('|')).slice(0, 40)}`, universeId: left.claim.universeId, claimIds: [left.claim.id, right.claim.id], branchIds: [left.branchId, right.branchId], types, severity, status: 'open', explanation: `Contradiction: ${types.join(', ')}`, detectedAtUtc });
    }
    return conflicts;
  }
}

export class ConflictReviewQueue {
  readonly #conflicts = new Map<string, KnowledgeConflict>(); readonly #listeners = new Set<() => void>();
  add(conflict: KnowledgeConflict): void { if (!this.#conflicts.has(conflict.id)) { this.#conflicts.set(conflict.id, structuredClone(conflict)); this.#notify(); } }
  list(status?: KnowledgeConflict['status']): KnowledgeConflict[] { return [...this.#conflicts.values()].filter((item) => !status || item.status === status).map((item) => structuredClone(item)); }
  resolve(id: string, resolution: NonNullable<KnowledgeConflict['resolution']>): void { const conflict = this.#conflicts.get(id); if (!conflict) throw new Error('Conflict not found'); if (conflict.status !== 'open') throw new Error('Conflict is already closed'); conflict.status = resolution.action === 'dismiss' ? 'dismissed' : 'resolved'; conflict.resolution = structuredClone(resolution); this.#notify(); }
  subscribe(listener: () => void): () => void { this.#listeners.add(listener); return () => this.#listeners.delete(listener); }
  #notify(): void { for (const listener of this.#listeners) listener(); }
}
export const conflictReviewQueue = new ConflictReviewQueue();
