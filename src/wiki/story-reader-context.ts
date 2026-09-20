import type { StoryReadingChapter } from './story-order.ts';
import type { WikiArticle } from '../types.ts';

const toPlainText = (html: string) => html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, ' ')
  .replace(/<[^>]+>/gu, ' ')
  .replace(/\[\[[^|\]]+\|([^|\]]+)(?:\|[^\]]+)?\]\]/gu, '$1')
  .replace(/&nbsp;|&#160;/giu, ' ')
  .replace(/&amp;/giu, '&')
  .replace(/&quot;/giu, '"')
  .replace(/&#39;|&apos;/giu, "'")
  .replace(/\s+/gu, ' ')
  .replace(/\s+([.,!?;:])/gu, '$1')
  .trim();

export function conciseText(html: string, maximum = 420): string {
  const text = toPlainText(html);
  if (text.length <= maximum) return text;
  const clipped = text.slice(0, maximum + 1);
  const boundary = Math.max(clipped.lastIndexOf('. '), clipped.lastIndexOf('! '), clipped.lastIndexOf('? '));
  return `${clipped.slice(0, boundary > maximum * .55 ? boundary + 1 : maximum).trim()}…`;
}

export function segmentIntroduction(path: StoryReadingChapter[], index: number, articles: Record<string, WikiArticle>) {
  const current = path[index];
  if (!current?.segmentId || path[index - 1]?.segmentId === current.segmentId) return null;
  const book = articles[current.segmentId];
  const precedingMain = path.slice(0, index).reverse().find(item => !item.segmentId)?.article;
  const anchor = book?.storyAfter && articles[book.storyAfter] ? articles[book.storyAfter] : precedingMain;
  return {
    segmentId: current.segmentId,
    title: current.segmentTitle ?? book?.title ?? 'Könyvszakasz',
    explanation: anchor
      ? `Ez a könyv ${anchor.title} eseményei után illeszkedik a történeti sorrendbe.`
      : 'Ez a könyv ezen a ponton kapcsolódik a történeti szálhoz.',
    summary: conciseText(book?.content ?? '', 420),
  };
}

export function storyRecap(path: StoryReadingChapter[], index: number, maximum = 4) {
  return path.slice(Math.max(0, index - maximum), index).map(item => ({
    id: item.article.id,
    title: item.article.title,
    kind: item.segmentId ? 'Könyv' : 'Fő történet',
    summary: conciseText(item.article.subtitle || item.article.content, 180),
  }));
}
