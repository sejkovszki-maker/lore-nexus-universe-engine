import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import type { WikiArticle } from '../../src/types.ts';

const { db } = await import('../../src/db/database.ts');
const { wikiArticles } = await import('../../src/data/wikiArticles.ts');
const { exportUserArticles, hydrateUserArticles, importUserArticles, persistUserArticles } = await import('../../src/wiki/user-article-store.ts');
const testId = 'utoteszt-tartos-cikk';

before(async () => { await db.articles.clear(); delete wikiArticles[testId]; });
after(async () => { await db.articles.clear(); delete wikiArticles[testId]; await db.close(); });

test('user articles persist atomically and hydrate after a simulated reload', async () => {
  const article: WikiArticle = { id: testId, title: 'Tartós cikk', category: 'Teszt', content: 'Megőrzött tartalom', type: 'article', lastEdited: Date.now() };
  await persistUserArticles([article]);
  delete wikiArticles[testId];
  assert.equal(await hydrateUserArticles(), 1);
  assert.equal(wikiArticles[testId]?.content, 'Megőrzött tartalom');
});

test('invalid batches fail before any partial record is written', async () => {
  const valid: WikiArticle = { id: 'ervenyes-cikk', title: 'Érvényes', category: 'Teszt', content: 'Tartalom', lastEdited: Date.now() };
  const invalid = { ...valid, id: '../hibas' };
  await assert.rejects(() => persistUserArticles([valid, invalid]));
  assert.equal(await db.articles.get(valid.id), undefined);
});

test('draft backups round-trip with an integrity hash', async () => {
  await db.articles.clear();
  delete wikiArticles[testId];
  const article: WikiArticle = { id: 'mentett-cikk', title: 'Mentett cikk', category: 'Teszt', content: 'Biztonságos tartalom', lastEdited: Date.now(), publicationStatus: 'local-draft', version: 1 };
  await persistUserArticles([article]);
  const backup = await exportUserArticles();
  await db.articles.clear();
  delete wikiArticles[article.id];
  const result = await importUserArticles(backup);
  assert.equal(result.imported, 1);
  assert.equal((await db.articles.get(article.id))?.content, article.content);
});

test('tampered and built-in-colliding backups are rejected without partial writes', async () => {
  await db.articles.clear();
  const article: WikiArticle = { id: 'mentett-cikk', title: 'Mentett cikk', category: 'Teszt', content: 'Biztonságos tartalom', lastEdited: Date.now() };
  await persistUserArticles([article]);
  const backup = JSON.parse(await exportUserArticles());
  backup.payload.articles.find((item: WikiArticle) => item.id === article.id).content = 'Módosított';
  await assert.rejects(() => importUserArticles(JSON.stringify(backup)), /BACKUP_INTEGRITY_FAILED/);
  assert.equal((await db.articles.get('mentett-cikk'))?.content, 'Biztonságos tartalom');
  await assert.rejects(() => persistUserArticles([]), /EMPTY_ARTICLE_BATCH/);
});
