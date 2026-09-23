import { wikiArticles } from '../data/wikiArticles.ts';
import type { WikiArticle } from '../types.ts';

interface ReaderLibraryEnvelope {
  format: 'lore-nexus-reader-library';
  schemaVersion: 1;
  articles: WikiArticle[];
}

const readerChapterId = /^(?:sin-war-(?:birthright|scales|prophet)|demonsbane)-ch\d+$/u;

export function installReaderArticles(value: unknown): number {
  const envelope = value as Partial<ReaderLibraryEnvelope>;
  if (envelope.format !== 'lore-nexus-reader-library' || envelope.schemaVersion !== 1 || !Array.isArray(envelope.articles)) {
    throw new Error('INVALID_READER_LIBRARY');
  }
  const ids = envelope.articles.map(article => article?.id);
  if (ids.some(id => typeof id !== 'string' || !readerChapterId.test(id)) || new Set(ids).size !== ids.length) {
    throw new Error('INVALID_READER_LIBRARY_ARTICLE');
  }
  for (const article of envelope.articles) {
    if (typeof article.title !== 'string' || !article.title.trim() || typeof article.content !== 'string' || typeof article.category !== 'string') {
      throw new Error('INVALID_READER_LIBRARY_ARTICLE');
    }
    if (wikiArticles[article.id] && wikiArticles[article.id] !== article) throw new Error(`READER_LIBRARY_COLLISION:${article.id}`);
  }
  for (const article of envelope.articles) wikiArticles[article.id] = article;
  return envelope.articles.length;
}

async function hydrateReaderLibrary(): Promise<number> {
  const response = await fetch(`${import.meta.env.BASE_URL}reader-library/articles.json`, { cache: 'force-cache' });
  if (!response.ok) throw new Error(`READER_LIBRARY_HTTP_${response.status}`);
  return installReaderArticles(await response.json());
}

let hydration: Promise<number> | undefined;

export function ensureReaderLibrary(): Promise<number> {
  hydration ??= hydrateReaderLibrary().catch(error => {
    hydration = undefined;
    throw error;
  });
  return hydration;
}
