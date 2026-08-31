import { db, type Article } from '../db/database.ts';
import { wikiArticles } from '../data/wikiArticles.ts';
import type { WikiArticle } from '../types.ts';
import { registerUniverse } from '../universe/article-universes.ts';

const BUILTIN_ARTICLE_IDS = new Set(Object.keys(wikiArticles));

function isStoredArticle(value: unknown): value is Article {
  if (!value || typeof value !== 'object') return false;
  const article = value as Partial<Article>;
  return typeof article.id === 'string' && /^[a-z0-9][a-z0-9-]{0,119}$/.test(article.id)
    && typeof article.title === 'string' && article.title.trim().length > 0 && article.title.length <= 300
    && typeof article.category === 'string' && article.category.trim().length > 0 && article.category.length <= 120
    && typeof article.content === 'string' && typeof article.lastEdited === 'number' && Number.isFinite(article.lastEdited)
    && (article.relatedArticles === undefined || (Array.isArray(article.relatedArticles) && article.relatedArticles.every(id => typeof id === 'string' && /^[a-z0-9][a-z0-9-]{0,119}$/.test(id))))
    && (article.parentBook === undefined || (typeof article.parentBook === 'string' && /^[a-z0-9][a-z0-9-]{0,119}$/.test(article.parentBook)))
    && (article.universeId === undefined || (typeof article.universeId === 'string' && /^[a-z0-9][a-z0-9-]{0,119}$/.test(article.universeId)))
    && (article.universeLabel === undefined || (typeof article.universeLabel === 'string' && article.universeLabel.length <= 120))
    && (article.storyAfter === undefined || (typeof article.storyAfter === 'string' && /^[a-z0-9][a-z0-9-]{0,119}$/.test(article.storyAfter)))
    && (article.publicationStatus === undefined || article.publicationStatus === 'local-draft' || article.publicationStatus === 'published')
    && (article.version === undefined || (Number.isSafeInteger(article.version) && article.version >= 1));
}

async function sha256(value: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

interface DraftBackupPayload { schemaVersion: 1; articles: Article[] }
interface DraftBackupEnvelope { format: 'lore-nexus-local-drafts'; exportedAtUtc: string; payload: DraftBackupPayload; payloadSha256: string }

export async function hydrateUserArticles(): Promise<number> {
  const stored = await db.articles.toArray();
  let loaded = 0;
  for (const article of stored) {
    if (!isStoredArticle(article)) continue;
    const existing = wikiArticles[article.id];
    if (existing) continue;
    wikiArticles[article.id] = article as WikiArticle;
    if (article.universeId) registerUniverse({ id: article.universeId, label: article.universeLabel || article.universeId });
    loaded += 1;
  }
  return loaded;
}

export async function persistUserArticles(articles: WikiArticle[]): Promise<void> {
  if (articles.length === 0) throw new Error('EMPTY_ARTICLE_BATCH');
  if (articles.some(article => !isStoredArticle(article))) throw new Error('INVALID_USER_ARTICLE');
  const ids = new Set(articles.map(article => article.id));
  if (ids.size !== articles.length) throw new Error('DUPLICATE_ARTICLE_ID');
  await db.transaction('rw', db.articles, async () => {
    await db.articles.bulkPut(articles as Article[]);
  });
}

export async function exportUserArticles(): Promise<string> {
  const articles = (await db.articles.toArray()).filter(isStoredArticle).sort((a, b) => a.id.localeCompare(b.id));
  const payload: DraftBackupPayload = { schemaVersion: 1, articles };
  const serializedPayload = JSON.stringify(payload);
  const envelope: DraftBackupEnvelope = { format: 'lore-nexus-local-drafts', exportedAtUtc: new Date().toISOString(), payload, payloadSha256: await sha256(serializedPayload) };
  return JSON.stringify(envelope, null, 2);
}

export async function importUserArticles(serialized: string): Promise<{ imported: number; universes: string[] }> {
  if (serialized.length > 50_000_000) throw new Error('BACKUP_TOO_LARGE');
  let envelope: Partial<DraftBackupEnvelope>;
  try { envelope = JSON.parse(serialized) as Partial<DraftBackupEnvelope>; } catch { throw new Error('INVALID_BACKUP_JSON'); }
  if (envelope.format !== 'lore-nexus-local-drafts' || envelope.payload?.schemaVersion !== 1 || !Array.isArray(envelope.payload.articles) || typeof envelope.payloadSha256 !== 'string') throw new Error('UNSUPPORTED_BACKUP_FORMAT');
  const payloadText = JSON.stringify(envelope.payload);
  if (await sha256(payloadText) !== envelope.payloadSha256) throw new Error('BACKUP_INTEGRITY_FAILED');
  const articles = envelope.payload.articles;
  if (articles.some(article => !isStoredArticle(article))) throw new Error('INVALID_USER_ARTICLE');
  const ids = new Set(articles.map(article => article.id));
  if (ids.size !== articles.length) throw new Error('DUPLICATE_ARTICLE_ID');
  for (const article of articles) if (BUILTIN_ARTICLE_IDS.has(article.id)) throw new Error(`BUILTIN_ARTICLE_COLLISION:${article.id}`);
  await db.transaction('rw', db.articles, async () => { await db.articles.bulkPut(articles); });
  const universes = new Set<string>();
  for (const article of articles) {
    wikiArticles[article.id] = article as WikiArticle;
    const universeId = article.universeId || 'diablo';
    universes.add(universeId);
    registerUniverse({ id: universeId, label: article.universeLabel || universeId });
  }
  return { imported: articles.length, universes: [...universes].sort() };
}
