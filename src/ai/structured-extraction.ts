import type { LlmProvider, LlmResponse } from '../core/llm.ts';

export interface ExtractedEntity { localId: string; typeId: string; name: string; aliases: string[]; confidence: number; evidence: { chunkId: string; quote: string } }
export interface ExtractedRelationship { localId: string; typeId: string; fromLocalId: string; toLocalId: string; confidence: number; evidence: { chunkId: string; quote: string } }
export interface ExtractedEvent { localId: string; typeId: string; name: string; participantLocalIds: string[]; dateText: string | null; confidence: number; evidence: { chunkId: string; quote: string } }
export interface ExtractionBundle { entities: ExtractedEntity[]; relationships: ExtractedRelationship[]; events: ExtractedEvent[] }
export interface StagedExtraction extends ExtractionBundle { id: string; universeId: string; documentId: string; passCount: number; provider: string; model: string; promptVersion: string; rawConfidence: number; calibratedConfidence: number; status: 'staged'; createdAtUtc: string }
export interface CalibrationBin { minimum: number; maximum: number; calibrated: number; samples: number }

const schema = { type: 'object', additionalProperties: false, required: ['entities', 'relationships', 'events'], properties: { entities: { type: 'array' }, relationships: { type: 'array' }, events: { type: 'array' } } };
function object(value: unknown, label: string): Record<string, unknown> { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`); return value as Record<string, unknown>; }
function text(value: unknown, label: string): string { if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be non-empty text`); return value; }
function confidence(value: unknown): number { if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) throw new Error('Extraction confidence must be in [0,1]'); return value; }
function evidence(value: unknown, chunkIds: Set<string>): { chunkId: string; quote: string } { const item = object(value, 'evidence'); const chunkId = text(item.chunkId, 'evidence.chunkId'); if (!chunkIds.has(chunkId)) throw new Error(`Extraction cites unknown chunk: ${chunkId}`); return { chunkId, quote: text(item.quote, 'evidence.quote') }; }
function array(value: unknown, label: string): unknown[] { if (!Array.isArray(value)) throw new Error(`${label} must be an array`); return value; }

export function validateExtraction(value: unknown, allowedChunkIds: string[]): ExtractionBundle {
  const root = object(value, 'extraction'); const keys = Object.keys(root); if (keys.some((key) => !['entities', 'relationships', 'events'].includes(key))) throw new Error('Extraction contains unknown root property'); const chunks = new Set(allowedChunkIds);
  const entities = array(root.entities, 'entities').map((raw) => { const item = object(raw, 'entity'); return { localId: text(item.localId, 'entity.localId'), typeId: text(item.typeId, 'entity.typeId'), name: text(item.name, 'entity.name'), aliases: array(item.aliases, 'entity.aliases').map((alias) => text(alias, 'alias')), confidence: confidence(item.confidence), evidence: evidence(item.evidence, chunks) }; });
  const localIds = new Set(entities.map((item) => item.localId)); if (localIds.size !== entities.length) throw new Error('Duplicate extracted entity localId');
  const relationships = array(root.relationships, 'relationships').map((raw) => { const item = object(raw, 'relationship'); const result = { localId: text(item.localId, 'relationship.localId'), typeId: text(item.typeId, 'relationship.typeId'), fromLocalId: text(item.fromLocalId, 'relationship.fromLocalId'), toLocalId: text(item.toLocalId, 'relationship.toLocalId'), confidence: confidence(item.confidence), evidence: evidence(item.evidence, chunks) }; if (!localIds.has(result.fromLocalId) || !localIds.has(result.toLocalId)) throw new Error('Relationship references unknown extracted entity'); return result; });
  const events = array(root.events, 'events').map((raw) => { const item = object(raw, 'event'); const participants = array(item.participantLocalIds, 'event.participantLocalIds').map((id) => text(id, 'participant')); if (participants.some((id) => !localIds.has(id))) throw new Error('Event references unknown extracted entity'); return { localId: text(item.localId, 'event.localId'), typeId: text(item.typeId, 'event.typeId'), name: text(item.name, 'event.name'), participantLocalIds: participants, dateText: item.dateText === null ? null : text(item.dateText, 'event.dateText'), confidence: confidence(item.confidence), evidence: evidence(item.evidence, chunks) }; });
  return { entities, relationships, events };
}

