import type { UniverseId } from '../core/contracts';
import { validateTemporalPoint, type HistoricalState, type KnowledgeEvent, type Relationship, type TemporalFactProjection, type TemporalInterval, type TemporalPoint } from '../domain/temporal.ts';

function earliest(point: TemporalPoint): number { return Date.parse(point.earliest ?? point.asserted ?? point.latest!); }
function latest(point: TemporalPoint): number { return Date.parse(point.latest ?? point.asserted ?? point.earliest!); }

export class TemporalKnowledgeGraph {
  readonly #entities = new Map<string, UniverseId>(); readonly #relationships = new Map<string, Relationship>(); readonly #events = new Map<string, KnowledgeEvent>(); readonly #facts = new Map<string, TemporalFactProjection>();
  addEntity(id: string, universeId: UniverseId): void { if (this.#entities.has(id)) throw new Error(`Duplicate temporal entity: ${id}`); this.#entities.set(id, universeId); }
  addRelationship(relationship: Relationship): void {
    if (this.#relationships.has(relationship.id)) throw new Error(`Duplicate relationship: ${relationship.id}`); this.#requireEntity(relationship.sourceEntityId, relationship.universeId); this.#requireEntity(relationship.targetEntityId, relationship.universeId);
    if (relationship.sourceEntityId === relationship.targetEntityId && relationship.typeId !== 'self-reference') throw new Error('Relationship self-reference is forbidden');
    if (relationship.validity.start) validateTemporalPoint(relationship.validity.start); if (relationship.validity.end) validateTemporalPoint(relationship.validity.end);
    if (relationship.validity.start && relationship.validity.end && earliest(relationship.validity.start) > latest(relationship.validity.end)) throw new Error('Relationship interval is inverted');
    this.#relationships.set(relationship.id, structuredClone(relationship));
  }
  addEvent(event: KnowledgeEvent): void {
    if (this.#events.has(event.id)) throw new Error(`Duplicate event: ${event.id}`); validateTemporalPoint(event.time);
    for (const participant of event.participants) { this.#requireEntity(participant.entityId, event.universeId); if (participant.certainty < 0 || participant.certainty > 1) throw new Error('Participant certainty must be within [0,1]'); }
    for (const location of event.locationEntityIds) this.#requireEntity(location, event.universeId);
    if (event.parentEventId && !this.#events.has(event.parentEventId)) throw new Error(`Parent event missing: ${event.parentEventId}`); this.#events.set(event.id, structuredClone(event));
  }
  addFact(fact: TemporalFactProjection): void {
    if (this.#facts.has(fact.factId)) throw new Error(`Duplicate temporal fact: ${fact.factId}`); this.#requireEntity(fact.subjectEntityId, fact.universeId); if (fact.objectEntityId) this.#requireEntity(fact.objectEntityId, fact.universeId); this.#validateInterval(fact.validity); this.#facts.set(fact.factId, structuredClone(fact));
  }
  timeline(universeId: UniverseId, from?: string, to?: string): KnowledgeEvent[] {
    const fromMs = from ? Date.parse(from) : Number.NEGATIVE_INFINITY; const toMs = to ? Date.parse(to) : Number.POSITIVE_INFINITY;
    return [...this.#events.values()].filter((event) => event.universeId === universeId && latest(event.time) >= fromMs && earliest(event.time) <= toMs).sort((a, b) => earliest(a.time) - earliest(b.time) || a.id.localeCompare(b.id)).map((event) => structuredClone(event));
  }
  historicalState(universeId: UniverseId, at: string): HistoricalState {
    const instant = Date.parse(at); if (Number.isNaN(instant)) throw new Error('Historical state requires a valid date'); const relationships = [];
    for (const relationship of this.#relationships.values()) {
      if (relationship.universeId !== universeId || relationship.status !== 'accepted') continue; const start = relationship.validity.start; const end = relationship.validity.end;
      const possiblyStarted = !start || earliest(start) <= instant; const definitelyStarted = !start || latest(start) <= instant; const possiblyNotEnded = !end || latest(end) > instant; const definitelyNotEnded = !end || earliest(end) > instant;
      if (possiblyStarted && possiblyNotEnded) relationships.push({ relationship: structuredClone(relationship), certainty: definitelyStarted && definitelyNotEnded ? 'definite' as const : 'possible' as const });
    }
    const facts = [...this.#facts.values()].filter((fact) => fact.universeId === universeId).map((fact) => ({ fact, certainty: this.#intervalState(fact.validity, instant) })).filter((item): item is { fact: TemporalFactProjection; certainty: 'definite' | 'possible' } => item.certainty !== null).map((item) => ({ fact: structuredClone(item.fact), certainty: item.certainty }));
    const occurredEvents = [...this.#events.values()].filter((event) => event.universeId === universeId && event.status === 'accepted' && latest(event.time) <= instant).sort((a, b) => latest(a.time) - latest(b.time)).map((event) => structuredClone(event));
    return { universeId, at: new Date(instant).toISOString(), relationships, facts, occurredEvents };
  }
  #validateInterval(interval: TemporalInterval): void { if (interval.start) validateTemporalPoint(interval.start); if (interval.end) validateTemporalPoint(interval.end); if (interval.start && interval.end && earliest(interval.start) > latest(interval.end)) throw new Error('Temporal interval is inverted'); }
  #intervalState(interval: TemporalInterval, instant: number): 'definite' | 'possible' | null { const start = interval.start; const end = interval.end; const possiblyStarted = !start || earliest(start) <= instant; const definitelyStarted = !start || latest(start) <= instant; const possiblyNotEnded = !end || latest(end) > instant; const definitelyNotEnded = !end || earliest(end) > instant; return possiblyStarted && possiblyNotEnded ? (definitelyStarted && definitelyNotEnded ? 'definite' : 'possible') : null; }
  #requireEntity(id: string, universeId: UniverseId): void { const actual = this.#entities.get(id); if (!actual) throw new Error(`Relationship/event entity missing: ${id}`); if (actual !== universeId) throw new Error(`Cross-universe temporal reference: ${id}`); }
}
