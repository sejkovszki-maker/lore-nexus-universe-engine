import test from 'node:test';
import assert from 'node:assert/strict';
import { chapterCompletion, filterAndSortBooks } from '../../src/wiki/book-library-view.ts';

const books=[{id:'a',title:'Árnyak',chapters:[{id:'a1'},{id:'a2'}]},{id:'b',title:'Bűn',chapters:[{id:'b1'}]}];
const progress={
  'diablo:a':{universeId:'diablo',bookId:'a',chapterId:'a1',scrollY:0,updatedAt:10,bookmarks:[],status:'reading' as const},
  'diablo:b':{universeId:'diablo',bookId:'b',chapterId:'b1',scrollY:0,updatedAt:20,bookmarks:[],status:'completed' as const},
};

test('fejezetszintű előrehaladást számol és a befejezést 100%-nak jelöli',()=>{
  assert.equal(chapterCompletion(books[0],progress['diablo:a']),50);
  assert.equal(chapterCompletion(books[1],progress['diablo:b']),100);
  assert.equal(chapterCompletion(books[0]),0);
});

test('címre és állapotra szűr, valamint legutóbbi olvasás szerint rendez',()=>{
  assert.deepEqual(filterAndSortBooks(books,progress,'diablo','ár','all','chronology').map(book=>book.id),['a']);
  assert.deepEqual(filterAndSortBooks(books,progress,'diablo','','completed','chronology').map(book=>book.id),['b']);
  assert.deepEqual(filterAndSortBooks(books,progress,'diablo','','all','recent').map(book=>book.id),['b','a']);
});
