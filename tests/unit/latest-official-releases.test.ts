import test from 'node:test';
import assert from 'node:assert/strict';
import { latestOfficialReleaseArticles } from '../../src/data/articles/latest-official-releases.ts';
import { wikiArticles } from '../../src/data/wikiArticles.ts';

const expected = [
  'season-hells-legacy',
  'diablo-immortal-made-to-suffer',
  'witcher-songs-of-the-past',
  'witcher-letten',
  'witcher3-remastered',
  'reigns-the-witcher',
];

test('az új hivatalos megjelenések és Letten külön, teljes rekordként érhetők el', () => {
  assert.deepEqual(Object.keys(latestOfficialReleaseArticles), expected);
  for (const id of expected) {
    const article = latestOfficialReleaseArticles[id];
    assert.ok(article.content.length > 1_500, `${id} túl rövid`);
    assert.ok(Object.keys(article.infobox ?? {}).length >= 5, `${id} adatlapja hiányos`);
    assert.match(article.content, /<h2>Forrás/);
    assert.equal(wikiArticles[id]?.id, id);
  }
});

test('a Diablo és Witcher folytonosság nem keveredik', () => {
  assert.equal(latestOfficialReleaseArticles['season-hells-legacy'].universeId, 'diablo');
  assert.equal(latestOfficialReleaseArticles['diablo-immortal-made-to-suffer'].universeId, 'diablo');
  for (const id of expected.slice(2)) {
    assert.equal(latestOfficialReleaseArticles[id].universeId, 'witcher');
  }
  assert.match(latestOfficialReleaseArticles['reigns-the-witcher'].content, /alternatív játékfolytonosság/);
  assert.match(latestOfficialReleaseArticles['witcher3-remastered'].content, /nem önálló történeti mű/);
  assert.match(latestOfficialReleaseArticles['season-hells-legacy'].content, /emlékkép/);
  assert.match(latestOfficialReleaseArticles['diablo-immortal-made-to-suffer'].content, /crossover-jelölést/);
});

test('minden új belső hivatkozás létező cikkre mutat', () => {
  const linkPattern = /\[\[([^|\]]+)/g;
  for (const article of Object.values(latestOfficialReleaseArticles)) {
    for (const match of article.content.matchAll(linkPattern)) {
      assert.ok(wikiArticles[match[1]], `${article.id} törött linkje: ${match[1]}`);
    }
    for (const relatedId of article.relatedArticles ?? []) {
      assert.ok(wikiArticles[relatedId], `${article.id} törött kapcsolata: ${relatedId}`);
    }
  }
});
