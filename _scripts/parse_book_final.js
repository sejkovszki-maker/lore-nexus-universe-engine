/**
 * Diablo Wiki – Robusztus Könyvfeldolgozó Szkript
 * 
 * Felhasználás:
 *   node parse_book_final.js
 * 
 * Kimenet:
 *   <book_slug>_chapters.json  –  JSON tömb, minden fejezet egy wikiArticle objektum
 * 
 * A JSON közvetlenül betölthető a wiki adatbázisába (data.js).
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// KONFIGURÁCIÓ – módosítsd a könyvnek megfelelően
// ============================================================
const CONFIG = {
  inputFile: 'A gonosz osvenye - Ismeretlen.txt',
  bookSlug: 'gonosz-osvenye',
  bookTitle: 'A Gonosz Ösvénye',
  category: 'Könyvek – Olvasó',
  minParagraphLength: 25,  // rövidebb sorok kihagyva (fejezet-feliratok stb.)
};

// ============================================================
// SEGÉDFÜGGVÉNYEK
// ============================================================

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Magyar sorszámok és fejezet-jelölők felismerése
 */
const CHAPTER_PATTERN = /^(Első|Második|Harmadik|Negyedik|Ötödik|Hatodik|Hetedik|Nyolcadik|Kilencedik|Tizedik|Tizenegyedik|Tizenkettedik|Tizenharmadik|Tizennégyedik|Tizenötödik|Tizenhatodik|Tizenhetedik|Tizennyolcadik|Tizenkilencedik|Huszadik|Huszonegyedik|Huszonkettedik|Huszonharmadik|Huszonnegyedik|Huszonötödik|Harminc\w*)\s*fejeze[tTí]/i;

const ROMAN_PATTERN = /^(I{1,3}|IV|V|VI{0,3}|IX|X{1,3}|XI{0,3}|XIV|XV|XVI{0,3}|XIX|XX)\.?\s*$/;

const CHAPTER_DIGIT_PATTERN = /^(\d{1,2})\.?\s*fejeze[tT]/i;

const PROLOG_EPILOG_PATTERN = /^(Prológus|Epilógus|Bevezető|Bevezetés|Utószó)\s*\.?$/i;

const MAGIC_CHAPTER_PATTERNS = [CHAPTER_PATTERN, CHAPTER_DIGIT_PATTERN, PROLOG_EPILOG_PATTERN];

const HUNGARIAN_ORDINALS = [
  '', 'Első', 'Második', 'Harmadik', 'Negyedik', 'Ötödik',
  'Hatodik', 'Hetedik', 'Nyolcadik', 'Kilencedik', 'Tizedik',
  'Tizenegyedik', 'Tizenkettedik', 'Tizenharmadik', 'Tizennégyedik',
  'Tizenötödik', 'Tizenhatodik', 'Tizenhetedik', 'Tizennyolcadik',
  'Tizenkilencedik', 'Huszadik', 'Huszonegyedik', 'Huszonkettedik',
  'Huszonharmadik', 'Huszonnegyedik', 'Huszonötödik'
];

/**
 * Fejezet-határok felismerése
 * Visszaad egy tömböt: { startLine, title, type }
 */
function detectChapters(lines) {
  const boundaries = [];

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const trimmed = l.trim();

    if (!trimmed) continue;

    // Prológus / Epilógus
    if (PROLOG_EPILOG_PATTERN.test(trimmed)) {
      boundaries.push({ startLine: i, title: trimmed, type: 'special' });
      continue;
    }

    // Magyar fejezet-felirat (pl. "Harmadik fejezet")
    if (CHAPTER_PATTERN.test(trimmed) && trimmed.length < 80) {
      boundaries.push({ startLine: i, title: trimmed, type: 'hungarian' });
      continue;
    }

    // Számjegyes fejezet-felirat (pl. "3. fejezet")
    if (CHAPTER_DIGIT_PATTERN.test(trimmed) && trimmed.length < 60) {
      boundaries.push({ startLine: i, title: trimmed, type: 'digit' });
      continue;
    }

    // Egymagában álló római szám (pl. "IV.")
    if (ROMAN_PATTERN.test(trimmed)) {
      boundaries.push({ startLine: i, title: `${trimmed}. fejezet`, type: 'roman' });
      continue;
    }
  }

  return boundaries;
}

/**
 * Fejezet tartalmának kinyerése és HTML paragrafusokká alakítása
 */
function extractChapterContent(lines, startLine, endLine) {
  const paragraphLines = lines
    .slice(startLine + 1, endLine)
    .map(l => l.trim())
    .filter(l => l.length >= CONFIG.minParagraphLength);

  if (paragraphLines.length === 0) return '<p><em>(Üres fejezet)</em></p>';

  return paragraphLines
    .map(l => `<p>${escapeHtml(l)}</p>`)
    .join('\n');
}

/**
 * Fejezetszám → olvasható cím (pl. 3 → "Harmadik fejezet")
 */
