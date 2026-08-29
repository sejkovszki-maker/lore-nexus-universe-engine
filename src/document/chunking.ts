export interface TextChunk { ordinal: number; text: string; startOffset: number; endOffset: number; tokenEstimate: number; }

export function chunkText(text: string, maximumCharacters = 4000, overlapCharacters = 400): TextChunk[] {
  if (!Number.isInteger(maximumCharacters) || maximumCharacters < 100) throw new Error('maximumCharacters must be an integer >= 100');
  if (!Number.isInteger(overlapCharacters) || overlapCharacters < 0 || overlapCharacters >= maximumCharacters) throw new Error('Invalid chunk overlap');
  const chunks: TextChunk[] = []; let start = 0;
  while (start < text.length) {
    let end = Math.min(text.length, start + maximumCharacters);
    if (end < text.length) {
      const boundary = Math.max(text.lastIndexOf('\n\n', end), text.lastIndexOf('. ', end));
      if (boundary > start + Math.floor(maximumCharacters * 0.5)) end = boundary + (text[boundary] === '.' ? 1 : 0);
    }
    const content = text.slice(start, end).trim();
    if (content) chunks.push({ ordinal: chunks.length, text: content, startOffset: start, endOffset: end, tokenEstimate: Math.ceil(content.length / 4) });
    if (end >= text.length) break;
    start = Math.max(start + 1, end - overlapCharacters);
  }
  return chunks;
}
