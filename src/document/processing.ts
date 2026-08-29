export interface ProcessedPage { pageNumber: number; text: string; confidence?: number; method: 'native' | 'ocr' | 'transcript'; }
export interface ProcessingResult { processorId: string; processorVersion: string; pages: ProcessedPage[]; metadata: Record<string, unknown>; }
export interface DocumentProcessor { supports(mediaType: string): boolean; process(bytes: Uint8Array, signal?: AbortSignal): Promise<ProcessingResult>; }
export interface OcrProvider { id: string; version: string; recognize(image: Uint8Array, signal?: AbortSignal): Promise<{ text: string; confidence: number }>; }
export interface PageRenderer { renderPage(document: Uint8Array, pageNumber: number, signal?: AbortSignal): Promise<Uint8Array>; }

export class OcrFallbackPipeline {
  readonly renderer: PageRenderer; readonly ocr: OcrProvider; readonly minimumNativeCharacters: number;
  constructor(renderer: PageRenderer, ocr: OcrProvider, minimumNativeCharacters = 20) { this.renderer = renderer; this.ocr = ocr; this.minimumNativeCharacters = minimumNativeCharacters; }
  async enrich(document: Uint8Array, pages: ProcessedPage[], signal?: AbortSignal): Promise<ProcessedPage[]> {
    const enriched: ProcessedPage[] = [];
    for (const page of pages) {
      if (page.text.trim().length >= this.minimumNativeCharacters) { enriched.push(page); continue; }
      const image = await this.renderer.renderPage(document, page.pageNumber, signal);
      const recognized = await this.ocr.recognize(image, signal);
      enriched.push({ pageNumber: page.pageNumber, text: recognized.text, confidence: recognized.confidence, method: 'ocr' });
    }
    return enriched;
  }
}

export interface MultimediaDescriptor { mediaType: string; durationMs?: number; width?: number; height?: number; channels?: number; sampleRate?: number; }
export interface MultimediaProcessor extends DocumentProcessor { inspect(bytes: Uint8Array): Promise<MultimediaDescriptor>; }
