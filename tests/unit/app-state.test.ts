import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { closeReader, getAppState, openReader, resetAppState, setActiveArticleId, setActiveCategory, setActiveTab, setAppState, setArticleCategory, setEra, setGameTag, setReaderPage, setSearchQuery, subscribe } from '../../src/store/appState.ts';

afterEach(() => resetAppState());

test('state setters update navigation and filter state', () => {
  setActiveTab('articles'); setSearchQuery('Tyrael'); setGameTag('D2'); setEra('AGE_OF_LIGHT');
  setArticleCategory('Angyalok'); setActiveCategory('Karakterek'); setActiveArticleId('tyrael');
  assert.deepEqual({
    activeTab: getAppState().activeTab, searchQuery: getAppState().searchQuery,
    currentSearchQuery: getAppState().currentSearchQuery, activeGameTag: getAppState().activeGameTag,
    activeEraId: getAppState().activeEraId, activeArticleCategory: getAppState().activeArticleCategory,
    activeCategory: getAppState().activeCategory, activeArticleId: getAppState().activeArticleId,
  }, {
    activeTab: 'articles', searchQuery: 'Tyrael', currentSearchQuery: 'Tyrael', activeGameTag: 'D2',
    activeEraId: 'AGE_OF_LIGHT', activeArticleCategory: 'Angyalok', activeCategory: 'Karakterek', activeArticleId: 'tyrael',
  });
});

test('reader lifecycle clamps negative pages and resets cleanly', () => {
  openReader('book-1', 'chapter-2'); setReaderPage(12);
  assert.deepEqual(getAppState().reader, { bookId: 'book-1', chapterId: 'chapter-2', pageIndex: 12 });
  setReaderPage(-5); assert.equal(getAppState().reader.pageIndex, 0); closeReader();
  assert.deepEqual(getAppState().reader, { bookId: null, chapterId: null, pageIndex: 0 });
});

test('subscriptions are notified and can be removed', () => {
  let notifications = 0; const unsubscribe = subscribe(() => { notifications += 1; });
  setAppState({ activeTab: 'sources' }); assert.equal(notifications, 1); unsubscribe();
  setAppState({ activeTab: 'timeline' }); assert.equal(notifications, 1);
});
