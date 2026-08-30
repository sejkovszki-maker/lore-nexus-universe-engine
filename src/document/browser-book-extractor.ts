import { validateFile } from './file-validation.ts';

export interface ExtractedBook {
  fileName: string;
  mediaType: string;
  text: string;
  pageCount: number | null;
  characterCount: number;
  wordCount: number;
  warnings: string[];
}

function cleanExtractedText(value: string): string {
  return value.replace(/\r\n?/g, '\n').replace(/[ \t]+\n/g, '\n').replace(/\n{4,}/g, '\n\n\n').trim();
}

function htmlToText(source: string): string {
  const document = new DOMParser().parseFromString(source, 'text/html');
  document.querySelectorAll('script, style, noscript').forEach((node) => node.remove());
  return document.body.textContent ?? '';
}

async function extractPdf(bytes: Uint8Array): Promise<{ text: string; pageCount: number }> {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
  GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;
  const loadingTask = getDocument({ data: bytes.slice() });
  const pdf = await loadingTask.promise;
  const pages: string[] = [];
  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' ').replace(/\s+/g, ' ').trim());
      page.cleanup();
    }
  } finally {
    await loadingTask.destroy();
  }
  return { text: pages.join('\n\n'), pageCount: pdf.numPages };
}

export async function extractBookFile(file: File): Promise<ExtractedBook> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const validation = validateFile({ originalName: file.name, declaredMediaType: file.type || undefined, bytes });
  if (!validation.valid) throw new Error(`Nem támogatott dokumentum: ${validation.errors.join(', ')}`);
  const extractableTypes = new Set(['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown', 'text/html']);
  if (!extractableTypes.has(validation.detectedMediaType)) throw new Error(`Ebből a fájltípusból nem nyerhető ki könyvszöveg: ${validation.detectedMediaType}`);

  let text = '';
  let pageCount: number | null = null;
  if (validation.detectedMediaType === 'application/pdf') {
    const result = await extractPdf(bytes);
    text = result.text;
    pageCount = result.pageCount;
  } else if (validation.detectedMediaType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const mammoth = await import('mammoth/mammoth.browser');
    const result = await mammoth.extractRawText({ arrayBuffer: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) });
    text = result.value;
    if (result.messages.length) validation.warnings.push(`A DOCX feldolgozó ${result.messages.length} szerkezeti figyelmeztetést jelzett.`);
  } else {
    const decoded = new TextDecoder('utf-8').decode(bytes);
    text = validation.detectedMediaType === 'text/html' ? htmlToText(decoded) : decoded;
  }

  text = cleanExtractedText(text);
  const warnings = [...validation.warnings];
  if (validation.detectedMediaType === 'application/pdf' && text.length < Math.max(80, (pageCount ?? 1) * 20)) {
    warnings.push('A PDF valószínűleg beszkennelt képekből áll; automatikus OCR szükséges hozzá.');
  }
  if (!text) throw new Error('A dokumentumból nem sikerült olvasható szöveget kinyerni.');
  return { fileName: file.name, mediaType: validation.detectedMediaType, text, pageCount, characterCount: text.length, wordCount: text.split(/\s+/u).filter(Boolean).length, warnings };
}
