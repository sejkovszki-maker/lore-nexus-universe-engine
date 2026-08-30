import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalStory, canonicalStoryIds, storyBookSegments, storyReadingPath } from '../../src/wiki/story-order.ts';

test('canonical story is complete, unique and follows the intended historical endpoints', () => {
  const story = canonicalStory();
  assert.equal(story.length, canonicalStoryIds.length);
  assert.equal(new Set(story.map(article => article.id)).size, story.length);
  assert.equal(story[0].id, 'kozmogonia');
  assert.equal(story.at(-1)?.id, 'diablo-4-loh');
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
