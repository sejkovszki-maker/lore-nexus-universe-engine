import test from 'node:test';
import assert from 'node:assert/strict';
import { addStableHeadingIds, articleQualitySummary } from '../../src/wiki/article-presentation.ts';

test('stabil és ütközésmentes tartalomjegyzék-azonosítókat készít',()=>{
  const result=addStableHeadingIds('<h2>Első rész</h2><p>x</p><h3>Első rész</h3>');
  assert.deepEqual(result.headings.map(item=>item.id),['elso-resz','elso-resz-2']);
  assert.match(result.html,/id="elso-resz-2"/u);
});

test('a cikkminőség csak meglévő, ellenőrizhető elemekből számol',()=>{
  const article={id:'a',title:'A',category:'Lore',content:`<h2>Források</h2><p>${'tartalom '.repeat(200)}</p>`,infobox:{Kor:'Ősi',Világ:'Sanctuary'}};
  const result=articleQualitySummary(article,2,1);
  assert.equal(result.score,100);assert.equal(result.label,'Erős');
});
