import type { WikiArticle } from '../types.ts';

export interface BookSearchResult {
  chapterId: string;
  chapterTitle: string;
  snippet: string;
  occurrenceCount: number;
}

const plainText = (html: string) => html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, ' ')
  .replace(/<[^>]+>/gu, ' ')
  .replace(/&nbsp;|&#160;/giu, ' ')
  .replace(/&amp;/giu, '&')
  .replace(/&lt;/giu, '<')
  .replace(/&gt;/giu, '>')
  .replace(/&quot;/giu, '"')
  .replace(/&#39;|&apos;/giu, "'")
  .replace(/\s+/gu, ' ')
  .trim();

const searchable = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('hu-HU');

export function searchBookChapters(chapters: WikiArticle[], rawQuery: string, limit = 50): BookSearchResult[] {
  const query = searchable(rawQuery.trim());
  if (query.length < 2) return [];
  const results: BookSearchResult[] = [];
  for (const chapter of chapters) {
    const text = plainText(chapter.content);
    const normalized = searchable(text);
    let cursor = 0; let count = 0; let first = -1;
    while ((cursor = normalized.indexOf(query, cursor)) >= 0) {
      if (first < 0) first = cursor;
      count += 1; cursor += Math.max(1, query.length);
    }
    if (!count) continue;
    const start = Math.max(0, first - 90); const end = Math.min(text.length, first + rawQuery.trim().length + 130);
    results.push({ chapterId: chapter.id, chapterTitle: chapter.title, snippet: `${start ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`, occurrenceCount: count });
    if (results.length >= limit) break;
  }
  return results;
}
