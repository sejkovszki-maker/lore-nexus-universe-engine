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

// Extract Hungarian lines
let huLines = [];
for (let i = 1; i < validLines.length; i += 2) {
    huLines.push(validLines[i]);
}

let chapters = [];
let currentChapter = null;

let chapterSummaryRegex = /^(\d+)\.\s*fejezet\s*összefoglalás(a)?:/i;
let quotesRegex = /^\d+\.\s*fejezet\s*\|\s*Idézetek/i;
let qaRegex = /^\d+\.\s*fejezet\s*\|.*Kérdések/i;
let quizRegex = /^\d+\.\s*fejezet\s*\|.*Kvíz/i;
let stopRegex = /^(Kritikus gondolkodás|ihlet|Kritikai értelmezés|Kulcspont|Legjobb idézetek)/i;

for (let i = 0; i < huLines.length; i++) {
    let line = huLines[i];
    
    let match = line.match(chapterSummaryRegex);
    if (match) {
        if (line.includes("AZ ÉJSZAKA") && !line.toLowerCase().includes("lelkek")) continue;
        
        // Fix for chapter 8 duplicate: if we already have a chapter with this number and it has no content, just overwrite it
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
        if (line.match(/Section Content/i) || line.match(/Főbb események és témák/i) || line.match(/Témák és karakterfejlődések/i)) continue;
        if (line.match(/^Title Chapter/i) || line.match(/^Protagonist/i) || line.match(/^Setting /i)) continue;
        if (line.match(/^A Haditanács$/i) || line.match(/^Taktika és előkészületek$/i) || line.match(/^Egy növekvő fenyegetés$/i) || line.match(/^Kétségbeesés és kinyilatkoztatás$/i) || line.match(/^Záró gondolatok$/i) || line.match(/^Egy új kezdet$/i)) {
            currentChapter.content.push(`<strong>${line}</strong>`);
            continue;
        }
        
        line = line.replace(/Install Bookey App to Unlock Full Text and/gi, '');
        line = line.replace(/Audio ripped from him/gi, '');
        
        line = line.trim();
        if (line.length > 0) {
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

// Subtitle words correctly mapped 1-based (index 0 is dummy)
let words = ['', 'EGY', 'KETTŐ', 'HÁROM', 'NÉGY', 'ÖT', 'HAT', 'HÉT', 'NYOLC', 'KILENC', 'TÍZ', 'TIZENEGY'];

for (let ch of chapters) {
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
