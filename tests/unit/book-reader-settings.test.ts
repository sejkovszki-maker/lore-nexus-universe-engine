import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOK_READER_SETTINGS_KEY, defaultBookReaderSettings, loadBookReaderSettings, normalizeBookReaderSettings, storeBookReaderSettings } from '../../src/wiki/book-reader-settings.ts';

class MemoryStorage {
  value: string | null = null;
  getItem(key: string) { return key === BOOK_READER_SETTINGS_KEY ? this.value : null; }
  setItem(key: string, value: string) { if (key === BOOK_READER_SETTINGS_KEY) this.value = value; }
}

test('reader settings persist without losing valid preferences', () => {
  const storage = new MemoryStorage();
  const settings = { fontScale: 1.2, lineHeight: 2.05, columnWidth: 68, theme: 'parchment' as const };
  storeBookReaderSettings(settings, storage);
  assert.deepEqual(loadBookReaderSettings(storage), settings);
});

test('invalid reader settings fall back and extreme values are clamped', () => {
  assert.deepEqual(normalizeBookReaderSettings(null), defaultBookReaderSettings);
  assert.deepEqual(normalizeBookReaderSettings({ fontScale: 9, lineHeight: -2, columnWidth: 500, theme: 'unknown' }), {
    fontScale: 1.4, lineHeight: 1.5, columnWidth: 100, theme: 'dark',
  });
  const storage = new MemoryStorage(); storage.value = '{broken';
  assert.deepEqual(loadBookReaderSettings(storage), defaultBookReaderSettings);
});

test('e-ink theme persists as an explicit low-refresh reader preference', () => {
  const storage = new MemoryStorage();
  storeBookReaderSettings({ ...defaultBookReaderSettings, theme: 'eink' }, storage);
  assert.equal(loadBookReaderSettings(storage).theme, 'eink');
});
