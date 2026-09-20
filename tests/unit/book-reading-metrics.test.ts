import test from 'node:test';
import assert from 'node:assert/strict';
import { estimatedReadingMinutes, filterChapters, plainWordCount } from '../../src/wiki/book-reading-metrics.ts';

test('a becslés HTML helyett az olvasható szavakat számolja',()=>{
  assert.equal(plainWordCount('<p>Első &amp; második szó.</p>'),3);
  assert.equal(estimatedReadingMinutes([{id:'a',title:'A',content:`<p>${'szó '.repeat(440)}</p>`}]),2);
});

test('a fejezetkeresés magyar kis- és nagybetűtől független',()=>{
  const chapters=[{title:'Első fejezet'},{title:'Árnyak útja'}];
  assert.deepEqual(filterChapters(chapters,'árny').map(item=>item.title),['Árnyak útja']);
  assert.equal(filterChapters(chapters,'').length,2);
});
