import { db, type Article } from '../db/database.ts';
import { wikiArticles } from '../data/wikiArticles.ts';
import type { WikiArticle } from '../types.ts';

function isStoredArticle(value: unknown): value is Article {
  if (!value || typeof value !== 'object') return false;
  const article = value as Partial<Article>;
  return typeof article.id === 'string' && /^[a-z0-9][a-z0-9-]{0,119}$/.test(article.id)
    && typeof article.title === 'string' && article.title.trim().length > 0 && article.title.length <= 300
    && typeof article.category === 'string' && article.category.trim().length > 0 && article.category.length <= 120
    && typeof article.content === 'string' && typeof article.lastEdited === 'number' && Number.isFinite(article.lastEdited)
    && (article.relatedArticles === undefined || (Array.isArray(article.relatedArticles) && article.relatedArticles.every(id => typeof id === 'string' && /^[a-z0-9][a-z0-9-]{0,119}$/.test(id))))
    && (article.parentBook === undefined || (typeof article.parentBook === 'string' && /^[a-z0-9][a-z0-9-]{0,119}$/.test(article.parentBook)));
}

export async function hydrateUserArticles(): Promise<number> {
  const stored = await db.articles.toArray();
  let loaded = 0;
  for (const article of stored) {
    if (!isStoredArticle(article)) continue;
    const existing = wikiArticles[article.id];
    if (existing) continue;
    wikiArticles[article.id] = article as WikiArticle;
    loaded += 1;
  }
  return loaded;
}

export async function persistUserArticles(articles: WikiArticle[]): Promise<void> {
  if (!articles.length || articles.some(article => !isStoredArticle(article))) throw new Error('INVALID_USER_ARTICLE');
  const ids = new Set(articles.map(article => article.id));
  if (ids.size !== articles.length) throw new Error('DUPLICATE_ARTICLE_ID');
  await db.transaction('rw', db.articles, async () => {
    await db.articles.bulkPut(articles as Article[]);
  });
}
