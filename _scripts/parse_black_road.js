const fs = require('fs');

const fileContent = fs.readFileSync('c:\\Users\\Lezli\\Desktop\\Diablo\\A gonosz osvenye - Ismeretlen.txt', 'utf8');
const lines = fileContent.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

let chapters = [];
let currentChapter = null;
let currentChapterNumber = 0;

let chapterRegex = /^(Első|Második|Harmadik|Negyedik|Ötödik|Hatodik|Hetedik|Nyolcadik|Kilencedik|Tizedik|Tizenegyedik|Tizenkettedik|Tizenharmadik|Tizennégyedik|Tizenötödik|Tizenhatodik|Tizenhetedik|Tizennyolcadik|Tizenkilencedik|Huszadik|Huszonegyedik|Huszonkettedik|Huszonharmadik|Huszonnegyedik|Huszonötödik)\s*fejezet/i;
let epilogueRegex = /^Epilógus/i;

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    let match = line.match(chapterRegex);
    let matchEpilogue = line.match(epilogueRegex);
    
    if (match || matchEpilogue) {
        if (currentChapter) {
            chapters.push(currentChapter);
        }
        
        currentChapterNumber++;
        let title = line;
        
        currentChapter = { number: currentChapterNumber, title: title, content: [] };
        continue;
    }

    if (currentChapter) {
        if (line.match(/^DIABLO/i) || line.match(/^A Gonosz ösvénye/i) || line.match(/^MEL ODOM/i)) continue;
        
        // simple paragraph logic
        if (line.length > 0) {
            currentChapter.content.push(line);
        }
    }
}
if (currentChapter) chapters.push(currentChapter);

let categoryStr = "Lore / Könyvek - Olvasó";
let titleBase = "A Gonosz Ösvénye - ";
let subtitleBase = "Mel Odom: A gonosz ösvénye (";
let szerzoStr = "Szerző";
let mufajStr = "Műfaj";
let regenyStr = "Hivatalos Diablo Regény";

let out = [];
out.push("/* BLACK ROAD ARTICLES */");

// Hungarian numbers map 1-based (index 0 is dummy)
let words = ['', 'EGY', 'KETTŐ', 'HÁROM', 'NÉGY', 'ÖT', 'HAT', 'HÉT', 'NYOLC', 'KILENC', 'TÍZ', 'TIZENEGY', 'TIZENKETTŐ', 'TIZENHÁROM', 'TIZENNÉGY', 'TIZENÖT', 'TIZENHAT', 'TIZENHÉT', 'TIZENNYOLC', 'TIZENKILENC', 'HUSZ', 'HUSZONEGY', 'HUSZONKETTŐ', 'HUSZONHÁROM', 'HUSZONNÉGY', 'HUSZONÖT', 'EPILÓGUS'];

for (let i = 0; i < chapters.length; i++) {
    let ch = chapters[i];
    let num = i + 1;
    let id = num <= 25 ? `black-road-ch${num}` : `black-road-epilogue`;
    let title = num <= 25 ? `${titleBase}${num}. Fejezet` : `${titleBase}Epilógus`;
    
    let word = num <= 26 ? words[num] : num.toString();
    
    let subtitle = num <= 25 ? `${subtitleBase}${word})` : `${subtitleBase}Zárszó)`;
    
    out.push(`  "${id}": {`);
    out.push(`    id: "${id}",`);
    out.push(`    category: "${categoryStr}",`);
    out.push(`    title: "${title}",`);
    out.push(`    subtitle: "${subtitle}",`);
    out.push(`    infobox: {`);
    out.push(`      "${szerzoStr}": "Mel Odom",`);
    out.push(`      "${mufajStr}": "${regenyStr}",`);
    out.push(`      "Fejezet": "${word}"`);
    out.push(`    },`);
    out.push(`    content: \``);
    
    for (let p of ch.content) {
        if (p.startsWith('- ')) p = p.substring(2);
        p = p.replace(/`/g, '\\`').replace(/\$/g, '\\$');
        out.push(`<p>${p}</p>`);
    }
    
    out.push(`\``);
    out.push(`  },`);
}

fs.writeFileSync('c:\\Users\\Lezli\\Desktop\\Diablo\\black_road_articles.js', out.join('\n'), 'utf8');
console.log("Black Road JS generated!");
