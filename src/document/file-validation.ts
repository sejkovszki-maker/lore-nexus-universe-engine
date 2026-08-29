export interface FileCandidate { originalName: string; declaredMediaType?: string; bytes: Uint8Array; }
export interface FileValidationResult { valid: boolean; detectedMediaType: string; errors: string[]; warnings: string[]; }

const extensionTypes = new Map([
  ['txt', 'text/plain'], ['md', 'text/markdown'], ['html', 'text/html'], ['htm', 'text/html'],
  ['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ['opf', 'application/oebps-package+xml'], ['pdf', 'application/pdf'], ['epub', 'application/epub+zip'],
  ['png', 'image/png'], ['jpg', 'image/jpeg'], ['jpeg', 'image/jpeg'], ['webp', 'image/webp'],
  ['mp3', 'audio/mpeg'], ['wav', 'audio/wav'], ['mp4', 'video/mp4'], ['webm', 'video/webm'],
]);

function begins(bytes: Uint8Array, signature: number[]): boolean { return signature.every((value, index) => bytes[index] === value); }
function extension(name: string): string { return name.includes('.') ? name.split('.').at(-1)!.toLowerCase() : ''; }

export function detectMediaType(candidate: FileCandidate): string {
  const bytes = candidate.bytes;
  if (begins(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) return 'application/pdf';
  if (begins(bytes, [0x89, 0x50, 0x4e, 0x47])) return 'image/png';
  if (begins(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (begins(bytes, [0x52, 0x49, 0x46, 0x46]) && new TextDecoder('ascii').decode(bytes.slice(8, 12)) === 'WAVE') return 'audio/wav';
  if (begins(bytes, [0x49, 0x44, 0x33]) || begins(bytes, [0xff, 0xfb])) return 'audio/mpeg';
  if (bytes.length > 12 && new TextDecoder('ascii').decode(bytes.slice(4, 8)) === 'ftyp') return 'video/mp4';
  if (begins(bytes, [0x50, 0x4b, 0x03, 0x04]) && extension(candidate.originalName) === 'epub') return 'application/epub+zip';
  if (begins(bytes, [0x50, 0x4b, 0x03, 0x04]) && extension(candidate.originalName) === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  return extensionTypes.get(extension(candidate.originalName)) ?? candidate.declaredMediaType ?? 'application/octet-stream';
}

export function validateFile(candidate: FileCandidate, maxBytes = 100 * 1024 * 1024): FileValidationResult {
  const errors: string[] = []; const warnings: string[] = [];
  if (!candidate.originalName || /[\u0000-\u001f]/.test(candidate.originalName)) errors.push('INVALID_FILE_NAME');
  if (candidate.bytes.length === 0) errors.push('EMPTY_FILE');
  if (candidate.bytes.length > maxBytes) errors.push('FILE_TOO_LARGE');
  const detectedMediaType = detectMediaType(candidate);
  if (detectedMediaType === 'application/octet-stream') errors.push('UNSUPPORTED_MEDIA_TYPE');
  if (candidate.declaredMediaType && candidate.declaredMediaType !== detectedMediaType) warnings.push('DECLARED_MEDIA_TYPE_MISMATCH');
  if (detectedMediaType.startsWith('text/') || detectedMediaType.includes('xml')) {
    try { new TextDecoder('utf-8', { fatal: true }).decode(candidate.bytes); } catch { errors.push('INVALID_UTF8'); }
  }
  return { valid: errors.length === 0, detectedMediaType, errors, warnings };
}
