import test from 'node:test';
import assert from 'node:assert/strict';
import { conciseText, segmentIntroduction, storyRecap } from '../../src/wiki/story-reader-context.ts';

const articles: any = {
  anchor: { id: 'anchor', title: 'Tristram bukása', content: '<p>A város elbukott.</p>' },
  book: { id: 'book', title: 'A regény', storyAfter: 'anchor', content: '<h2>Ismertető</h2><p>A hősök továbbindulnak. A történet folytatódik.</p>' },
  ch1: { id: 'ch1', title: 'Első fejezet', content: '<p>Kezdet.</p>' },
  ch2: { id: 'ch2', title: 'Második fejezet', subtitle: 'Folytatás', content: '<p>Folytatás.</p>' },
};
const path: any[] = [
  { article: articles.anchor, segmentId: null, segmentTitle: null },
  { article: articles.ch1, segmentId: 'book', segmentTitle: 'A regény' },
  { article: articles.ch2, segmentId: 'book', segmentTitle: 'A regény' },
];

test('book segment introduction appears once and explains its historical anchor', () => {
  assert.match(segmentIntroduction(path, 1, articles)?.explanation ?? '', /Tristram bukása/);
  assert.match(segmentIntroduction(path, 1, articles)?.summary ?? '', /hősök továbbindulnak/);
  assert.equal(segmentIntroduction(path, 2, articles), null);
});

test('story recap only contains previous units with readable plain summaries', () => {
  assert.deepEqual(storyRecap(path, 2), [{ id: 'anchor', title: 'Tristram bukása', kind: 'Fő történet', summary: 'A város elbukott.' }, { id: 'ch1', title: 'Első fejezet', kind: 'Könyv', summary: 'Kezdet.' }]);
  assert.equal(conciseText('<p>Biztonságos <strong>szöveg</strong>.</p>'), 'Biztonságos szöveg.');
});
