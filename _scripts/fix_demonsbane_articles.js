const fs = require('fs');

const fileContent = fs.readFileSync('c:\\Users\\Lezli\\Desktop\\Diablo\\Demon tanfolyam.txt', 'utf8');
const lines = fileContent.split(/\r?\n/);

let validLines = [];
for (let line of lines) {
    let trimmed = line.trim();
    if (trimmed.length > 0) {
        validLines.push(trimmed);
    }
}

let chapters = [];
let currentChapter = null;

let chapterSummaryRegex = /^(\d+)\.\s*fejezet\s*összefoglalás(a)?\s*:/i;
let quotesRegex = /^\d+\.\s*fejezet\s*\|\s*Idézetek/i;
let qaRegex = /^\d+\.\s*fejezet\s*\|.*Kérdések/i;
let quizRegex = /^\d+\.\s*fejezet\s*\|.*Kvíz/i;
let stopRegex = /^(Kritikus gondolkodás|ihlet|Kritikai értelmezés|Kulcspont|Legjobb idézetek)/i;

// Regex to detect English lines (simple heuristic: if it contains english specific words or starts with Chapter)
let isEnglish = (line) => {
    if (line.match(/^Chapter \d+/i)) return true;
    if (line.match(/^Title Chapter/i)) return true;
    if (line.match(/^Section Content/i)) return true;
    if (line.match(/^Battle and Disorientation/i)) return true;
    if (line.match(/^Encounters with Death/i)) return true;
    if (line.match(/^Guidance from the/i)) return true;
    if (line.match(/^Critical Thinking/i)) return true;
    if (line.match(/^Critical Interpretation/i)) return true;
    if (line.match(/^Key Point/i)) return true;
    if (line.match(/^Betrayal and Darkness/i)) return true;
    if (line.match(/^Vengeance and Redemption/i)) return true;
    if (line.match(/In this chapter/i)) return true;
    if (line.match(/Siggard wakes up/i)) return true;
    // We can also just ignore lines that we don't want
    return false;
};

for (let i = 0; i < validLines.length; i++) {
    let line = validLines[i];
    
    let match = line.match(chapterSummaryRegex);
    if (match) {
        if (line.includes("AZ ÉJSZAKA") && !line.toLowerCase().includes("lelkek")) continue;
        
        if (currentChapter) {
            if (currentChapter.number === match[1] && currentChapter.content.length === 0) {
                // don't push, just replace
            } else {
                chapters.push(currentChapter);
            }
        }
        
        let title = line.replace(chapterSummaryRegex, '').trim();
        title = title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
        
        currentChapter = { number: match[1], title: title, content: [] };
        continue;
    }
    
    if (line.match(quotesRegex) || line.match(qaRegex) || line.match(quizRegex) || line.match(stopRegex) || line.match(/^Cím 1\. fejezet/i)) {
        if (currentChapter) {
            chapters.push(currentChapter);
            currentChapter = null;
        }
        continue;
    }

    if (currentChapter) {
        if (line.match(/^\d+\.\s*fejezet:/i)) continue;
        if (line.match(/^Ebben a fejezetben/i) && line.length < 30) continue;
        if (line.match(/Section Content/i) || line.match(/Szakasz tartalma/i) || line.match(/Főbb események és témák/i) || line.match(/Témák és karakterfejlődések/i)) continue;
        if (line.match(/^Title Chapter/i) || line.match(/^Protagonist/i) || line.match(/^Setting /i)) continue;
        if (line.match(/^A Haditanács$/i) || line.match(/^Taktika és előkészületek$/i) || line.match(/^Egy növekvő fenyegetés$/i) || line.match(/^Kétségbeesés és kinyilatkoztatás$/i) || line.match(/^Záró gondolatok$/i) || line.match(/^Egy új kezdet$/i)) {
            currentChapter.content.push(`<strong>${line}</strong>`);
            continue;
        }
        if (line.match(/^Summary Themes and Character/i)) continue;
        
        line = line.replace(/Install Bookey App to Unlock Full Text and/gi, '');
        line = line.replace(/Audio ripped from him/gi, '');
        
        // Remove English lines (since it's a bilingual file, usually English comes first then Hungarian, or vice versa)
        // If line contains mostly English words, skip it. We'll check for Hungarian chars to be safe.
        // Actually, since we parse all valid lines, let's just filter out pure English sentences.
        // A simple way: check if the line from the original file was odd or even? But the alignment is broken.
        // Let's check if the previous line is the English version of this line.
        // Or better yet, we just check if it contains Hungarian characters. If a line is long and has no áéíóöőúüű, it's likely English.
        let huChars = (line.match(/[áéíóöőúüűÁÉÍÓÖŐÚÜŰ]/g) || []).length;
        if (line.length > 50 && huChars === 0) {
            // Probably English, skip
            continue;
        }
        // Also skip known short english lines
        if (isEnglish(line)) continue;
        
        line = line.trim();
        if (line.length > 0) {
            // Deduplicate: if the last pushed content is exactly the same, skip
            if (currentChapter.content.length > 0 && currentChapter.content[currentChapter.content.length - 1] === line) {
                continue;
            }
            currentChapter.content.push(line);
        }
    }
}
if (currentChapter) chapters.push(currentChapter);

let categoryStr = "Lore / Könyvek - Olvasó";
let titleBase = "Démonok Csapása - ";
let subtitleBase = "Robert B. Marks: Démonok Csapása (";
let szerzoStr = "Szerző";
let mufajStr = "Műfaj";
let regenyStr = "Hivatalos Diablo Regény";

let out = [];
out.push("/* DEMONSBANE ARTICLES */");

let words = ['', 'EGY', 'KETTŐ', 'HÁROM', 'NÉGY', 'ÖT', 'HAT', 'HÉT', 'NYOLC', 'KILENC', 'TÍZ', 'TIZENEGY'];

let dedupChapters = {};
for (let ch of chapters) {
    dedupChapters[ch.number] = ch; // Last one wins if duplicates
}

for (let i = 1; i <= 11; i++) {
    let ch = dedupChapters[i.toString()];
    if (!ch) continue;
    let num = parseInt(ch.number);
    let id = `demonsbane-ch${num}`;
    let title = `${titleBase}${num}. Fejezet`;
    let word = num <= 11 ? words[num] : num.toString();
    let subtitle = `${subtitleBase}${word})`;
    
    out.push(`  "${id}": {`);
    out.push(`    id: "${id}",`);
    out.push(`    category: "${categoryStr}",`);
    out.push(`    title: "${title}",`);
    out.push(`    subtitle: "${subtitle}",`);
    out.push(`    infobox: {`);
    out.push(`      "${szerzoStr}": "Robert B. Marks",`);
    out.push(`      "${mufajStr}": "${regenyStr}",`);
    out.push(`      "Fejezet": "${word}"`);
    out.push(`    },`);
    out.push(`    content: \``);
    
    for (let p of ch.content) {
        if (p.startsWith('- ')) p = p.substring(2);
        p = p.replace(/`/g, '\\`').replace(/\$/g, '\\$');
        if (p.startsWith('<strong>')) {
            out.push(`<p>${p}</p>`);
        } else {
            out.push(`<p>${p}</p>`);
        }
    }
    
    out.push(`\``);
    out.push(`  },`);
}

fs.writeFileSync('c:\\Users\\Lezli\\Desktop\\Diablo\\new_demonsbane_articles.js', out.join('\n'), 'utf8');
