import { wikiArticles } from '../data/wikiArticles.ts';
import type { WikiArticle } from '../types.ts';

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
  { id: 'sin-war-scales', title: 'A Bűn Háborúja II. – A kígyó mérlegei', after: 'sin-war-lore', prefixes: ['sin-war-scales-ch'] },
  { id: 'sin-war-prophet', title: 'A Bűn Háborúja III. – A fátyolos próféta', after: 'sin-war-lore', prefixes: ['sin-war-prophet-ch'] },
  { id: 'demonsbane', title: 'Démonok csapása', after: 'akarat-nahantu', prefixes: ['demonsbane-ch'] },
  { id: 'kingdom-of-shadow', title: 'Az árnyak királysága', after: 'diablo-1-story', prefixes: ['kingdom-of-shadow-ch'] },
  { id: 'black-road', title: 'A fekete út', after: 'diablo-2-story', prefixes: ['black-road-ch', 'black-road-epilogue'] },
] as const;

function numericChapterOrder(id: string): number {
  if (id.endsWith('epilogue')) return Number.MAX_SAFE_INTEGER;
  return Number(id.match(/-ch(\d+)$/)?.[1] ?? Number.MAX_SAFE_INTEGER - 1);
}

function segmentArticles(segment: BookSegment): WikiArticle[] {
  return Object.values(wikiArticles)
    .filter((article): article is WikiArticle => Boolean(article) && segment.prefixes.some(prefix => article.id.startsWith(prefix)))
    .sort((left, right) => numericChapterOrder(left.id) - numericChapterOrder(right.id));
}

let cachedExpandedPath: StoryReadingChapter[] | null = null;
let cachedMainPath: StoryReadingChapter[] | null = null;

export function storyReadingPath(includeBooks = true): StoryReadingChapter[] {
  const cached = includeBooks ? cachedExpandedPath : cachedMainPath;
  if (cached) return cached;
  const path: StoryReadingChapter[] = [];
  for (const article of canonicalStory()) {
    path.push({ article, segmentId: null, segmentTitle: null });
    if (!includeBooks) continue;
    for (const segment of storyBookSegments.filter(item => item.after === article.id)) {
      path.push(...segmentArticles(segment).map(bookArticle => ({ article: bookArticle, segmentId: segment.id, segmentTitle: segment.title })));
    }
  }
  if (includeBooks) cachedExpandedPath = path;
  else cachedMainPath = path;
  return path;
}
