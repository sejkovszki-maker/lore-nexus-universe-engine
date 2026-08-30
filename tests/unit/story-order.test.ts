import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalStory, canonicalStoryIds, storyBookSegments, storyReadingPath } from '../../src/wiki/story-order.ts';
import { wikiArticles } from '../../src/data/wikiArticles.ts';

test('canonical story is complete, unique and follows the intended historical endpoints', () => {
  const story = canonicalStory();
  assert.equal(story.length, canonicalStoryIds.length);
  assert.equal(new Set(story.map(article => article.id)).size, story.length);
  assert.equal(story[0].id, 'kozmogonia');
  assert.equal(story.at(-1)?.id, 'diablo-4-loh');
});

test('a foreign universe keeps its articles and books in its own chronological path', () => {
  wikiArticles['witcher-start'] = { id: 'witcher-start', title: 'Kezdet', category: 'Történet', content: '', universeId: 'witcher', lastEdited: 1 };
  wikiArticles['witcher-book'] = { id: 'witcher-book', title: 'Könyv', category: 'Könyv', content: '', universeId: 'witcher', type: 'book', storyAfter: 'witcher-start', lastEdited: 2 };
  wikiArticles['witcher-book-ch1'] = { id: 'witcher-book-ch1', title: 'Első fejezet', category: 'Könyv', content: '', universeId: 'witcher', type: 'chapter', parentBook: 'witcher-book', lastEdited: 3 };
  try {
    assert.deepEqual(storyReadingPath(true, 'witcher').map(item => item.article.id), ['witcher-start', 'witcher-book-ch1']);
    assert.deepEqual(storyReadingPath(false, 'witcher').map(item => item.article.id), ['witcher-start']);
  } finally {
    delete wikiArticles['witcher-start']; delete wikiArticles['witcher-book']; delete wikiArticles['witcher-book-ch1'];
  }
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