export class ConfidenceCalibrator {
  readonly bins: CalibrationBin[];
  constructor(bins: CalibrationBin[]) { if (!bins.length || bins.some((bin, index) => bin.minimum < 0 || bin.maximum > 1 || bin.minimum > bin.maximum || bin.calibrated < 0 || bin.calibrated > 1 || bin.samples < 1 || (index > 0 && bins[index - 1].maximum > bin.minimum))) throw new Error('Invalid calibration bins'); this.bins = structuredClone(bins); }
  calibrate(raw: number): number { confidence(raw); const bin = this.bins.find((item, index) => raw >= item.minimum && (raw < item.maximum || index === this.bins.length - 1 && raw <= item.maximum)); if (!bin) throw new Error('Confidence is outside calibration coverage'); return bin.calibrated; }
  static combine(values: { model: number; evidence: number; agreement: number }): number { Object.values(values).forEach(confidence); return Math.round((values.model * 0.45 + values.evidence * 0.35 + values.agreement * 0.2) * 10_000) / 10_000; }
}

export class StructuredExtractionService {
  readonly provider: LlmProvider; readonly calibrator: ConfidenceCalibrator; readonly promptVersion: string;
  constructor(provider: LlmProvider, calibrator: ConfidenceCalibrator, promptVersion = 'structured-extraction-v1') { if (!provider.capabilities.has('structured-output')) throw new Error('Provider lacks structured output capability'); this.provider = provider; this.calibrator = calibrator; this.promptVersion = promptVersion; }
  async extract(input: { universeId: string; documentId: string; chunks: Array<{ id: string; text: string }> }, signal?: AbortSignal): Promise<StagedExtraction> {
    if (!input.chunks.length) throw new Error('Extraction requires chunks'); const outputs: LlmResponse[] = [];
    for (const pass of ['entities', 'relationships-and-events', 'reconcile']) outputs.push(await this.provider.generate({ temperature: 0, messages: [{ role: 'system', content: `Extraction pass: ${pass}. Cite only supplied chunk IDs and quotes. Return staged structured data.` }, { role: 'user', content: JSON.stringify({ universeId: input.universeId, documentId: input.documentId, chunks: input.chunks, previous: outputs.map((item) => item.structuredOutput) }) }], responseSchema: schema }, signal));
    const final = outputs.at(-1)!; const bundle = validateExtraction(final.structuredOutput ?? JSON.parse(final.content), input.chunks.map(({ id }) => id));
    const all = [...bundle.entities, ...bundle.relationships, ...bundle.events]; const raw = all.length ? all.reduce((sum, item) => sum + item.confidence, 0) / all.length : 0;
    const evidenceQuality = all.length ? all.filter((item) => item.evidence.quote.length >= 8).length / all.length : 0; const priorSignatures = outputs.slice(0, -1).map((output) => JSON.stringify(output.structuredOutput ?? {})); const agreement = priorSignatures.length && priorSignatures.every((item) => item === JSON.stringify(final.structuredOutput ?? {})) ? 1 : 0.5;
    const combined = ConfidenceCalibrator.combine({ model: raw, evidence: evidenceQuality, agreement });
    return { id: `extract:${final.requestId ?? crypto.randomUUID()}`, universeId: input.universeId, documentId: input.documentId, ...bundle, passCount: outputs.length, provider: final.provider, model: final.model, promptVersion: this.promptVersion, rawConfidence: raw, calibratedConfidence: this.calibrator.calibrate(combined), status: 'staged', createdAtUtc: new Date().toISOString() };
  }
}
