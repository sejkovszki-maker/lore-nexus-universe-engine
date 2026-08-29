const fs = require('fs');

const raw = fs.readFileSync('qxns4830 - Ismeretlen.txt', 'utf8');
const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

const huLines = [];
// Assuming strictly alternating EN, HU, EN, HU
for (let i = 1; i < lines.length; i += 2) {
    huLines.push(lines[i]);
}

const chapters = [];
let currentChapter = null;

const romanNumeralsOrNumbers = ['EGY', 'KÉT', 'KETTŐ', 'HÁROM', 'NÉGY', 'ÖT', 'HAT', 'HÉT', 'NYOLC', 'KILENC', 'TÍZ', 'TIZENEGY', 'TIZENKETTŐ', 'TIZENHÁROM', 'TIZENNÉGY', 'TIZENÖT', 'TIZENHAT', 'TIZENHÉT', 'TIZENNYOLC', 'TIZENKILENC', 'HÚSZ', 'HUSZONEGY', 'HUSZONKETTŐ', 'HUSZONHÁROM', 'HUSZONNÉGY', 'HUSZONÖT', 'HUSZONHAT', 'HUSZONHÉT', 'HUSZONNYOLC', 'HUSZONKILENC', 'HARMINC'];

for (let i = 0; i < huLines.length; i++) {
    const line = huLines[i];
    
    if (romanNumeralsOrNumbers.includes(line.toUpperCase().trim())) {
        if (currentChapter) {
            chapters.push(currentChapter);
        }
        currentChapter = {
            numberStr: line.trim(),
            content: []
        };
    } else if (currentChapter) {
        currentChapter.content.push(line);
    }
}
if (currentChapter) {
    chapters.push(currentChapter);
}

console.log(`Found ${chapters.length} chapters.`);
chapters.forEach((ch, idx) => {
    console.log(`Chapter ${idx + 1}: ${ch.numberStr} - ${ch.content.length} lines`);
});
