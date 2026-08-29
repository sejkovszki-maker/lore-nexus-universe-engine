import type { DocumentId, SourceId, UniverseId } from '../core/contracts';

export interface Source {
  id: SourceId;
  universeId: UniverseId;
  logicalSourceId: string;
  version: number;
  previousVersionSourceId: SourceId | null;
  fingerprint: { algorithm: 'sha256'; value: string };
  originalName: string;
  mediaType: string;
  byteLength: number;
  objectPath: string;
  importedAtUtc: string;
  authority?: { tier: string; score: number };
  metadata: Record<string, string | number | boolean | null>;
}

export interface Document {
  id: DocumentId;
  universeId: UniverseId;
  sourceId: SourceId;
  schemaVersion: 1;
  title: string;
  language: string | null;
  mediaType: string;
  processingStatus: 'staged' | 'validated' | 'processed' | 'rejected';
  processorId: string;
  processorVersion: string;
  createdAtUtc: string;
  textLength: number;
  pageCount?: number;
  durationMs?: number;
}

export interface Section {
  id: string;
  documentId: DocumentId;
  parentSectionId: string | null;
  ordinal: number;
  level: number;
  heading: string | null;
  startOffset: number;
  endOffset: number;
}

export interface Chunk {
  id: string;
  documentId: DocumentId;
  sectionId: string | null;
  ordinal: number;
  text: string;
  startOffset: number;
  endOffset: number;
  tokenEstimate: number;
  fingerprint: string;
}

export type LineageNodeKind = 'raw-object' | 'source' | 'document' | 'section' | 'chunk' | 'ocr-output' | 'transcript';
export interface LineageEdge {
  id: string;
  universeId: UniverseId;
  from: { kind: LineageNodeKind; id: string };
  to: { kind: LineageNodeKind; id: string };
  operation: string;
  processorId: string;
  processorVersion: string;
  createdAtUtc: string;
  parametersSha256: string;
}
