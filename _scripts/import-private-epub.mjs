import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const [inputArgument, outputArgument] = process.argv.slice(2);
if (!inputArgument || !outputArgument) {
  console.error('Usage: node _scripts/import-private-epub.mjs <input.epub> <output.json>');
  process.exit(2);
}

const input = resolve(inputArgument);
const output = resolve(outputArgument);
if (!input.toLowerCase().endsWith('.epub')) throw new Error('Only EPUB input is supported.');

const calibre = process.platform === 'win32' ? 'C:\\Program Files\\Calibre2\\ebook-convert.exe' : 'ebook-convert';
const work = join(tmpdir(), `lore-nexus-epub-${process.pid}-${Date.now()}`);
const extracted = join(work, 'book.txt');
await mkdir(work, { recursive: true });

const numberNames = ['ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE','TEN','ELEVEN','TWELVE','THIRTEEN','FOURTEEN','FIFTEEN','SIXTEEN','SEVENTEEN','EIGHTEEN','NINETEEN','TWENTY','TWENTY ONE','TWENTY TWO','TWENTY THREE','TWENTY FOUR'];
const escapeHtml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const hungarianWords = new Set('a az és hogy nem egy is de vagy volt van meg már mint aki ami akkor csak még ezt azt ő ők én te mi mert után előtt fel le be ki el sem nagyon majd pedig amikor ahol ezért illetve volna lehet kell mondta kérdezte felelte'.split(' '));
const englishWords = new Set('the a an and that not one is but or was are were have has had with from into for of to in on at as he she they it his her their said asked then when where would could should'.split(' '));
function isHungarian(value) {
  const words = value.toLocaleLowerCase('hu').match(/[\p{L}]+/gu) ?? [];
  let hu = (value.match(/[áéíóöőúüűÁÉÍÓÖŐÚÜŰ]/g) ?? []).length * 2;
  let en = 0;
  for (const word of words) {
    if (hungarianWords.has(word)) hu += 2;
    if (englishWords.has(word)) en += 2;
  }
  return hu > en;
}
function paragraphs(value) {
  const blocks = value.split(/\n\s*\n/).map(item => item.replace(/\s+/g, ' ').trim()).filter(item => item && !/^oceanofpdf\.com$/i.test(item));
  const kept = blocks.filter(isHungarian);
  if (kept.length < Math.floor(blocks.length * 0.35)) throw new Error('Hungarian extraction removed too much content.');
  return kept.map(item => `<p>${escapeHtml(item)}</p>`).join('');
}

try {
  execFileSync(calibre, [input, extracted, '--txt-output-formatting', 'plain'], { stdio: 'pipe' });
  const text = (await readFile(extracted, 'utf8')).replaceAll('\r\n', '\n');
  const markers = [...text.matchAll(/^(?:CHAPTER (ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|ELEVEN|TWELVE|THIRTEEN|FOURTEEN|FIFTEEN|SIXTEEN|SEVENTEEN|EIGHTEEN|NINETEEN|TWENTY(?: ONE| TWO| THREE| FOUR)?)|(EPILOGUE))\s*$/gm)];
  if (markers.length !== 25) throw new Error(`Expected 25 reading sections, found ${markers.length}.`);
  const sourceSha256 = createHash('sha256').update(await readFile(input)).digest('hex');
  const now = Date.now();
  const bookId = 'the-lost-horadrim';
  const articles = [{
    id: bookId,
    title: 'The Lost Horadrim – Az elveszett Horadrim',
    subtitle: 'Magyar szöveg · 24 fejezet és epilógus',
    category: 'Könyvek – Olvasó',
    content: `<h2>Bibliográfia</h2><p><strong>Szerző:</strong> Matthew J. Kirby<br><strong>Kiadó:</strong> Random House Worlds<br><strong>Megjelenés:</strong> 2026. április 21.<br><strong>ISBN:</strong> 9780425284896</p><h2>Spoilermentes ismertető</h2><p>A Horadrim rend fennmaradása veszélybe kerül, ezért Lorath vezetésével a távoli Skovos-szigetekre indulnak. Egy korábban eltűnt mágusexpedíció és egy elrejtett páncélterem nyomát követik, miközben az amazonok saját politikai válsággal és egy több irányból támadó élőhalott lénnyel néznek szembe.</p><p>Lorath és Adreona kapitány kénytelen szövetséget kötni, mert a szigeteken kibontakozó fenyegetés nemcsak Skovost, hanem egész Sanctuaryt veszélyeztetheti.</p><h2>Történeti jelentőség</h2><p>A kiadó hivatalosan a <em>Diablo IV: Lord of Hatred</em> előzményregényeként azonosítja. A történet a <em>Diablo IV: Vessel of Hatred</em> eseményei után következik.</p><h2>Helyi könyvpéldány</h2><p>A teljes magyar szöveg kizárólag ezen az eszközön, a privát könyvtárból olvasható.</p><h2>Feldolgozás</h2><p>Forrásfájl: ${escapeHtml(basename(input))}<br>Nyelv: magyar<br>Forrás-ellenőrző összeg: ${sourceSha256}</p>`,
    relatedArticles: ['diablo-4-loh', 'horadrim-order', 'skovos'],
    type: 'book', parentBook: undefined, universeId: 'diablo', universeLabel: 'Diablo',
    storyAfter: 'diablo-4-voh', publicationStatus: 'local-draft', version: 1, lastEdited: now,
  }];
  for (const [index, marker] of markers.entries()) {
    const start = marker.index + marker[0].length;
    const end = markers[index + 1]?.index ?? text.search(/^ACKNOWLEDGMENTS\s*$/m);
    const body = text.slice(start, end > start ? end : undefined).trim();
    if (body.length < 1000) throw new Error(`Reading section ${index + 1} is unexpectedly short.`);
    const isEpilogue = marker[2] === 'EPILOGUE';
    const chapterNumber = isEpilogue ? 25 : numberNames.indexOf(marker[1]) + 1;
    articles.push({
      id: `${bookId}-ch${String(chapterNumber).padStart(2, '0')}`,
      title: isEpilogue ? 'The Lost Horadrim – Az elveszett Horadrim – Epilógus' : `The Lost Horadrim – Az elveszett Horadrim – ${chapterNumber}. fejezet`,
      category: 'Könyvek – Olvasó', content: paragraphs(body), relatedArticles: ['the-lost-horadrim'],
      type: 'chapter', parentBook: bookId, universeId: 'diablo', universeLabel: 'Diablo',
      publicationStatus: 'local-draft', version: 1, lastEdited: now + index + 1,
    });
  }
  const payloadSha256 = createHash('sha256').update(JSON.stringify(articles)).digest('hex');
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify({ format: 'lore-nexus-private-library', schemaVersion: 1, payloadSha256, articles }), 'utf8');
  console.log(JSON.stringify({ input, output, sourceSha256, articles: articles.length, chapters: markers.length, characters: text.length }));
} finally {
  await rm(work, { recursive: true, force: true });
}