function buildChapterTitle(chapterTitle, idx) {
  const ordinal = HUNGARIAN_ORDINALS[idx + 1] || `${idx + 1}.`;
  // Ha az eredeti cím már értelmes, tartsuk meg
  if (chapterTitle && chapterTitle.length > 3 && chapterTitle.toLowerCase().includes('fejez')) {
    return chapterTitle;
  }
  return `${ordinal} fejezet`;
}

// ============================================================
// FŐ FELDOLGOZÁS
// ============================================================

function parseBook() {
  console.log(`\n📖 Könyvfeldolgozás indítása: "${CONFIG.inputFile}"`);

  if (!fs.existsSync(CONFIG.inputFile)) {
    console.error(`❌ Fájl nem található: ${CONFIG.inputFile}`);
    process.exit(1);
  }

  const rawContent = fs.readFileSync(CONFIG.inputFile, 'utf8');
  const lines = rawContent.split(/\r?\n/).map(l => l.trim());

  console.log(`   ✔ Sorok betöltve: ${lines.length}`);

  // Fejezet-határok azonosítása
  const boundaries = detectChapters(lines.filter(l => l.length > 0));
  // Re-build with original line numbers
  const originalLines = rawContent.split(/\r?\n/).map(l => l.trim());
  const chapterBoundaries = detectChapters(originalLines);

  console.log(`   ✔ Felismert fejezetek: ${chapterBoundaries.length}`);

  if (chapterBoundaries.length === 0) {
    console.warn('⚠️  Nem sikerült fejezeteket felismerni. Ellenőrizd a CHAPTER_PATTERN regexet.');
    console.warn('   A teljes könyv egy darabként lesz exportálva.');

    // Fallback: egyetlen cikk a teljes könyvből
    const singleArticle = [{
      id: `${CONFIG.bookSlug}-teljes`,
      category: CONFIG.category,
      title: `${CONFIG.bookTitle} – Teljes Tartalom`,
      subtitle: 'A könyv teljes szövege',
      infobox: {
        'Könyv': CONFIG.bookTitle,
        'Fejezetek': 'N/A',
        'Típus': 'Regény'
      },
      content: extractChapterContent(originalLines, 0, originalLines.length)
    }];

    writeOutput(singleArticle);
    return;
  }

  // Fejezetek feldolgozása
  const articles = chapterBoundaries.map((ch, idx) => {
    const nextBoundary = chapterBoundaries[idx + 1];
    const endLine = nextBoundary ? nextBoundary.startLine : originalLines.length;

    const chTitle = buildChapterTitle(ch.title, idx);
    const content = extractChapterContent(originalLines, ch.startLine, endLine);

    console.log(`   [${idx + 1}/${chapterBoundaries.length}] Sor ${ch.startLine}: "${chTitle}" (${(endLine - ch.startLine)} sor)`);

    return {
      id: `${CONFIG.bookSlug}-ch${idx + 1}`,
      category: CONFIG.category,
      title: `${CONFIG.bookTitle} – ${chTitle}`,
      subtitle: `${idx + 1}. fejezet / ${chapterBoundaries.length} fejezet összesen`,
      infobox: {
        'Könyv': CONFIG.bookTitle,
        'Fejezet': `${idx + 1} / ${chapterBoundaries.length}`,
        'Fejezetcím': chTitle,
        'Típus': 'Regény fejezet',
        'Kategória': CONFIG.category
      },
      content: content
    };
  });

  writeOutput(articles);
}

/**
 * JSON fájlba írás + statisztika
 */
function writeOutput(articles) {
  const outputFile = `${CONFIG.bookSlug}_chapters.json`;
  fs.writeFileSync(outputFile, JSON.stringify(articles, null, 2), 'utf8');

  const totalChars = articles.reduce((sum, a) => sum + a.content.length, 0);

  console.log(`\n✅ Sikeres feldolgozás!`);
  console.log(`   📄 Kimeneti fájl:  ${outputFile}`);
  console.log(`   📚 Fejezetek száma: ${articles.length}`);
  console.log(`   📝 Tartalom mérete: ${Math.round(totalChars / 1024)} KB`);
  console.log(`\n💡 Következő lépés: másold a JSON tömb tartalmát a data.js wikiArticles objektumába,`);
  console.log(`   vagy add hozzá a build.js szkripthez automatikus összefűzéshez.\n`);

  // Rövid előnézet az első cikkből
  if (articles.length > 0) {
    console.log(`📋 Első fejezet előnézete (${articles[0].id}):`);
    console.log(`   Cím:     ${articles[0].title}`);
    console.log(`   Alcím:   ${articles[0].subtitle}`);
    console.log(`   Tartalom (első 200 karakter):`);
    console.log(`   ${articles[0].content.substring(0, 200).replace(/\n/g, ' ')}...`);
  }
}

// INDÍTÁS
parseBook();
