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

// Find chapters
let chapters = [];
let currentChapter = null;

for (let line of huLines) {
    if (line.match(/^\d+\.\s*fejezet\s*:\s*(.*)/i)) {
        if (currentChapter) chapters.push(currentChapter);
        let title = line.match(/^\d+\.\s*fejezet\s*:\s*(.*)/i)[1];
        currentChapter = { title: title.trim(), content: [] };
    } else if (line.match(/^\d+\.\s*fejezet\s*összefoglalása/i) || line.match(/^\d+\.\s*fejezet\s*\|\s*Idézetek/i)) {
        // skip or start a different section
        continue;
    } else {
        if (currentChapter) {
            currentChapter.content.push(line);
        }
    }
}
if (currentChapter) chapters.push(currentChapter);

console.log("Found " + chapters.length + " chapters.");
for (let ch of chapters) {
    console.log("Ch: " + ch.title + " - lines: " + ch.content.length);
}
