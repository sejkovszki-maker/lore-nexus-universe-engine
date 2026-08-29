import type { Claim } from '../domain/knowledge.ts';
import type { CanonAssignment, CanonBranch, Retcon, SourceAuthorityRule } from '../domain/canon.ts';

export class SourceAuthorityModel {
  readonly #rules: SourceAuthorityRule[] = [];
  add(rule: SourceAuthorityRule): void { if (rule.baseScore < 0 || rule.baseScore > 1) throw new Error('Authority score must be within [0,1]'); if (this.#rules.some((item) => item.id === rule.id)) throw new Error('Duplicate authority rule'); this.#rules.push(structuredClone(rule)); }
  score(universeId: string, branchId: string, sourceKind: string, at = new Date().toISOString()): { score: number; tier: SourceAuthorityRule['authorityTier']; ruleId: string | null } {
    const time = Date.parse(at); const rule = this.#rules.filter((item) => item.universeId === universeId && item.branchId === branchId && item.sourceKinds.includes(sourceKind) && (!item.validFrom || Date.parse(item.validFrom) <= time) && (!item.validTo || Date.parse(item.validTo) >= time)).sort((a, b) => b.priority - a.priority)[0];
    return rule ? { score: rule.baseScore, tier: rule.authorityTier, ruleId: rule.id } : { score: 0, tier: 'unknown', ruleId: null };
  }
}

export class CanonEngine {
  readonly #branches = new Map<string, CanonBranch>(); readonly #claims = new Map<string, Claim>(); readonly #assignments = new Map<string, CanonAssignment>(); readonly #retcons = new Map<string, Retcon>();
  addBranch(branch: CanonBranch): void { if (this.#branches.has(branch.id)) throw new Error('Duplicate canon branch'); if (branch.parentBranchId) { const parent = this.#branches.get(branch.parentBranchId); if (!parent) throw new Error('Canon parent branch missing'); if (parent.universeId !== branch.universeId) throw new Error('Cross-universe canon branch forbidden'); } this.#branches.set(branch.id, structuredClone(branch)); }
  addClaim(claim: Claim): void { if (this.#claims.has(claim.id)) throw new Error('Duplicate canon claim'); this.#claims.set(claim.id, structuredClone(claim)); }
  assign(assignment: CanonAssignment): void { const branch = this.#branches.get(assignment.branchId); const claim = this.#claims.get(assignment.claimId); if (!branch || !claim) throw new Error('Canon assignment reference missing'); if (branch.universeId !== claim.universeId) throw new Error('Cross-universe canon assignment forbidden'); if (assignment.authorityScore < 0 || assignment.authorityScore > 1) throw new Error('Invalid canon authority score'); this.#assignments.set(`${assignment.branchId}:${assignment.claimId}`, structuredClone(assignment)); }
  effectiveAssignments(branchId: string): CanonAssignment[] {
    const lineage: CanonBranch[] = []; let current = this.#branches.get(branchId); if (!current) throw new Error('Canon branch missing'); while (current) { lineage.unshift(current); current = current.parentBranchId ? this.#branches.get(current.parentBranchId) : undefined; }
    const result = new Map<string, CanonAssignment>(); for (const branch of lineage) for (const assignment of this.#assignments.values()) if (assignment.branchId === branch.id) result.set(assignment.claimId, structuredClone(assignment)); return [...result.values()];
  }
  applyRetcon(retcon: Retcon): void {
    if (this.#retcons.has(retcon.id)) throw new Error('Duplicate retcon'); const branch = this.#branches.get(retcon.branchId); if (!branch || branch.universeId !== retcon.universeId) throw new Error('Retcon branch missing'); if (retcon.supersededClaimIds.length === 0 || retcon.replacementClaimIds.length === 0) throw new Error('Retcon requires superseded and replacement claims');
    for (const id of [...retcon.supersededClaimIds, ...retcon.replacementClaimIds]) if (!this.#claims.has(id)) throw new Error(`Retcon claim missing: ${id}`);
    for (const id of retcon.supersededClaimIds) { const key = `${retcon.branchId}:${id}`; const assignment = this.#assignments.get(key); if (!assignment) throw new Error(`Retcon assignment missing: ${id}`); assignment.status = 'deprecated'; assignment.reason = `Retcon ${retcon.id}: ${retcon.reason}`; }
    for (const id of retcon.replacementClaimIds) this.assign({ claimId: id, branchId: retcon.branchId, status: 'canonical', authorityScore: 1, decidedBy: retcon.decidedBy, decidedAtUtc: retcon.effectiveAtUtc, reason: `Retcon ${retcon.id}: ${retcon.reason}` }); this.#retcons.set(retcon.id, structuredClone(retcon));
  }
}
