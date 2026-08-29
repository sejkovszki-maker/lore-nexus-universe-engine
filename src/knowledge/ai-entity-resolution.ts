import type { LlmProvider } from '../core/llm.ts';
import type { EntityMention, ResolutionCandidate } from './entity-resolution.ts';

export interface AiResolutionProposal {
  id: string; mention: EntityMention; proposedAction: 'link' | 'create' | 'ambiguous'; proposedEntityId: string | null;
  confidence: number; rationale: string; candidateEntityIds: string[]; providerId: string; modelVersion: string;
  promptVersion: string; status: 'staged'; createdAtUtc: string;
}

export class AiEntityResolutionService {
  readonly provider: LlmProvider; readonly promptVersion: string;
  constructor(provider: LlmProvider, promptVersion = 'entity-resolution-v1') { this.provider = provider; this.promptVersion = promptVersion; }
  async propose(mention: EntityMention, candidates: ResolutionCandidate[], signal?: AbortSignal): Promise<AiResolutionProposal> {
    const allowedIds = new Set(candidates.map((candidate) => candidate.entityId)); const response = await this.provider.generate({ temperature: 0, messages: [{ role: 'system', content: 'Return only a structured entity resolution proposal. Never invent candidate IDs.' }, { role: 'user', content: JSON.stringify({ mention, candidates }) }], responseSchema: { type: 'object', required: ['action', 'entityId', 'confidence', 'rationale'], properties: { action: { enum: ['link', 'create', 'ambiguous'] }, entityId: { type: ['string', 'null'] }, confidence: { type: 'number', minimum: 0, maximum: 1 }, rationale: { type: 'string' } } } }, signal);
    const output: any = response.structuredOutput ?? JSON.parse(response.content); if (!['link', 'create', 'ambiguous'].includes(output.action)) throw new Error('AI resolution action invalid'); if (typeof output.confidence !== 'number' || output.confidence < 0 || output.confidence > 1) throw new Error('AI resolution confidence invalid');
    if (output.action === 'link' && (!output.entityId || !allowedIds.has(output.entityId))) throw new Error('AI attempted to link an unknown candidate'); if (output.action !== 'link' && output.entityId !== null) throw new Error('Only link proposals may specify entityId');
    return { id: `aires:${response.requestId ?? crypto.randomUUID()}`, mention: structuredClone(mention), proposedAction: output.action, proposedEntityId: output.entityId, confidence: output.confidence, rationale: String(output.rationale), candidateEntityIds: [...allowedIds], providerId: response.provider, modelVersion: response.model, promptVersion: this.promptVersion, status: 'staged', createdAtUtc: new Date().toISOString() };
  }
}
