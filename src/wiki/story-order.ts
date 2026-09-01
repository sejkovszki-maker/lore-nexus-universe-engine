import { wikiArticles } from '../data/wikiArticles.ts';
import type { WikiArticle } from '../types.ts';
import { articleUniverseId } from '../universe/article-universes.ts';

// Curated canonical reading path. Reference pages and full novel transcriptions
// stay searchable, but do not interrupt the main historical narrative.
export const canonicalStoryIds = [
  'kozmogonia',
  'sanctuary-origin',
  'prime-lesser-evils',
  'sin-war-lore',
  'lore-uldyssian',
  'lore-mendeln',
  'lore-tragoul',
  'mage-clan-wars',
  'dark-exile',
  'horadrim-order',
  'akarat-nahantu',
  'diablo-1-story',
  'diablo-1-hellfire',
  'diablo-2-story',
  'diablo-2-lod',
  'diablo-immortal',
  'diablo-3-story',
  'diablo-3-ros',
  'diablo-4-story',
  'diablo-4-voh',
  'neyrelle-tribute',
  'skovos',
  'diablo-4-loh',
] as const;

export function canonicalStory(): WikiArticle[] {
  return canonicalStoryIds.map(id => wikiArticles[id]).filter((article): article is WikiArticle => Boolean(article));
}

export interface StoryReadingChapter {
  article: WikiArticle;
  segmentId: string | null;
  segmentTitle: string | null;
}

interface BookSegment { id: string; title: string; after: string; prefixes: string[] }

export const storyBookSegments: readonly BookSegment[] = [
  { id: 'sin-war-birthright', title: 'A Bűn Háborúja I. – Születési jog', after: 'sin-war-lore', prefixes: ['sin-war-birthright-ch'] },
  { id: 'sin-war-scales', title: 'A Bűn Háborúja II. – A kígyó pikkelyei', after: 'sin-war-lore', prefixes: ['sin-war-scales-ch'] },
  { id: 'sin-war-prophet', title: 'A Bűn Háborúja III. – A fátyolos próféta', after: 'sin-war-lore', prefixes: ['sin-war-prophet-ch'] },
  { id: 'demonsbane', title: 'Démonok csapása', after: 'akarat-nahantu', prefixes: ['demonsbane-ch'] },
  { id: 'kingdom-of-shadow', title: 'Az árnyak királysága', after: 'diablo-1-story', prefixes: ['kingdom-of-shadow-ch'] },
  { id: 'black-road', title: 'A fekete út', after: 'diablo-2-story', prefixes: ['black-road-ch', 'black-road-epilogue'] },
] as const;

function numericChapterOrder(id: string): number {
  if (id.endsWith('epilogue')) return Number.MAX_SAFE_INTEGER;
  return Number(id.match(/-ch(\d+)$/)?.[1] ?? Number.MAX_SAFE_INTEGER - 1);
}

export function segmentArticles(segment: BookSegment): WikiArticle[] {
  return Object.values(wikiArticles)
    .filter((article): article is WikiArticle => Boolean(article) && segment.prefixes.some(prefix => article.id.startsWith(prefix)))
    .sort((left, right) => numericChapterOrder(left.id) - numericChapterOrder(right.id));
}

export interface StoryBook { id: string; title: string; after: string | null; chapters: WikiArticle[] }

export function storyBooks(universeId = 'diablo'): StoryBook[] {
  const imported = Object.values(wikiArticles).filter(article => articleUniverseId(article) === universeId && article.type === 'book').map(book => ({ id: book.id, title: book.title, after: book.storyAfter || null, chapters: Object.values(wikiArticles).filter(article => articleUniverseId(article) === universeId && article.type === 'chapter' && article.parentBook === book.id).sort((a, b) => numericChapterOrder(a.id) - numericChapterOrder(b.id)) }));
  if (universeId === 'diablo') return [...storyBookSegments.map(segment => ({ id: segment.id, title: segment.title, after: segment.after, chapters: segmentArticles(segment) })).filter(book => book.chapters.length), ...imported];
  return imported;
}

export function storyReadingPath(includeBooks = true, universeId = 'diablo'): StoryReadingChapter[] {
  if (universeId !== 'diablo') {
    const articles = Object.values(wikiArticles).filter(article => articleUniverseId(article) === universeId && article.type !== 'book' && article.type !== 'chapter').sort((a, b) => (a.lastEdited || 0) - (b.lastEdited || 0) || a.title.localeCompare(b.title, 'hu'));
    const path: StoryReadingChapter[] = [];
    const books = storyBooks(universeId);
    for (const article of articles) {
      path.push({ article, segmentId: null, segmentTitle: null });
      if (includeBooks) for (const book of books.filter(item => item.after === article.id)) path.push(...book.chapters.map(chapter => ({ article: chapter, segmentId: book.id, segmentTitle: book.title })));
    }
    if (includeBooks) for (const book of books.filter(item => !item.after || !articles.some(article => article.id === item.after))) path.push(...book.chapters.map(chapter => ({ article: chapter, segmentId: book.id, segmentTitle: book.title })));
    return path;
  }
  const path: StoryReadingChapter[] = [];
  for (const article of canonicalStory()) {
    path.push({ article, segmentId: null, segmentTitle: null });
    if (!includeBooks) continue;
    for (const segment of storyBookSegments.filter(item => item.after === article.id)) {
      path.push(...segmentArticles(segment).map(bookArticle => ({ article: bookArticle, segmentId: segment.id, segmentTitle: segment.title })));
    }
  }
  return path;
}
