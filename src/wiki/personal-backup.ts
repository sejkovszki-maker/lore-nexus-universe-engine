import { BOOK_PROGRESS_STORAGE_KEY, loadBookProgress, storeBookProgress } from './book-progress.ts';
import { BOOK_READER_SETTINGS_KEY, loadBookReaderSettings, storeBookReaderSettings } from './book-reader-settings.ts';

export interface PersonalBackup {
  format: 'lore-nexus-personal-backup';
  schemaVersion: 1;
  exportedAt: number;
  bookProgress: ReturnType<typeof loadBookProgress>;
  readerSettings: ReturnType<typeof loadBookReaderSettings>;
  storyData: Record<string, string>;
}

export function exportPersonalBackup(storage: Storage = localStorage): PersonalBackup {
  const storyData: Record<string, string> = {};
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index);
    if (key && (key.startsWith('lore-nexus:story-progress:v1:') || key === 'lore-nexus:story-books:v1')) {
      const value = storage.getItem(key);
      if (value !== null && value.length <= 100_000) storyData[key] = value;
    }
  }
  return { format: 'lore-nexus-personal-backup', schemaVersion: 1, exportedAt: Date.now(), bookProgress: loadBookProgress(storage), readerSettings: loadBookReaderSettings(storage), storyData };
}

export function importPersonalBackup(text: string, storage: Storage = localStorage) {
  const value = JSON.parse(text) as Partial<PersonalBackup>;
  if (value.format !== 'lore-nexus-personal-backup' || value.schemaVersion !== 1 || !value.bookProgress || !value.readerSettings || !value.storyData || typeof value.storyData !== 'object') throw new Error('INVALID_PERSONAL_BACKUP');
  const verifier = { getItem: (key: string) => key === BOOK_PROGRESS_STORAGE_KEY ? JSON.stringify(value.bookProgress) : key === BOOK_READER_SETTINGS_KEY ? JSON.stringify(value.readerSettings) : null };
  const progress = loadBookProgress(verifier);
  const settings = loadBookReaderSettings(verifier);
  if (Object.keys(progress).length !== Object.keys(value.bookProgress).length) throw new Error('INVALID_PERSONAL_BACKUP');
  for (const [key, raw] of Object.entries(value.storyData)) {
    if (!(key.startsWith('lore-nexus:story-progress:v1:') || key === 'lore-nexus:story-books:v1') || typeof raw !== 'string' || raw.length > 100_000) throw new Error('INVALID_PERSONAL_BACKUP');
    JSON.parse(raw);
  }
  const keys = [BOOK_PROGRESS_STORAGE_KEY, BOOK_READER_SETTINGS_KEY, ...Object.keys(value.storyData)];
  const previous = new Map(keys.map(key => [key, storage.getItem(key)]));
  try {
    storeBookProgress(progress, storage);
    storeBookReaderSettings(settings, storage);
    for (const [key, raw] of Object.entries(value.storyData)) storage.setItem(key, raw);
  } catch (error) {
    for (const [key, raw] of previous) {
      try { raw === null ? storage.removeItem(key) : storage.setItem(key, raw); } catch { /* A visszaállítást minden kulcsnál megkíséreljük. */ }
    }
    throw error;
  }
  return { progress, settings };
}
