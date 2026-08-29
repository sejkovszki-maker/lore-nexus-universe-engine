const fs = require('fs');

const fileContent = fs.readFileSync('A gonosz osvenye - Ismeretlen.txt', 'utf8');
const lines = fileContent.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

// Find ALL chapter markers - the file uses mixed patterns
// "Negyedik fejezeT" "második fejezet" etc. at end of chapter (as "chapter X" labels)
// Also inline: "második fejezet" embedded in text line

let chapterBoundaries = [];

// Pattern: line that is SOLELY a chapter marker
let chapterPattern = /^(Első|Második|Harmadik|Negyedik|Ötödik|Hatodik|Hetedik|Nyolcadik|Kilencedik|Tizedik|Tizenegyedik|Tizenkettedik|Tizenharmadik|Tizennégyedik|Tizenötödik|Tizenhatodik|Tizenhetedik|Tizennyolcadik|Tizenkilencedik|Huszadik|Huszonegyedik|Huszonkettedik|Huszonharmadik|Huszonnegyedik|Huszonötödik)\s*fejeze[tT]/i;

// Also find inline markers like "második fejezeí" (typo in book) "Harmadik fejezeT"
let inlinePattern = /(Első|Második|Harmadik|Negyedik|Ötödik|Hatodik|Hetedik|Nyolcadik|Kilencedik|Tizedik|Tizenegyedik|Tizenkettedik|Tizenharmadik|Tizennégyedik|Tizenötödik|Tizenhatodik|Tizenhetedik|Tizennyolcadik|Tizenkilencedik|Huszadik|Huszonegyedik|Huszonkettedik|Huszonharmadik|Huszonnegyedik|Huszonötödik)\s*fejeze[tTí]/i;

let epiloguePattern = /^Epilógus/i;

for (let i = 0; i < lines.length; i++) {
    let l = lines[i];
    let match = l.match(chapterPattern);
    let inlineMatch = l.match(inlinePattern);
    let epiMatch = l.match(epiloguePattern);
    
    if (match) {
        chapterBoundaries.push({ line: i, title: l, type: 'standalone' });
    } else if (inlineMatch && l.length < 60) {
        // Short lines with chapter markers are likely chapter titles
        chapterBoundaries.push({ line: i, title: l, type: 'short' });
    } else if (inlineMatch) {
        // Inline chapter markers at end of content - the NEXT section starts after
        chapterBoundaries.push({ line: i, title: inlineMatch[0], type: 'inline', fullLine: l });
    } else if (epiMatch) {
        chapterBoundaries.push({ line: i, title: l, type: 'epilogue' });
    }
}

console.log("Found chapters:", chapterBoundaries.length);
chapterBoundaries.forEach(b => console.log(`Line ${b.line}: [${b.type}] "${b.title.substring(0, 60)}"`));
