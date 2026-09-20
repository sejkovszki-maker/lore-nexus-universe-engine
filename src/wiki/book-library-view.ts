import type { BookReadingProgress } from './book-progress.ts';

export type LibraryStatusFilter = 'all' | 'unread' | 'reading' | 'paused' | 'completed';
export type LibrarySort = 'chronology' | 'recent' | 'title';

export interface LibraryBookLike { id: string; title: string; chapters: Array<{ id: string }> }

export function chapterCompletion(book: LibraryBookLike, progress?: BookReadingProgress) {
  if (!progress || book.chapters.length === 0) return 0;
  if (progress.status === 'completed') return 100;
  const index = book.chapters.findIndex(chapter => chapter.id === progress.chapterId);
  return index < 0 ? 0 : Math.max(1, Math.min(99, Math.round(((index + 1) / book.chapters.length) * 100)));
}

export function filterAndSortBooks<T extends LibraryBookLike>(books: T[], progress: Record<string, BookReadingProgress>, universeId: string, query: string, filter: LibraryStatusFilter, sort: LibrarySort) {
  const normalized = query.trim().toLocaleLowerCase('hu-HU');
  const result = books.filter(book => {
    const saved = progress[`${universeId}:${book.id}`];
    const status = saved?.status ?? (saved ? 'reading' : 'unread');
    return (!normalized || book.title.toLocaleLowerCase('hu-HU').includes(normalized)) && (filter === 'all' || status === filter);
  });
  if (sort === 'recent') result.sort((a, b) => (progress[`${universeId}:${b.id}`]?.updatedAt ?? 0) - (progress[`${universeId}:${a.id}`]?.updatedAt ?? 0));
  if (sort === 'title') result.sort((a, b) => a.title.localeCompare(b.title, 'hu-HU'));
  return result;
}
