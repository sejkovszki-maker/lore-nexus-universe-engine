import test from 'node:test';
import assert from 'node:assert/strict';
import { unzipSync, strFromU8 } from 'fflate';
import { createEpub, epubFileName } from '../../src/wiki/epub-export.ts';

test('EPUB export contains ordered Hungarian chapters and required EPUB files', async () => {
  const blob = await createEpub({
    id: 'witcher-test',
    title: 'Árvíztűrő tükörfúrógép',
    language: 'hu',
    chapters: [
      { id: 'first', title: 'Első fejezet', content: '<p>Magyar próbaszöveg.</p>' },
      { id: 'second', title: 'Második fejezet', content: '<p>Folytatás.</p>' },
    ],
  });
  assert.equal(blob.type, 'application/epub+zip');
  const files = unzipSync(new Uint8Array(await blob.arrayBuffer()));
  assert.equal(strFromU8(files.mimetype), 'application/epub+zip');
  assert.ok(files['META-INF/container.xml']);
  assert.ok(files['EPUB/package.opf']);
  assert.match(strFromU8(files['EPUB/nav.xhtml']), /Első fejezet[\s\S]*Második fejezet/u);
  assert.match(strFromU8(files['EPUB/text/chapter-1.xhtml']), /Magyar próbaszöveg/u);
  assert.equal(epubFileName('Árvíztűrő tükörfúrógép'), 'arvizturo-tukorfurogep.epub');
});

test('EPUB export rejects empty books and strips executable markup', async () => {
  await assert.rejects(() => createEpub({ id: 'empty', title: 'Üres', chapters: [] }), /EPUB_EMPTY_BOOK/u);
  const blob = await createEpub({ id: 'safe', title: 'Biztonságos', chapters: [{ id: 'one', title: 'Egy', content: '<script>alert(1)</script><p onclick="alert(1)">Szöveg</p>' }] });
  const chapter = strFromU8(unzipSync(new Uint8Array(await blob.arrayBuffer()))['EPUB/text/chapter-1.xhtml']);
  assert.doesNotMatch(chapter, /script|onclick|alert\(1\)/u);
  assert.match(chapter, /Szöveg/u);
});
