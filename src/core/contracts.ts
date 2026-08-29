export type UniverseId = string & { readonly __brand: 'UniverseId' };
export type EntityId = string & { readonly __brand: 'EntityId' };
export type SourceId = string & { readonly __brand: 'SourceId' };
export type DocumentId = string & { readonly __brand: 'DocumentId' };

export interface UniverseContext {
  universeId: UniverseId;
  locale: string;
  canonBranchId: string;
  correlationId: string;
}

export interface Command<TPayload = unknown> {
  type: string;
  context: UniverseContext;
  payload: TPayload;
  requestedAtUtc: string;
}

export interface Query<TParameters = unknown> {
  type: string;
  context: UniverseContext;
  parameters: TParameters;
}

export interface Result<T> {
  ok: boolean;
  value?: T;
  error?: { code: string; message: string; retryable: boolean };
}

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}
