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

test('an existing local work keeps its identity and only changed or new chapter pages are written', () => {
  const first = 'Első fejezet tartalma. '.repeat(8);
  const changed = 'A második fejezet javított tartalma. '.repeat(8);
  const existing = {
    'probakonyv': { id: 'probakonyv', title: 'Próbakönyv', category: 'Könyvek – Olvasó', content: '2 fejezet', type: 'book' as const, publicationStatus: 'local-draft' as const, version: 2, lastEdited: 1 },
    'probakonyv-ch1': { id: 'probakonyv-ch1', title: 'Próbakönyv - 1. fejezet', category: 'Könyvek – Olvasó', content: first, type: 'chapter' as const, parentBook: 'probakonyv', publicationStatus: 'local-draft' as const, version: 1, lastEdited: 1 },
    'probakonyv-ch2': { id: 'probakonyv-ch2', title: 'Próbakönyv - 2. fejezet', category: 'Könyvek – Olvasó', content: 'Régi második fejezet. '.repeat(8), type: 'chapter' as const, parentBook: 'probakonyv', publicationStatus: 'local-draft' as const, version: 1, lastEdited: 1 },
  };
  const analysis = WikiContentEngine.analyzeBook('Próbakönyv', '', `1. fejezet\n${first}\n\n2. fejezet\n${changed}\n\n3. fejezet\n${'Új harmadik fejezet. '.repeat(8)}`, existing);
  assert.equal(analysis.bookId, 'probakonyv');
  assert.deepEqual([analysis.unchangedChapterCount, analysis.changedChapterCount, analysis.newChapterCount], [1, 1, 1]);
  const updates = WikiContentEngine.processAndPrepareBook(analysis, existing);
  assert.deepEqual(updates.map(article => article.id), ['probakonyv', 'probakonyv-ch2', 'probakonyv-ch3']);
  assert.equal(updates[0].version, 3);
  assert.equal(updates[1].version, 2);
});

test('front matter and prologue are preserved as readable pages', () => {
  const intro = 'A kiadás előszava és bibliográfiai bevezetője. '.repeat(4);
  const analysis = WikiContentEngine.analyzeBook('Teljes könyv', '', `${intro}\n\nPrológus\n${'A történet kezdete. '.repeat(8)}\n\n1. fejezet – Érkezés\n${'Az első fejezet. '.repeat(8)}`, {});
  assert.equal(analysis.isBook, true);
  assert.equal(analysis.chapters.length, 3);
  assert.equal(analysis.chapters[0].chapterId, 'teljes-konyv-front-matter');
  assert.match(analysis.chapters[1].title, /Prológus/i);
});
