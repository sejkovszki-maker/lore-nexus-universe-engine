import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOK_PROGRESS_STORAGE_KEY, exportProgress, loadBookProgress, mergeProgress, parseProgressImport, progressKey, storeBookProgress } from '../../src/wiki/book-progress.ts';

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const entry = {
  universeId: 'diablo', bookId: 'kingdom-of-shadow', chapterId: 'kingdom-of-shadow-ch16',
  scrollY: 1840, updatedAt: 100, bookmarks: [{ id: 'bm-1', chapterId: 'kingdom-of-shadow-ch16', chapterTitle: '16. fejezet', scrollY: 1840, createdAt: 90 }],
};

test('book progress survives a storage round trip with its bookmarks', () => {
  const storage = new MemoryStorage();
  storeBookProgress({ [progressKey(entry.universeId, entry.bookId)]: entry }, storage);
  assert.deepEqual(loadBookProgress(storage), { 'diablo:kingdom-of-shadow': entry });
});

test('invalid local or imported progress fails closed without usable entries', () => {
  const storage = new MemoryStorage();
  storage.setItem(BOOK_PROGRESS_STORAGE_KEY, '{broken');
  assert.deepEqual(loadBookProgress(storage), {});
  assert.throws(() => parseProgressImport(JSON.stringify({ format: 'unknown', schemaVersion: 1, entries: [entry] })), /INVALID_READING_PROGRESS/);
  assert.throws(() => parseProgressImport(JSON.stringify({ format: 'lore-nexus-reading-progress', schemaVersion: 1, entries: [{ ...entry, scrollY: -1 }] })), /INVALID_READING_PROGRESS/);
  assert.throws(() => parseProgressImport(JSON.stringify({ format: 'lore-nexus-reading-progress', schemaVersion: 1, entries: [{ ...entry, bookmarks: [{ ...entry.bookmarks[0], note: 'x'.repeat(4001) }] }] })), /INVALID_READING_PROGRESS/);
});

test('export and import prefer newer positions without discarding unique bookmarks', () => {
  const exported = exportProgress({ 'diablo:kingdom-of-shadow': entry });
  const parsed = parseProgressImport(JSON.stringify(exported));
  const newer = { ...entry, chapterId: 'kingdom-of-shadow-ch17', scrollY: 20, updatedAt: 200, bookmarks: [] };
  const merged = mergeProgress({ 'diablo:kingdom-of-shadow': newer }, parsed);
  assert.equal(merged['diablo:kingdom-of-shadow'].chapterId, 'kingdom-of-shadow-ch17');
  assert.equal(merged['diablo:kingdom-of-shadow'].bookmarks.length, 1);
});
