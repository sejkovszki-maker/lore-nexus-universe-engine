import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import fc from 'fast-check';
import { getAppState, openReader, resetAppState, setReaderPage, setSearchQuery } from '../../src/store/appState.ts';

afterEach(() => resetAppState());

test('reader page is never negative for arbitrary integers', () => {
  fc.assert(fc.property(fc.integer(), (page) => {
    openReader('property-book'); setReaderPage(page);
    assert.equal(getAppState().reader.pageIndex, Math.max(0, page));
  }), { numRuns: 500 });
});

test('search state preserves arbitrary unicode exactly', () => {
  fc.assert(fc.property(fc.string(), (query) => {
    setSearchQuery(query); assert.equal(getAppState().searchQuery, query);
    assert.equal(getAppState().currentSearchQuery, query);
  }), { numRuns: 500 });
});
