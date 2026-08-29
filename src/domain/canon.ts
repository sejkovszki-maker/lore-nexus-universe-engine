import type { UniverseId } from '../core/contracts';
import type { Claim } from './knowledge.ts';

export interface SourceAuthorityRule {
  id: string; universeId: UniverseId; branchId: string; priority: number; sourceKinds: string[]; authorityTier: 'primary' | 'secondary' | 'licensed' | 'community' | 'unknown';
  baseScore: number; validFrom: string | null; validTo: string | null; notes: string;
}
export interface CanonBranch {
  id: string; universeId: UniverseId; name: string; parentBranchId: string | null; divergenceReason: string | null;
  createdAtUtc: string; status: 'draft' | 'active' | 'archived';
}
export interface CanonAssignment {
  claimId: string; branchId: string; status: 'canonical' | 'contested' | 'non-canonical' | 'deprecated';
  authorityScore: number; decidedBy: string; decidedAtUtc: string; reason: string;
}
export interface Retcon {
  id: string; universeId: UniverseId; branchId: string; supersededClaimIds: string[]; replacementClaimIds: string[];
  effectiveAtUtc: string; reason: string; evidenceIds: string[]; decidedBy: string;
}
export type ContradictionType = 'direct-object' | 'polarity' | 'temporal' | 'identity' | 'translation' | 'source-authority' | 'canon-branch' | 'scope' | 'uncertainty';
export interface KnowledgeConflict {
  id: string; universeId: UniverseId; claimIds: [string, string]; branchIds: [string, string]; types: ContradictionType[];
  severity: 'low' | 'medium' | 'high' | 'critical'; status: 'open' | 'resolved' | 'dismissed';
  explanation: string; detectedAtUtc: string; resolution?: { action: 'prefer-left' | 'prefer-right' | 'branch' | 'merge' | 'dismiss'; reviewer: string; reason: string; resolvedAtUtc: string };
}
export interface CanonClaimView { claim: Claim; branchId: string; authorityScore: number; }
export interface QualityScoreInput {
  evidenceCoverage: number; averageEvidenceReliability: number; citationCompleteness: number; authorityScore: number;
  claimConfidence: number; humanReviewed: boolean; openConflictSeverity: Array<KnowledgeConflict['severity']>;
}
export interface QualityScore { score: number; grade: 'A' | 'B' | 'C' | 'D' | 'F'; breakdown: Record<string, number>; blockers: string[]; }
