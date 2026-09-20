import test from 'node:test';
import assert from 'node:assert/strict';
import { exportPersonalBackup, importPersonalBackup } from '../../src/wiki/personal-backup.ts';

function memoryStorage(seed: Record<string, string> = {}) {
  const data = new Map(Object.entries(seed));
  return { get length(){return data.size;}, key:(index:number)=>[...data.keys()][index]??null, getItem:(key:string)=>data.get(key)??null, setItem:(key:string,value:string)=>{data.set(key,value);}, removeItem:(key:string)=>data.delete(key), clear:()=>data.clear() } as Storage;
}

test('a személyes mentés visszaállítja az olvasási adatokat és beállításokat', () => {
  const source=memoryStorage({
    'lore-nexus:book-progress:v1':JSON.stringify({'diablo:book':{universeId:'diablo',bookId:'book',chapterId:'chapter',scrollY:5,updatedAt:10,bookmarks:[],status:'reading'}}),
    'lore-nexus:book-reader-settings:v1':JSON.stringify({fontScale:1.2,lineHeight:2,columnWidth:80,theme:'parchment'}),
    'lore-nexus:story-books:v1':'true',
  });
  const target=memoryStorage();
  const restored=importPersonalBackup(JSON.stringify(exportPersonalBackup(source)),target);
  assert.equal(restored.progress['diablo:book'].scrollY,5);
  assert.equal(restored.settings.theme,'parchment');
  assert.equal(target.getItem('lore-nexus:story-books:v1'),'true');
});

test('az idegen formátumot módosítás nélkül elutasítja', () => {
  const target=memoryStorage({'keep':'yes'});
  assert.throws(()=>importPersonalBackup('{}',target));
  assert.equal(target.getItem('keep'),'yes');
});

test('írási hiba esetén visszaállítja a korábbi adatokat', () => {
  const source=memoryStorage({'lore-nexus:book-progress:v1':'{}'});
  const normal=memoryStorage({'lore-nexus:book-progress:v1':'{"regi":true}'});
  let writes=0;
  const failing={...normal,setItem:(key:string,value:string)=>{writes++;if(writes===2)throw new Error('QUOTA');normal.setItem(key,value);}} as Storage;
  assert.throws(()=>importPersonalBackup(JSON.stringify(exportPersonalBackup(source)),failing));
  assert.equal(normal.getItem('lore-nexus:book-progress:v1'),'{"regi":true}');
});
