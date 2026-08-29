import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalStory, canonicalStoryIds } from '../../src/wiki/story-order.ts';

test('canonical story is complete, unique and follows the intended historical endpoints', () => {
  const story = canonicalStory();
  assert.equal(story.length, canonicalStoryIds.length);
  assert.equal(new Set(story.map(article => article.id)).size, story.length);
  assert.equal(story[0].id, 'kozmogonia');
  assert.equal(story.at(-1)?.id, 'diablo-4-loh');
});
