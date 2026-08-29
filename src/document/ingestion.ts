import { chunkText } from './chunking.ts';
import { validateFile, type FileCandidate } from './file-validation.ts';
import { detectStructure } from './structure.ts';
import type { DocumentProcessor, ProcessingResult } from './processing.ts';

export interface IngestionOutput { validation: ReturnType<typeof validateFile>; processing: ProcessingResult; text: string; sections: ReturnType<typeof detectStructure>; chunks: ReturnType<typeof chunkText>; }

export class UniversalDocumentIngestion {
  readonly processors: DocumentProcessor[];
  constructor(processors: DocumentProcessor[]) { this.processors = processors; }
  async ingest(candidate: FileCandidate, signal?: AbortSignal): Promise<IngestionOutput> {
    const validation = validateFile(candidate);
    if (!validation.valid) throw new Error(`File validation failed: ${validation.errors.join(',')}`);
    const processor = this.processors.find((item) => item.supports(validation.detectedMediaType));
    if (!processor) throw new Error(`No sandboxed processor for ${validation.detectedMediaType}`);
    const processing = await processor.process(candidate.bytes, signal);
    const text = processing.pages.map((page) => page.text).join('\n\n');
    return { validation, processing, text, sections: detectStructure(text), chunks: chunkText(text) };
  }
}
