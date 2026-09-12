import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalStory, canonicalStoryIds, storyBooks, storyBookSegments, storyReadingPath } from '../../src/wiki/story-order.ts';
import { wikiArticles } from '../../src/data/wikiArticles.ts';

test('canonical story is complete, unique and follows the intended historical endpoints', () => {
  const story = canonicalStory();
  assert.equal(story.length, canonicalStoryIds.length);
  assert.equal(new Set(story.map(article => article.id)).size, story.length);
  assert.equal(story[0].id, 'kozmogonia');
  assert.equal(story.at(-1)?.id, 'diablo-4-loh');
});

test('a foreign universe keeps its articles and books in its own chronological path', () => {
  wikiArticles['test-universe-start'] = { id: 'test-universe-start', title: 'Kezdet', category: 'Történet', content: '', universeId: 'test-universe', lastEdited: 1 };
  wikiArticles['test-universe-book'] = { id: 'test-universe-book', title: 'Könyv', category: 'Könyv', content: '', universeId: 'test-universe', type: 'book', storyAfter: 'test-universe-start', lastEdited: 2 };
  wikiArticles['test-universe-book-ch1'] = { id: 'test-universe-book-ch1', title: 'Első fejezet', category: 'Könyv', content: '', universeId: 'test-universe', type: 'chapter', parentBook: 'test-universe-book', lastEdited: 3 };
  try {
    assert.deepEqual(storyReadingPath(true, 'test-universe').map(item => item.article.id), ['test-universe-start', 'test-universe-book-ch1']);
    assert.deepEqual(storyReadingPath(false, 'test-universe').map(item => item.article.id), ['test-universe-start']);
  } finally {
    delete wikiArticles['test-universe-start']; delete wikiArticles['test-universe-book']; delete wikiArticles['test-universe-book-ch1'];
  }
});

test('the built-in Witcher archive has an isolated chronological reading path and nine books', () => {
  const path = storyReadingPath(true, 'witcher');
  assert.ok(path.length >= 20);
  assert.equal(path.every(item => item.article.universeId === 'witcher'), true);
  assert.equal(storyBooks('witcher').length, 9);
  assert.ok(path.findIndex(item => item.article.id === 'witcher-book-last-wish') > path.findIndex(item => item.article.id === 'witcher-geralt'));
  assert.ok(path.findIndex(item => item.article.id === 'witcher-book-blood-elves') > path.findIndex(item => item.article.id === 'witcher-ciri'));
});

test('optional novels are inserted at curated historical points and remain skippable as segments', () => {
  const mainOnly = storyReadingPath(false);
  const expanded = storyReadingPath(true);
  assert.equal(mainOnly.length, canonicalStoryIds.length);
  assert.ok(expanded.length > mainOnly.length);
  assert.deepEqual(mainOnly.map(item => item.article.id), [...canonicalStoryIds]);
  for (const segment of storyBookSegments) {
    const anchor = expanded.findIndex(item => item.article.id === segment.after);
    const firstBookChapter = expanded.findIndex(item => item.segmentId === segment.id);
    assert.ok(firstBookChapter > anchor, `${segment.title} must follow its historical anchor`);
    assert.ok(expanded.filter(item => item.segmentId === segment.id).length > 0);
  }
});

test('A Gonosz ösvénye has one public book record at the Diablo I anchor', () => {
  const book = storyBooks().find(item => item.id === 'book-the-black-road-reader');
  assert.ok(book);
  assert.equal(book.after, 'diablo-1-story');
  assert.equal(book.chapters.length, 0);
  assert.equal(Object.keys(wikiArticles).some(id => /^(?:black-road|book-gonosz-osvenye)-ch\d+$/.test(id)), false);
  const expanded = storyReadingPath(true);
  const anchor = expanded.findIndex(item => item.article.id === 'diablo-1-story');
  const firstChapter = expanded.findIndex(item => item.segmentId === book.id);
  assert.equal(firstChapter, anchor + 1);
  assert.equal(expanded[firstChapter].article.id, 'book-the-black-road-reader');
});
