export interface DetectedSection { ordinal: number; level: number; heading: string | null; startOffset: number; endOffset: number; }

const headingPatterns = [
  /^(#{1,6})\s+(.+)$/,
  /^((?:chapter|fejezet|prológus|epilógus)\b.*)$/iu,
  /^([IVXLCDM]+\.?\s+(?:fejezet|chapter)?\s*.*)$/iu,
];

export function detectStructure(text: string): DetectedSection[] {
  const lines = text.split(/\r?\n/); const headings: Array<{ offset: number; level: number; heading: string }> = [];
  let offset = 0;
  for (const line of lines) {
    const trimmed = line.trim(); let match: RegExpMatchArray | null = null; let level = 1;
    if ((match = trimmed.match(headingPatterns[0]))) { level = match[1].length; headings.push({ offset, level, heading: match[2].trim() }); }
    else if ((match = trimmed.match(headingPatterns[1]))) headings.push({ offset, level: 1, heading: match[1].trim() });
    else if ((match = trimmed.match(headingPatterns[2]))) headings.push({ offset, level: 1, heading: match[1].trim() });
    offset += line.length + 1;
  }
  if (headings.length === 0) return [{ ordinal: 0, level: 1, heading: null, startOffset: 0, endOffset: text.length }];
  return headings.map((heading, ordinal) => ({ ordinal, level: heading.level, heading: heading.heading, startOffset: heading.offset, endOffset: headings[ordinal + 1]?.offset ?? text.length }));
}
