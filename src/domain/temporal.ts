import type { EntityId, UniverseId } from '../core/contracts';

export interface TemporalPoint {
  asserted: string | null;
  earliest: string | null;
  latest: string | null;
  precision: 'instant' | 'day' | 'month' | 'year' | 'era' | 'approximate' | 'unknown';
  confidence: number;
  calendar: string;
  sourceText?: string;
}
export interface TemporalInterval { start: TemporalPoint | null; end: TemporalPoint | null; }

export interface Relationship {
  id: string; universeId: UniverseId; typeId: string; sourceEntityId: EntityId; targetEntityId: EntityId;
  direction: 'directed' | 'symmetric'; status: 'staged' | 'validated' | 'accepted' | 'rejected';
  validity: TemporalInterval; attributes: Record<string, unknown>; claimIds: string[]; evidenceIds: string[]; createdAtUtc: string;
}
export interface EventParticipant { entityId: EntityId; role: string; certainty: number; }
export interface KnowledgeEvent {
  id: string; universeId: UniverseId; typeId: string; names: Record<string, string>; time: TemporalPoint;
  locationEntityIds: EntityId[]; participants: EventParticipant[]; parentEventId: string | null;
  status: 'staged' | 'validated' | 'accepted' | 'rejected'; claimIds: string[]; evidenceIds: string[]; attributes: Record<string, unknown>;
}
export interface TemporalFactProjection { factId: string; universeId: UniverseId; subjectEntityId: EntityId; objectEntityId: EntityId | null; validity: TemporalInterval; }
export interface HistoricalRelationship { relationship: Relationship; certainty: 'definite' | 'possible'; }
export interface HistoricalFact { fact: TemporalFactProjection; certainty: 'definite' | 'possible'; }
export interface HistoricalState { universeId: UniverseId; at: string; relationships: HistoricalRelationship[]; facts: HistoricalFact[]; occurredEvents: KnowledgeEvent[]; }

export function validateTemporalPoint(point: TemporalPoint): void {
  if (point.confidence < 0 || point.confidence > 1) throw new Error('Temporal confidence must be within [0,1]');
  const values = [point.earliest, point.asserted, point.latest].filter((value): value is string => value !== null).map((value) => Date.parse(value));
  if (values.some(Number.isNaN)) throw new Error('Temporal values must be ISO-compatible dates');
  if (point.earliest && point.latest && Date.parse(point.earliest) > Date.parse(point.latest)) throw new Error('Temporal earliest exceeds latest');
  if (point.asserted && point.earliest && Date.parse(point.asserted) < Date.parse(point.earliest)) throw new Error('Temporal asserted precedes earliest');
  if (point.asserted && point.latest && Date.parse(point.asserted) > Date.parse(point.latest)) throw new Error('Temporal asserted exceeds latest');
  if (point.precision === 'unknown' && values.length > 0) throw new Error('Unknown temporal point cannot assert dates');
  if (point.precision !== 'unknown' && values.length === 0) throw new Error('Known temporal point requires at least one bound');
}
