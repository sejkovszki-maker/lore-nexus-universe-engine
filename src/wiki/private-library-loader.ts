import { wikiArticles } from '../data/wikiArticles.ts';
import type { WikiArticle } from '../types.ts';
import { isStoredArticle } from './user-article-store.ts';

interface PrivateLibraryEnvelope {
  format: 'lore-nexus-private-library';
  schemaVersion: 1;
  payloadSha256: string;
  articles: WikiArticle[];
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function hydratePrivateLibrary(): Promise<number> {
  const url = `${import.meta.env.BASE_URL}private-library/articles.json`;
  const response = await fetch(url, { cache: 'no-store' });
  if (response.status === 404) return 0;
  if (!response.ok) throw new Error(`PRIVATE_LIBRARY_HTTP_${response.status}`);
  const envelope = await response.json() as Partial<PrivateLibraryEnvelope>;
  if (envelope.format !== 'lore-nexus-private-library' || envelope.schemaVersion !== 1 || !Array.isArray(envelope.articles) || typeof envelope.payloadSha256 !== 'string') {
    throw new Error('INVALID_PRIVATE_LIBRARY');
  }
  if (envelope.articles.some(article => !isStoredArticle(article))) throw new Error('INVALID_PRIVATE_LIBRARY_ARTICLE');
  if (new Set(envelope.articles.map(article => article.id)).size !== envelope.articles.length) throw new Error('DUPLICATE_PRIVATE_LIBRARY_ARTICLE');
  if (await sha256(JSON.stringify(envelope.articles)) !== envelope.payloadSha256) throw new Error('PRIVATE_LIBRARY_INTEGRITY_FAILED');
  for (const article of envelope.articles) {
    const existing = wikiArticles[article.id];
    const existingIsLegacyBook = existing && existing.type === undefined &&
      existing.category?.startsWith('Könyvek') && !/-ch\d+$/u.test(existing.id);
    const existingIsLegacyChapter = existing && existing.type === undefined &&
      existing.category?.startsWith('Könyvek') && article.parentBook !== undefined &&
      new RegExp(`^${article.parentBook.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-ch\\d+$`, 'u').test(existing.id);
    const allowedBookOverlay = article.type === 'book' && (existing?.type === 'book' || existingIsLegacyBook) &&
      (article.universeId ?? 'diablo') === (existing.universeId ?? 'diablo');
    const allowedChapterRepair = article.type === 'chapter' && (existing?.type === 'chapter' || existingIsLegacyChapter) &&
      (article.parentBook === existing.parentBook || existingIsLegacyChapter) &&
      typeof article.parentBook === 'string' &&
      (article.universeId ?? 'diablo') === (existing.universeId ?? 'diablo');
    if (existing && !allowedBookOverlay && !allowedChapterRepair) throw new Error(`PRIVATE_LIBRARY_COLLISION:${article.id}`);
    wikiArticles[article.id] = article;
  }
  return envelope.articles.length;
}
