import test from 'node:test';
import assert from 'node:assert/strict';
import { searchBookChapters } from '../../src/wiki/book-search.ts';

const chapters = [
  { id: 'book-ch1', title: 'Első fejezet', content: '<p>Kehjistan sűrű dzsungele veszélyeket rejt.</p>' },
  { id: 'book-ch2', title: 'Második fejezet', content: '<p>A keHJiSTAN név ebben a fejezetben kétszer szerepel: Kehjistan.</p>' },
] as any[];

test('book search is accent and case insensitive and returns safe snippets', () => {
  const results = searchBookChapters(chapters, 'kehjistan');
  assert.equal(results.length, 2);
  assert.equal(results[1].occurrenceCount, 2);
  assert.match(results[0].snippet, /sűrű dzsungele/);
  assert.doesNotMatch(results[0].snippet, /<p>/);
});

test('book search ignores empty and one-character queries', () => {
  assert.deepEqual(searchBookChapters(chapters, ''), []);
  assert.deepEqual(searchBookChapters(chapters, 'a'), []);
});
