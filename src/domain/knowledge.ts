import type { EntityId, SourceId, UniverseId } from '../core/contracts';

export type LocalizedText = Record<string, string>;
export interface Entity {
  id: EntityId; universeId: UniverseId; typeId: string; status: 'active' | 'merged' | 'split' | 'deprecated';
  canonicalNames: LocalizedText; description: LocalizedText; properties: Record<string, unknown>;
  createdAtUtc: string; updatedAtUtc: string;
}
export interface Alias {
  id: string; universeId: UniverseId; entityId: EntityId; locale: string; value: string; normalizedValue: string;
  kind: 'name' | 'title' | 'epithet' | 'translation' | 'former-name' | 'misspelling';
  validFrom: string | null; validTo: string | null; evidenceIds: string[];
}
export interface EntityIdentityEvent {
  id: string; universeId: UniverseId; entityId: EntityId; type: 'created' | 'renamed' | 'merged' | 'split' | 'retyped' | 'deprecated';
  timestampUtc: string; previousEntityIds: EntityId[]; resultingEntityIds: EntityId[]; reason: string; evidenceIds: string[];
}
export interface TranslationRecord {
  id: string; universeId: UniverseId; conceptId: string; locale: string; text: string; status: 'machine' | 'reviewed' | 'canonical';
  sourceLocale: string | null; sourceText: string | null; evidenceIds: string[];
}

export type ClaimObject = { kind: 'entity'; entityId: EntityId } | { kind: 'literal'; value: string | number | boolean | null; dataType: string };
export interface Uncertainty {
  confidence: number; lowerBound: number; upperBound: number; basis: 'explicit-source' | 'extraction' | 'inference' | 'editorial';
  reasons: string[];
}
export interface Claim {
  id: string; universeId: UniverseId; subjectEntityId: EntityId; predicate: string; object: ClaimObject;
  polarity: 'affirmative' | 'negative'; modality: 'asserted' | 'possible' | 'probable' | 'counterfactual' | 'unknown';
  validFrom: string | null; validTo: string | null; uncertainty: Uncertainty; evidenceIds: string[];
  status: 'staged' | 'validated' | 'accepted' | 'rejected' | 'superseded'; createdAtUtc: string;
}
export interface InferenceTrace {
  id: string; universeId: UniverseId; premiseClaimIds: string[]; ruleId: string; ruleVersion: string; conclusionClaimId: string;
  confidenceMethod: 'minimum' | 'product' | 'bayesian' | 'editorial'; createdAtUtc: string; status: 'proposed' | 'validated' | 'rejected';
}
export interface Evidence {
  id: string; universeId: UniverseId; sourceId: SourceId; documentId: string; chunkId: string | null;
  locator: { page?: number; sectionId?: string; startOffset?: number; endOffset?: number; timestampMs?: number };
  quote: string; quoteSha256: string; stance: 'supports' | 'contradicts' | 'context'; strength: 'direct' | 'indirect'; reliability: number;
  createdAtUtc: string;
}
export interface Fact {
  id: string; universeId: UniverseId; claimId: string; subjectEntityId: EntityId; predicate: string; object: ClaimObject;
  polarity: 'affirmative' | 'negative'; confidence: number; evidenceIds: string[]; validatedAtUtc: string; validator: string;
}
export interface ProvenanceRecord {
  id: string; universeId: UniverseId; operation: string; actorType: 'human' | 'system' | 'ai'; actorId: string;
  inputIds: string[]; outputIds: string[]; softwareVersion: string; modelVersion: string | null; promptVersion: string | null;
  parametersSha256: string; startedAtUtc: string; completedAtUtc: string; status: 'succeeded' | 'failed' | 'rolled-back';
}
export interface Citation {
  evidenceId: string; sourceId: SourceId; documentId: string; locatorText: string; quote: string; quoteSha256: string;
}
