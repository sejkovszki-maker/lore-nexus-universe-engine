import type { Article } from '../db/database.ts';
import { loadBookProgress, type BookReadingProgress } from './book-progress.ts';

export interface ContinueReadingItem {
  kind: 'book' | 'story';
  title: string;
  detail: string;
  updatedAt: number;
  bookId?: string;
  chapterId?: string;
  articleId?: string;
}

export function latestReadingItem(universeId: string, articles: Record<string, Article>, storage: Storage = localStorage): ContinueReadingItem | undefined {
  const books = Object.values(loadBookProgress(storage)).filter(item => item.universeId === universeId && articles[item.bookId] && articles[item.chapterId]);
  const latestBook = books.sort((a, b) => b.updatedAt - a.updatedAt)[0] as BookReadingProgress | undefined;
  let story: { articleId: string; updatedAt: number } | undefined;
  try {
    const parsed = JSON.parse(storage.getItem(`lore-nexus:story-progress:v1:${universeId}`) || 'null') as unknown;
    if (parsed && typeof parsed === 'object') {
      const value = parsed as { articleId?: unknown; updatedAt?: unknown };
      if (typeof value.articleId === 'string' && articles[value.articleId] && typeof value.updatedAt === 'number' && Number.isFinite(value.updatedAt) && value.updatedAt >= 0) story = { articleId: value.articleId, updatedAt: value.updatedAt };
    }
  } catch { /* A sérült helyi adatot biztonságosan figyelmen kívül hagyjuk. */ }
  if (story && (!latestBook || story.updatedAt > latestBook.updatedAt)) return { kind: 'story', title: articles[story.articleId].title, detail: 'Folyamatos történet', updatedAt: story.updatedAt, articleId: story.articleId };
  if (latestBook) return { kind: 'book', title: articles[latestBook.bookId].title, detail: articles[latestBook.chapterId].title, updatedAt: latestBook.updatedAt, bookId: latestBook.bookId, chapterId: latestBook.chapterId };
  return undefined;
}
