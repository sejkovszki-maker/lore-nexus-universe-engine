import assert from 'node:assert/strict';
import test from 'node:test';
import { WikiContentEngine } from '../../src/services/WikiContentEngine.ts';

test('book cleanup preserves chapter boundaries and collision-safe IDs', () => {
  const existing = {
    'idegen-konyv': { id: 'idegen-konyv', title: 'Idegen könyv', category: 'Könyvek – Olvasó', content: 'régi' },
  };
  const content = `1. fejezet\n${'Első fejezet tartalma. '.repeat(8)}\n\n2. fejezet\n${'Második fejezet tartalma. '.repeat(8)}`;
  const analysis = WikiContentEngine.analyzeBook('Idegen könyv', '', content, existing);
  assert.equal(analysis.isBook, true);
  assert.equal(analysis.chapters.length, 2);
  assert.equal(analysis.bookId, 'idegen-konyv-2');
  assert.match(analysis.chapters[0].content, /Első fejezet/);
});

test('single article preparation never overwrites an existing ID', () => {
  const existing = { lore: { id: 'lore', title: 'Lore', category: 'Lore', content: 'régi' } };
  const article = WikiContentEngine.processAndPrepareArticle('Lore', 'Új', 'Új tartalom', existing);
  assert.equal(article.id, 'lore-2');
  assert.equal(existing.lore.content, 'régi');
});

test('Hungarian text, URLs and meaningful line breaks are preserved losslessly', () => {
  const source = 'Így írunk magyarul.\r\nForrás: https://example.com/cikk.html\r\n\r\nÚj bekezdés.';
  assert.equal(WikiContentEngine.sanitizeContent(source), 'Így írunk magyarul.\nForrás: https://example.com/cikk.html\n\nÚj bekezdés.');
});

test('cross-link suggestions never cross universe boundaries', () => {
  const existing = {
    tyrael: { id: 'tyrael', title: 'Tyrael', category: 'Karakter', content: '', universeId: 'diablo' },
    'witcher-tyrael': { id: 'witcher-tyrael', title: 'Tyrael', category: 'Karakter', content: '', universeId: 'witcher' },
  };
  const content = `1. fejezet\n${'Tyrael története egy másik világban. '.repeat(8)}\n\n2. fejezet\n${'A történet folytatódik. '.repeat(8)}`;
  const analysis = WikiContentEngine.analyzeBook('Próba', '', content, existing);
  const articles = WikiContentEngine.processAndPrepareBook(analysis, existing, { id: 'witcher', label: 'The Witcher' });
  assert.deepEqual(articles[0].relatedArticles, ['witcher-tyrael']);
});
