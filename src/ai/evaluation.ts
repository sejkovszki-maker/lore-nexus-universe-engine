import { hallucinationGuard, type EvidenceAnswer } from './security.ts';
export interface GoldenCase { id: string; universeId: string; question: string; expectedAnswerTerms: string[]; allowedEvidenceIds: string[]; evidence: Array<{ id: string; text: string }> }
export interface EvaluationPrediction { caseId: string; answer: EvidenceAnswer }
export interface AiQualityMetrics { cases: number; termRecall: number; citationCompleteness: number; citationPrecision: number; groundedClaimRate: number; confidenceBrierScore: number; passRate: number }
const words = (value: string) => value.normalize('NFKC').toLocaleLowerCase('hu-HU').split(/[^\p{L}\p{N}]+/u).filter((word) => word.length >= 3);
export function evaluateAi(golden: GoldenCase[], predictions: EvaluationPrediction[]): AiQualityMetrics {
  if (!golden.length) throw new Error('Golden dataset is empty'); const byId = new Map(predictions.map((item) => [item.caseId, item])); if (byId.size !== predictions.length) throw new Error('Duplicate prediction case');
  let recalled = 0, expected = 0, claims = 0, cited = 0, citations = 0, validCitations = 0, grounded = 0, brier = 0, passed = 0;
  for (const item of golden) { const prediction = byId.get(item.id); if (!prediction) { expected += item.expectedAnswerTerms.length; continue; } const answerWords = new Set(words(prediction.answer.text)); const hits = item.expectedAnswerTerms.filter((term) => words(term).every((word) => answerWords.has(word))).length; recalled += hits; expected += item.expectedAnswerTerms.length; const allowed = new Set(item.allowedEvidenceIds); const evidenceById = new Map(item.evidence.map((entry) => [entry.id, new Set(words(entry.text))])); let caseValid = hits === item.expectedAnswerTerms.length && hallucinationGuard(prediction.answer, item.allowedEvidenceIds).length === 0;
    for (const claim of prediction.answer.claims) { claims++; if (claim.evidenceIds.length) cited++; citations += claim.evidenceIds.length; validCitations += claim.evidenceIds.filter((id) => allowed.has(id)).length; const claimWords = words(claim.text); const supported = claim.evidenceIds.some((id) => { const evidence = evidenceById.get(id); return evidence && claimWords.filter((word) => evidence.has(word)).length >= Math.min(2, claimWords.length); }); if (supported) grounded++; else caseValid = false; brier += (claim.confidence - (supported ? 1 : 0)) ** 2; }
    if (caseValid) passed++;
  }
  return { cases: golden.length, termRecall: expected ? recalled / expected : 0, citationCompleteness: claims ? cited / claims : 0, citationPrecision: citations ? validCitations / citations : 0, groundedClaimRate: claims ? grounded / claims : 0, confidenceBrierScore: claims ? brier / claims : 1, passRate: passed / golden.length };
}

export class BaselineFactChecker {
  check(answer: EvidenceAnswer, evidence: Array<{ id: string; text: string }>): Array<{ claim: string; verdict: 'supported' | 'unsupported'; evidenceIds: string[] }> { const byId = new Map(evidence.map((item) => [item.id, new Set(words(item.text))])); return answer.claims.map((claim) => { const claimWords = words(claim.text); const evidenceIds = claim.evidenceIds.filter((id) => { const terms = byId.get(id); return terms && claimWords.filter((word) => terms.has(word)).length >= Math.min(2, claimWords.length); }); return { claim: claim.text, verdict: evidenceIds.length ? 'supported' : 'unsupported', evidenceIds }; }); }
}
