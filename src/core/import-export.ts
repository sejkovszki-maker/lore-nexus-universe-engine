import type { SourceId, UniverseContext } from './contracts';

export interface ImportCandidate {
  mediaType: string;
  originalName: string;
  bytes: Uint8Array;
  metadata?: Record<string, string>;
}

export interface ImportReceipt {
  sourceId: SourceId;
  fingerprint: string;
  status: 'imported' | 'duplicate' | 'rejected';
  validationMessages: string[];
}

export interface ImportPlugin {
  readonly id: string;
  supports(candidate: Pick<ImportCandidate, 'mediaType' | 'originalName'>): boolean;
  import(candidate: ImportCandidate, context: UniverseContext): Promise<ImportReceipt>;
}

export interface ExportRequest {
  format: 'json' | 'jsonld' | 'markdown' | 'csv';
  universe: UniverseContext;
  entityIds?: string[];
  includeEvidence: boolean;
  includeProvenance: boolean;
}

export interface ExportArtifact {
  mediaType: string;
  fileName: string;
  bytes: Uint8Array;
  sha256: string;
}

export interface ExportService {
  export(request: ExportRequest): Promise<ExportArtifact>;
}
