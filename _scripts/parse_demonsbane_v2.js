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
// Based on the bookey structure, the file has English then Hungarian.
// Let's assume every odd index (0-based) is Hungarian, i.e., 1, 3, 5...
for (let i = 1; i < validLines.length; i += 2) {
    huLines.push(validLines[i]);
}

let chapters = [];
let currentChapter = null;

let chapterSummaryRegex = /^(\d+)\.\s*fejezet\s*összefoglalás(a)?:/i;
let quotesRegex = /^\d+\.\s*fejezet\s*\|\s*Idézetek/i;
let qaRegex = /^\d+\.\s*fejezet\s*\|.*Kérdések/i;
let quizRegex = /^\d+\.\s*fejezet\s*\|.*Kvíz/i;
let tableRegex = /^Cím\s*\d+\.\s*fejezet/i; // E.g., Cím 1. fejezet Összefoglaló:

for (let i = 0; i < huLines.length; i++) {
    let line = huLines[i];
    
    // Check if new chapter summary starts
    let match = line.match(chapterSummaryRegex);
    if (match) {
        if (currentChapter) chapters.push(currentChapter);
        currentChapter = { number: match[1], title: line.replace(chapterSummaryRegex, '').trim(), content: [] };
        continue;
    }
    
    // Stop adding to currentChapter if we hit quotes, QA, or Quiz
    if (line.match(quotesRegex) || line.match(qaRegex) || line.match(quizRegex) || line.match(tableRegex)) {
        if (currentChapter) {
            // We just stop collecting until the next chapter summary
            chapters.push(currentChapter);
            currentChapter = null;
        }
        continue;
    }

    if (currentChapter) {
        // Skip short noisy lines or headings that repeat
        if (line.match(/^\d+\.\s*fejezet:/i)) continue;
        if (line.match(/^Ebben a fejezetben/i) && line.length < 30) continue; // Fragmented lines
        
        currentChapter.content.push(line);
    }
}
if (currentChapter) chapters.push(currentChapter);

let out = [];
for (let ch of chapters) {
    out.push(`--- Chapter ${ch.number}: ${ch.title} ---`);
    for (let p of ch.content) {
        out.push(p);
    }
    out.push("\n");
}

fs.writeFileSync('c:\\Users\\Lezli\\Desktop\\Diablo\\preview.txt', out.join('\n'), 'utf8');
