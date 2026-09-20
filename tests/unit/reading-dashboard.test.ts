import test from 'node:test';
import assert from 'node:assert/strict';
import { latestReadingItem } from '../../src/wiki/reading-dashboard.ts';

function memoryStorage(seed: Record<string, string> = {}) {
  const data = new Map(Object.entries(seed));
  return { get length(){return data.size;}, key:(index:number)=>[...data.keys()][index]??null, getItem:(key:string)=>data.get(key)??null, setItem:(key:string,value:string)=>data.set(key,value), removeItem:(key:string)=>data.delete(key), clear:()=>data.clear() } as Storage;
}

const articles = {
  book: { id:'book', title:'Könyv', category:'Könyv', content:'', lastEdited:1 },
  chapter: { id:'chapter', title:'Első fejezet', category:'Fejezet', content:'', lastEdited:1 },
  story: { id:'story', title:'Történeti pont', category:'Történet', content:'', lastEdited:1 },
};

test('a legfrissebb érvényes olvasási pontot választja', () => {
  const storage=memoryStorage({
    'lore-nexus:book-progress:v1':JSON.stringify({'diablo:book':{universeId:'diablo',bookId:'book',chapterId:'chapter',scrollY:12,updatedAt:10,bookmarks:[]}}),
    'lore-nexus:story-progress:v1:diablo':JSON.stringify({articleId:'story',scrollY:0,updatedAt:20}),
  });
  assert.deepEqual(latestReadingItem('diablo',articles,storage)?.kind,'story');
});

test('a sérült történeti állapotot figyelmen kívül hagyja', () => {
  const storage=memoryStorage({'lore-nexus:story-progress:v1:diablo':'{hibás'});
  assert.equal(latestReadingItem('diablo',articles,storage),undefined);
});
