export type TimelineDateStatus = 'exact' | 'approximate' | 'relative' | 'unknown';
export type TimelineCanonStatus = 'canon' | 'canon_with_uncertainty' | 'legacy' | 'retconned' | 'disputed';
export type TimelineSourcePriority = 'primary_blizzard' | 'primary_game' | 'primary_book' | 'secondary_reference' | 'legacy_reference';

export interface TimelineEra {
  id: string;
  name: string;
  order: number;
}

export interface TimelineSource {
  label: string;
  url?: string;
  kind: TimelineSourcePriority | 'editorial_audit';
}

export interface TimelineEvent {
  id: string;
  universeId: 'diablo';
  eraId: string;
  eraName: string;
  eraOrder: number;
  eventOrder: number;
  title: string;
  summary: string;
  dateDisplay: string;
  dateSortKey?: number;
  dateStatus: TimelineDateStatus;
  canonStatus: TimelineCanonStatus;
  sourcePriority: TimelineSourcePriority;
  retconned: boolean;
  characters: string[];
  locations: string[];
  factions: string[];
  items: string[];
  games: string[];
  books: string[];
  relatedEvents: string[];
  previousEventId?: string;
  nextEventId?: string;
  articleId?: string;
  sources: TimelineSource[];
  needsSourceAudit: boolean;
  spoilerLevel: 0 | 1 | 2;
}

export function sortTimelineEvents(events: readonly TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => a.eraOrder - b.eraOrder || a.eventOrder - b.eventOrder || (a.dateSortKey ?? 0) - (b.dateSortKey ?? 0) || a.id.localeCompare(b.id));
}
