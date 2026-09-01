import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseRoute, routeHash } from '../../src/router.ts';

test('Router 2.0 parses every public route family', () => {
  assert.deepEqual(parseRoute('#/wiki/deckard-cain'), { view: 'article-view', universeId: 'diablo', articleId: 'deckard-cain' });
  assert.deepEqual(parseRoute('#/story/deckard-cain'), { view: 'story', universeId: 'diablo', articleId: 'deckard-cain' });
  assert.deepEqual(parseRoute('#/timeline/sin-war'), { view: 'timeline', universeId: 'diablo', eventId: 'sin-war' });
  assert.deepEqual(parseRoute('#/book/the-black-road/chapter-4'), { view: 'book', universeId: 'diablo', bookId: 'the-black-road', chapterId: 'chapter-4' });
  assert.deepEqual(parseRoute('#/u/witcher/wiki/geralt'), { view: 'article-view', universeId: 'witcher', articleId: 'geralt' });
  assert.deepEqual(parseRoute('#/sources'), { view: 'sources', universeId: 'diablo' });
});

test('route generation round-trips and invalid input fails closed', () => {
  const route = { view: 'book' as const, universeId: 'witcher', bookId: 'last-wish', chapterId: 'chapter-2' };
  assert.deepEqual(parseRoute(routeHash(route)), route);
  assert.equal(parseRoute('#/wiki/%2Fetc').view, 'not-found');
  assert.equal(parseRoute('#/unknown/path').view, 'not-found');
  assert.equal(parseRoute('#/editor').view, 'not-found');
  assert.equal(parseRoute('#tab/editor').view, 'not-found');
  assert.deepEqual(parseRoute('#tab/story'), { view: 'story', universeId: 'diablo' });
});
