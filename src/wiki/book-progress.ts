export const BOOK_PROGRESS_STORAGE_KEY = 'lore-nexus:book-progress:v1';

export interface ReadingBookmark {
  id: string;
  chapterId: string;
  chapterTitle: string;
  scrollY: number;
  createdAt: number;
  quote?: string;
  note?: string;
}

export interface BookReadingProgress {
  universeId: string;
  bookId: string;
  chapterId: string;
  scrollY: number;
  updatedAt: number;
  bookmarks: ReadingBookmark[];
  status?: 'reading' | 'paused' | 'completed';
}

export interface BookProgressExport {
  format: 'lore-nexus-reading-progress';
  schemaVersion: 1;
  exportedAt: number;
  entries: BookReadingProgress[];
}

const safeId = /^[a-z0-9][a-z0-9-]{0,159}$/u;
const finitePosition = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0;
export const progressKey = (universeId: string, bookId: string) => `${universeId}:${bookId}`;

function validBookmark(value: unknown): value is ReadingBookmark {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<ReadingBookmark>;
  return typeof item.id === 'string' && item.id.length <= 100 && safeId.test(item.chapterId ?? '') &&
    typeof item.chapterTitle === 'string' && item.chapterTitle.length <= 300 && finitePosition(item.scrollY) && finitePosition(item.createdAt) &&
    (item.quote === undefined || (typeof item.quote === 'string' && item.quote.length <= 1000)) &&
    (item.note === undefined || (typeof item.note === 'string' && item.note.length <= 4000));
}

export function validProgress(value: unknown): value is BookReadingProgress {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<BookReadingProgress>;
  return safeId.test(item.universeId ?? '') && safeId.test(item.bookId ?? '') && safeId.test(item.chapterId ?? '') &&
    finitePosition(item.scrollY) && finitePosition(item.updatedAt) && Array.isArray(item.bookmarks) &&
    item.bookmarks.length <= 100 && item.bookmarks.every(validBookmark) &&
    (item.status === undefined || item.status === 'reading' || item.status === 'paused' || item.status === 'completed');
}

export function readingStatusLabel(status: BookReadingProgress['status']) {
  if (status === 'completed') return 'Befejezve';
  if (status === 'paused') return 'Szüneteltetve';
  return 'Olvasás alatt';
}

export function loadBookProgress(storage: Pick<Storage, 'getItem'> = localStorage): Record<string, BookReadingProgress> {
  try {
    const value = JSON.parse(storage.getItem(BOOK_PROGRESS_STORAGE_KEY) || '{}') as unknown;
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([key, entry]) => key.length <= 330 && validProgress(entry)).slice(0, 500));
  } catch { return {}; }
}

export function storeBookProgress(entries: Record<string, BookReadingProgress>, storage: Pick<Storage, 'setItem'> = localStorage) {
  storage.setItem(BOOK_PROGRESS_STORAGE_KEY, JSON.stringify(entries));
}

export function parseProgressImport(text: string): BookProgressExport {
  const value = JSON.parse(text) as Partial<BookProgressExport>;
  if (value.format !== 'lore-nexus-reading-progress' || value.schemaVersion !== 1 || !Array.isArray(value.entries) ||
    value.entries.length > 500 || !value.entries.every(validProgress)) throw new Error('INVALID_READING_PROGRESS');
  return value as BookProgressExport;
}

export function mergeProgress(current: Record<string, BookReadingProgress>, imported: BookProgressExport) {
  const merged = { ...current };
  for (const entry of imported.entries) {
    const key = progressKey(entry.universeId, entry.bookId);
    const existing = merged[key];
    if (!existing || entry.updatedAt >= existing.updatedAt) merged[key] = entry;
    else {
      const bookmarkIds = new Set(existing.bookmarks.map(bookmark => bookmark.id));
      merged[key] = { ...existing, bookmarks: [...existing.bookmarks, ...entry.bookmarks.filter(bookmark => !bookmarkIds.has(bookmark.id))].slice(-100) };
    }
  }
  return merged;
}

export function exportProgress(entries: Record<string, BookReadingProgress>): BookProgressExport {
  return { format: 'lore-nexus-reading-progress', schemaVersion: 1, exportedAt: Date.now(), entries: Object.values(entries) };
}
