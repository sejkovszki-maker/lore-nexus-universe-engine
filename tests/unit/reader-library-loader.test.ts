import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { wikiArticles } from '../../src/data/wikiArticles.ts';
import { installReaderArticles } from '../../src/wiki/reader-library-loader.ts';

const payload = JSON.parse(await readFile(new URL('../../public/reader-library/articles.json', import.meta.url), 'utf8'));

test('the lazy reader library installs every long chapter without duplicates', () => {
  const before = Object.keys(wikiArticles).length;
  const installed = installReaderArticles(payload);
  assert.equal(installed, 80);
  assert.equal(new Set(payload.articles.map((article: { id: string }) => article.id)).size, installed);
  assert.equal(Object.keys(wikiArticles).length, before + installed);
});

test('the lazy reader library rejects unknown ids and duplicate records atomically', () => {
  const before = Object.keys(wikiArticles).length;
  assert.throws(() => installReaderArticles({ ...payload, articles: [{ ...payload.articles[0], id: 'unexpected-reader-record' }] }), /INVALID_READER_LIBRARY_ARTICLE/u);
  assert.throws(() => installReaderArticles({ ...payload, articles: [payload.articles[0], payload.articles[0]] }), /INVALID_READER_LIBRARY_ARTICLE/u);
  assert.equal(Object.keys(wikiArticles).length, before);
});
