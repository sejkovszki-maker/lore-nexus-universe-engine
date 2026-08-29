import type { KnowledgeGraph, TraversalPath } from '../graph/knowledge-graph.ts'; import type { SearchHit } from '../search/semantic-search.ts'; import { BaselineFactChecker } from './evaluation.ts'; import { hallucinationGuard, sanitizeModelOutput, type EvidenceAnswer } from './security.ts';
export interface RetrievedEvidence { id: string; universeId: string; text: string; sourceId: string; locator: string; qualityScore: number; storageRef: string }
export interface HybridRetriever { retrieve(input: { universeId: string; question: string; queryVector: number[]; limit: number }): Promise<SearchHit[]> }
export interface EvidenceLoader { load(storageRefs: string[]): Promise<RetrievedEvidence[]> }
export interface AnswerGenerator { answer(input: { question: string; evidence: RetrievedEvidence[]; graphPaths: TraversalPath[] }): Promise<EvidenceAnswer> }
export interface RagExplanation { retrieval: Array<{ id: string; score: number; signals: SearchHit['signals']; storageRef: string }>; graphPaths: TraversalPath[]; evidence: Array<{ id: string; sourceId: string; locator: string; qualityScore: number }>; checks: { citationErrors: string[]; factVerdicts: ReturnType<BaselineFactChecker['check']> } }
export interface RagResult { answer: EvidenceAnswer; confidence: number; explanation: RagExplanation; status: 'verified' | 'rejected' }

export class GraphRagEngine {
  readonly graph: KnowledgeGraph; readonly retrieval: HybridRetriever; readonly evidence: EvidenceLoader; readonly generator: AnswerGenerator; readonly checker = new BaselineFactChecker();
  constructor(input: { graph: KnowledgeGraph; retrieval: HybridRetriever; evidence: EvidenceLoader; generator: AnswerGenerator }) { this.graph = input.graph; this.retrieval = input.retrieval; this.evidence = input.evidence; this.generator = input.generator; }
  async ask(input: { universeId: string; question: string; queryVector: number[]; limit?: number; graphHops?: number }): Promise<RagResult> {
    if (!input.question.trim()) throw new Error('Question is required'); const limit = input.limit ?? 12; const hits = await this.retrieval.retrieve({ universeId: input.universeId, question: input.question, queryVector: input.queryVector, limit });
    const roots = hits.slice(0, 5).map((hit) => hit.id).filter((id) => this.graph.getNode(id)); const paths = roots.flatMap((root) => this.graph.traverse(input.universeId, root, input.graphHops ?? 2, { maxVisited: 2_000 })).slice(0, 100);
    const refs = [...new Set([...hits.map((hit) => hit.storageRef), ...paths.flatMap((path) => path.nodeIds.map((id) => this.graph.getNode(id)?.storageRef).filter((value): value is string => Boolean(value)))])];
    const loaded = (await this.evidence.load(refs)).filter((item) => item.universeId === input.universeId && item.qualityScore >= 70); const answer = await this.generator.answer({ question: input.question, evidence: structuredClone(loaded), graphPaths: structuredClone(paths) }); answer.text = sanitizeModelOutput(answer.text); answer.claims = answer.claims.map((claim) => ({ ...claim, text: sanitizeModelOutput(claim.text) }));
    const citationErrors = hallucinationGuard(answer, loaded.map((item) => item.id)); const factVerdicts = this.checker.check(answer, loaded.map(({ id, text }) => ({ id, text }))); const rejected = citationErrors.length > 0 || factVerdicts.some((item) => item.verdict !== 'supported'); const confidence = answer.claims.length ? answer.claims.reduce((sum, claim) => sum + claim.confidence, 0) / answer.claims.length : 0;
    return { answer, confidence: rejected ? Math.min(confidence, 0.49) : confidence, status: rejected ? 'rejected' : 'verified', explanation: { retrieval: hits.map(({ id, score, signals, storageRef }) => ({ id, score, signals, storageRef })), graphPaths: paths, evidence: loaded.map(({ id, sourceId, locator, qualityScore }) => ({ id, sourceId, locator, qualityScore })), checks: { citationErrors, factVerdicts } } };
  }
}
