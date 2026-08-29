const fs = require('fs');
const lines = fs.readFileSync('src/data/wikiArticles.ts', 'utf-8').split('\n');
const seen = new Set();
const out = [];
let i = 0;
while (i < lines.length) {
    const line = lines[i];
    const match = line.match(/^  "([^"]+)":\s*\{/);
    if (match) {
        const key = match[1];
        if (seen.has(key)) {
            // duplicate! skip it
            let braces = 1;
            i++;
            while (i < lines.length && braces > 0) {
                if (lines[i].includes('{')) braces++;
                if (lines[i].includes('}')) braces--;
                i++;
            }
            if (lines[i] && lines[i].trim() === ',') i++;
            continue;
        }
        seen.add(key);
    }
    out.push(line);
    i++;
}
fs.writeFileSync('src/data/wikiArticles.ts', out.join('\n'));
console.log('Cleaned duplicates!');
