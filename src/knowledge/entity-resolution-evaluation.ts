import type { EntityMention, EntityResolutionEngine, ResolutionResult } from './entity-resolution.ts';
import type { Alias, Entity } from '../domain/knowledge.ts';

export interface ResolutionGoldenCase { id: string; mention: EntityMention; expectedEntityId: string | null; }
export interface ResolutionEvaluation { cases: number; truePositive: number; falsePositive: number; falseNegative: number; trueNegative: number; precision: number; recall: number; f1: number; top1Accuracy: number; falseMergeRate: number; ambiguousRate: number; results: Array<{ caseId: string; expected: string | null; predicted: string | null; topCandidate: string | null; ambiguous: boolean }> }
const divide = (numerator: number, denominator: number) => denominator === 0 ? 0 : numerator / denominator;

export function evaluateEntityResolution(engine: EntityResolutionEngine, golden: ResolutionGoldenCase[], entities: Entity[], aliases: Alias[]): ResolutionEvaluation {
  let truePositive = 0; let falsePositive = 0; let falseNegative = 0; let trueNegative = 0; let top1Correct = 0; let ambiguous = 0; const results = [];
  for (const item of golden) { const resolution: ResolutionResult = engine.resolve(item.mention, entities, aliases); const predicted = resolution.existingEntityId; const topCandidate = resolution.candidates[0]?.entityId ?? null; if (item.expectedEntityId && predicted === item.expectedEntityId) truePositive += 1; else if (!item.expectedEntityId && !predicted) trueNegative += 1; else if (!item.expectedEntityId && predicted) falsePositive += 1; else if (item.expectedEntityId && !predicted) falseNegative += 1; else { falsePositive += 1; falseNegative += 1; } if (topCandidate === item.expectedEntityId) top1Correct += 1; if (resolution.ambiguous) ambiguous += 1; results.push({ caseId: item.id, expected: item.expectedEntityId, predicted, topCandidate, ambiguous: resolution.ambiguous }); }
  const precision = divide(truePositive, truePositive + falsePositive); const recall = divide(truePositive, truePositive + falseNegative); return { cases: golden.length, truePositive, falsePositive, falseNegative, trueNegative, precision, recall, f1: divide(2 * precision * recall, precision + recall), top1Accuracy: divide(top1Correct, golden.length), falseMergeRate: divide(falsePositive, falsePositive + trueNegative), ambiguousRate: divide(ambiguous, golden.length), results };
}
