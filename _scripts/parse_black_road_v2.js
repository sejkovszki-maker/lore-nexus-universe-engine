const fs = require('fs');

const fileContent = fs.readFileSync('A gonosz osvenye - Ismeretlen.txt', 'utf8');
const lines = fileContent.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

const HUN_NUMS = {
  'Első': 1, 'Második': 2, 'Harmadik': 3, 'Negyedik': 4, 'Ötödik': 5,
  'Hatodik': 6, 'Hetedik': 7, 'Nyolcadik': 8, 'Kilencedik': 9, 'Tizedik': 10,
  'Tizenegyedik': 11, 'Tizenkettedik': 12, 'Tizenharmadik': 13, 'Tizennégyedik': 14,
  'Tizenötödik': 15, 'Tizenhatodik': 16, 'Tizenhetedik': 17, 'Tizennyolcadik': 18,
  'Tizenkilencedik': 19, 'Huszadik': 20, 'Huszonegyedik': 21, 'Huszonkettedik': 22,
  'Huszonharmadik': 23, 'Huszonnegyedik': 24, 'Huszonötödik': 25
};

// Known chapter boundary line indices (0-indexed from filtered lines)
// From debug_chapters.js output - using actual line indices
const BOUNDARIES = [
  { lineIdx: 17, chNum: 1, startsAfterInline: false },
  { lineIdx: 176, chNum: 2, startsAfterInline: true },  // inline at end of prev content
  { lineIdx: 278, chNum: 3, startsAfterInline: true },
  { lineIdx: 530, chNum: 5, startsAfterInline: false },
  { lineIdx: 672, chNum: 6, startsAfterInline: true },
  { lineIdx: 916, chNum: 7, startsAfterInline: false },
  { lineIdx: 1196, chNum: 9, startsAfterInline: false },
  { lineIdx: 1486, chNum: 11, startsAfterInline: false },
  { lineIdx: 1627, chNum: 12, startsAfterInline: true },
  { lineIdx: 1823, chNum: 13, startsAfterInline: true },
  { lineIdx: 2179, chNum: 15, startsAfterInline: false },
  { lineIdx: 2329, chNum: 16, startsAfterInline: false },
  { lineIdx: 2484, chNum: 17, startsAfterInline: false },
  { lineIdx: 2836, chNum: 18, startsAfterInline: false },
  { lineIdx: 3037, chNum: 19, startsAfterInline: false },
  { lineIdx: 3167, chNum: 20, startsAfterInline: true },
  { lineIdx: 3457, chNum: 22, startsAfterInline: true },
  { lineIdx: 3803, chNum: 24, startsAfterInline: false },
  { lineIdx: 3980, chNum: 25, startsAfterInline: false },
  { lineIdx: 4205, chNum: 26, startsAfterInline: false } // Epilogue
];

// Missing chapters that need to be filled in (4, 8, 10, 14, 21, 23)
// They actually start AFTER the previous chapter's inline marker
// We'll build chapters using the boundaries as separators

let chapters = [];

for (let b = 0; b < BOUNDARIES.length; b++) {
  let boundary = BOUNDARIES[b];
  let nextBoundary = BOUNDARIES[b + 1];
  
  let startLine = boundary.startsAfterInline ? boundary.lineIdx + 1 : boundary.lineIdx + 1;
  let endLine = nextBoundary ? nextBoundary.lineIdx : lines.length;
  
  // The content is between startLine and endLine
  // For inline markers, the last line of previous chapter contains the marker
  // so startLine is correct (the NEXT line after the marker)
  
  let content = [];
  for (let i = startLine; i < endLine; i++) {
    let line = lines[i];
    // Skip the chapter marker from the line if it's inline
    if (nextBoundary && nextBoundary.startsAfterInline && i === endLine - 1) {
      // This line has the next chapter marker at the end - strip it
      let inlinePattern = /(Első|Második|Harmadik|Negyedik|Ötödik|Hatodik|Hetedik|Nyolcadik|Kilencedik|Tizedik|Tizenegyedik|Tizenkettedik|Tizenharmadik|Tizennégyedik|Tizenötödik|Tizenhatodik|Tizenhetedik|Tizennyolcadik|Tizenkilencedik|Huszadik|Huszonegyedik|Huszonkettedik|Huszonharmadik|Huszonnegyedik|Huszonötödik)\s*fejeze[tTíi]/i;
      let m = line.match(inlinePattern);
      if (m) {
        let cleanLine = line.substring(0, line.lastIndexOf(m[0])).trim();
        if (cleanLine.length > 10) content.push(cleanLine);
      } else {
        content.push(line);
      }
    } else {
      content.push(line);
    }
  }
  
  chapters.push({ chNum: boundary.chNum, content: content });
}

const HUN_WORDS = ['', 'EGY', 'KETTŐ', 'HÁROM', 'NÉGY', 'ÖT', 'HAT', 'HÉT', 'NYOLC', 'KILENC', 'TÍZ',
  'TIZENEGY', 'TIZENKETTŐ', 'TIZENHÁROM', 'TIZENNÉGY', 'TIZENÖT', 'TIZENHAT', 'TIZENHÉT',
  'TIZENNYOLC', 'TIZENKILENC', 'HUSZ', 'HUSZONEGY', 'HUSZONKETTŐ', 'HUSZONHÁROM', 'HUSZONNÉGY', 'HUSZONÖT', 'EPILÓGUS'];

let out = ['/* BLACK ROAD ARTICLES COMPLETE */'];

for (let ch of chapters) {
  let num = ch.chNum;
  let id = num <= 25 ? `black-road-ch${num}` : `black-road-epilogue`;
  let title = num <= 25 ? `A Gonosz Ösvénye - ${num}. Fejezet` : `A Gonosz Ösvénye - Epilógus`;
  let word = HUN_WORDS[num] || 'EPILÓGUS';
  let subtitle = num <= 25 ? `Mel Odom: A gonosz ösvénye (${word})` : `Mel Odom: A gonosz ösvénye (Zárszó)`;
  
  let htmlContent = ch.content
    .filter(p => p.length > 5)
    .map(p => {
      p = p.replace(/`/g, "'").replace(/\$/g, '\\$');
      return `<p>${p}</p>`;
    })
    .join('\n');
  
  out.push(`  "${id}": {`);
  out.push(`    id: "${id}",`);
  out.push(`    category: "Lore / Könyvek - Olvasó",`);
  out.push(`    title: "${title}",`);
  out.push(`    subtitle: "${subtitle}",`);
  out.push(`    infobox: {`);
  out.push(`      "Szerző": "Mel Odom",`);
  out.push(`      "Műfaj": "Hivatalos Diablo Regény",`);
  out.push(`      "Fejezet": "${word}"`);
  out.push(`    },`);
  out.push(`    content: \``);
  out.push(htmlContent);
  out.push(`\``);
  out.push(`  },`);
}

fs.writeFileSync('black_road_articles_v2.js', out.join('\n'), 'utf8');
console.log(`Done! ${chapters.length} chapters written`);
chapters.forEach(c => console.log(`  ch${c.chNum}: ${c.content.length} paragraphs`));
