import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import type { WikiArticle } from '../../src/types.ts';

const { db } = await import('../../src/db/database.ts');
const { wikiArticles } = await import('../../src/data/wikiArticles.ts');
const { hydrateUserArticles, persistUserArticles } = await import('../../src/wiki/user-article-store.ts');
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
