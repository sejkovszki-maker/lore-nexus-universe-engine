export const BOOK_READER_SETTINGS_KEY = 'lore-nexus:book-reader-settings:v1';

export type ReaderTheme = 'dark' | 'parchment' | 'contrast' | 'eink';
export interface BookReaderSettings {
  fontScale: number;
  lineHeight: number;
  columnWidth: number;
  theme: ReaderTheme;
}

export const defaultBookReaderSettings: BookReaderSettings = {
  fontScale: 1,
  lineHeight: 1.85,
  columnWidth: 75,
  theme: 'dark',
};

const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));

export function normalizeBookReaderSettings(value: unknown): BookReaderSettings {
  if (!value || typeof value !== 'object') return { ...defaultBookReaderSettings };
  const candidate = value as Partial<BookReaderSettings>;
  const fontScale = typeof candidate.fontScale === 'number' && Number.isFinite(candidate.fontScale) ? candidate.fontScale : defaultBookReaderSettings.fontScale;
  const lineHeight = typeof candidate.lineHeight === 'number' && Number.isFinite(candidate.lineHeight) ? candidate.lineHeight : defaultBookReaderSettings.lineHeight;
  const columnWidth = typeof candidate.columnWidth === 'number' && Number.isFinite(candidate.columnWidth) ? candidate.columnWidth : defaultBookReaderSettings.columnWidth;
  const theme: ReaderTheme = candidate.theme === 'parchment' || candidate.theme === 'contrast' || candidate.theme === 'eink' || candidate.theme === 'dark' ? candidate.theme : defaultBookReaderSettings.theme;
  return {
    fontScale: Math.round(clamp(fontScale, .85, 1.4) * 100) / 100,
    lineHeight: Math.round(clamp(lineHeight, 1.5, 2.3) * 100) / 100,
    columnWidth: Math.round(clamp(columnWidth, 50, 100)),
    theme,
  };
}

export function loadBookReaderSettings(storage: Pick<Storage, 'getItem'> = localStorage): BookReaderSettings {
  try { return normalizeBookReaderSettings(JSON.parse(storage.getItem(BOOK_READER_SETTINGS_KEY) || 'null')); }
  catch { return { ...defaultBookReaderSettings }; }
}

export function storeBookReaderSettings(settings: BookReaderSettings, storage: Pick<Storage, 'setItem'> = localStorage) {
  storage.setItem(BOOK_READER_SETTINGS_KEY, JSON.stringify(normalizeBookReaderSettings(settings)));
}
