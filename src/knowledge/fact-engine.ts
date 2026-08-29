import type { Claim, Fact, InferenceTrace } from '../domain/knowledge.ts';
import type { EvidenceStore } from './evidence-store.ts';

export function validateUncertainty(claim: Claim): void {
  const { confidence, lowerBound, upperBound } = claim.uncertainty;
  if (![confidence, lowerBound, upperBound].every((value) => value >= 0 && value <= 1)) throw new Error('Uncertainty values must be within [0,1]');
  if (lowerBound > confidence || confidence > upperBound) throw new Error('Uncertainty interval must contain confidence');
  if (claim.polarity === 'negative' && claim.modality === 'unknown') throw new Error('Explicit negative knowledge cannot use unknown modality');
}
export class FactEngine {
  readonly #claims = new Map<string, Claim>(); readonly #inferences = new Map<string, InferenceTrace>();
  readonly evidence: EvidenceStore;
  constructor(evidence: EvidenceStore) { this.evidence = evidence; }
  stage(claim: Claim): void { validateUncertainty(claim); if (this.#claims.has(claim.id)) throw new Error('Duplicate claim'); this.evidence.require(claim.evidenceIds); this.#claims.set(claim.id, structuredClone(claim)); }
  accept(claimId: string): Claim { const claim = this.#claims.get(claimId); if (!claim) throw new Error('Claim not found'); if (claim.status !== 'validated') throw new Error('Only validated claims can be accepted'); claim.status = 'accepted'; return structuredClone(claim); }
  materializeFact(claimId: string, validator: string, validatedAtUtc: string): Fact {
    const claim = this.#claims.get(claimId); if (!claim || claim.status !== 'accepted') throw new Error('Fact requires an accepted claim'); const evidence = this.evidence.require(claim.evidenceIds);
    if (!evidence.some((item) => item.stance === 'supports')) throw new Error('Fact requires supporting evidence');
    const evidenceConfidence = Math.min(...evidence.filter((item) => item.stance === 'supports').map((item) => item.reliability));
    return { id: `fact_${claim.id}`, universeId: claim.universeId, claimId: claim.id, subjectEntityId: claim.subjectEntityId, predicate: claim.predicate, object: structuredClone(claim.object), polarity: claim.polarity, confidence: Math.min(claim.uncertainty.confidence, evidenceConfidence), evidenceIds: [...claim.evidenceIds], validatedAtUtc, validator };
  }
  addInference(trace: InferenceTrace): void { if (trace.premiseClaimIds.length === 0) throw new Error('Inference requires premises'); if (trace.premiseClaimIds.some((id) => !this.#claims.has(id)) || !this.#claims.has(trace.conclusionClaimId)) throw new Error('Inference references unknown claim'); if (this.#inferences.has(trace.id)) throw new Error('Duplicate inference'); this.#inferences.set(trace.id, structuredClone(trace)); }
}
