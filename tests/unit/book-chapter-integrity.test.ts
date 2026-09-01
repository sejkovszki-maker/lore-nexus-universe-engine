import assert from 'node:assert/strict';
import test from 'node:test';
import { wikiArticles } from '../../src/data/wikiArticles.ts';

test('A kígyó pikkelyei 12–15. fejezetei külön, olvasható lapokon maradnak', () => {
  const chapters = [12, 13, 14, 15].map((number) =>
    wikiArticles[`sin-war-scales-ch${number}`]
  );

  for (const [index, article] of chapters.entries()) {
    const number = index + 12;
    assert.ok(article, `Hiányzó ${number}. fejezet`);
    assert.match(article.content, new RegExp(`<h3>${number}\\. FEJEZET</h3>`));
    assert.ok(article.content.length > 20_000, `${number}. fejezet gyanúsan rövid`);
    assert.ok(article.content.length < 40_000, `${number}. fejezet más fejezetet is tartalmazhat`);
  }

  const combined = chapters.map((article) => article.content).join('\n');
  assert.doesNotMatch(combined, /TIZENÖTÖNÖT|Dokumentumvázlat|Title Page/);
  assert.equal((combined.match(/<h3>1[2-5]\. FEJEZET<\/h3>/g) ?? []).length, 4);
});
