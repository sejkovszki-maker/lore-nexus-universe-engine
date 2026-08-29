const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data.js');
let rawContent = fs.readFileSync(DATA_FILE);
let content = rawContent[0] === 0xFF && rawContent[1] === 0xFE ? rawContent.toString('utf16le') : rawContent.toString('utf8');

// Find all top-level keys
const lines = content.split('\n');
let keys = new Map();
let currentKey = null;
let braceDepth = 0;
let inWikiArticles = false;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes('const wikiArticles = {') || line.includes('let wikiArticles = {') || line.includes('var wikiArticles = {') || line.includes('wikiArticles = {') || line.match(/^const wikiArticles = \{/)) {
        inWikiArticles = true;
        braceDepth = 1;
        continue;
    }

    if (inWikiArticles) {
        // Count braces
        let openBraces = (line.match(/\{/g) || []).length;
        let closeBraces = (line.match(/\}/g) || []).length;

        // If we are at depth 1, check for a new key
        if (braceDepth === 1) {
            const keyMatch = line.match(/^\s*"([^"]+)":\s*\{/);
            if (keyMatch) {
                const key = keyMatch[1];
                if (!keys.has(key)) {
                    keys.set(key, []);
                }
                keys.get(key).push({ startLine: i, endLine: -1 });
                currentKey = key;
            }
        }

        braceDepth += openBraces - closeBraces;

        if (braceDepth === 1 && currentKey !== null) {
            // We just closed a key's object
            // The current line is probably the closing brace `},`
            const occurrences = keys.get(currentKey);
            occurrences[occurrences.length - 1].endLine = i;
            currentKey = null;
        }

        if (braceDepth === 0) {
            inWikiArticles = false;
        }
    }
}

// Now find duplicates
let toRemoveLines = [];
let sanctuaryShortStoriesRanges = [];

for (const [key, occurrences] of keys.entries()) {
    if (occurrences.length > 1) {
        console.log(`Duplicate found: ${key} (${occurrences.length} times)`);
        
        if (key === 'sanctuary-short-stories') {
            sanctuaryShortStoriesRanges = occurrences;
            continue;
        }

        // For sin-war-* we keep the first (long one), remove the second (short one)
        // Let's verify which one is longer
        for (let i = 1; i < occurrences.length; i++) {
            toRemoveLines.push({start: occurrences[i].startLine, end: occurrences[i].endLine});
            console.log(`  Will remove occurrence ${i+1}: lines ${occurrences[i].startLine} to ${occurrences[i].endLine}`);
        }
    }
}

// Also rename the second 'sanctuary-short-stories' to 'sanctuary-wayfarer'
if (sanctuaryShortStoriesRanges.length > 1) {
    const secondOccur = sanctuaryShortStoriesRanges[1];
    console.log(`Will rename second 'sanctuary-short-stories' at line ${secondOccur.startLine}`);
    
    // Modify the lines array directly
    // The line should be `  "sanctuary-short-stories": {`
    lines[secondOccur.startLine] = lines[secondOccur.startLine].replace('"sanctuary-short-stories"', '"sanctuary-wayfarer"');
}

// Remove the lines (in reverse order to not mess up indices, or just create a new array)
let newLines = [];
let removeIndex = 0;

// Sort toRemoveLines by start
toRemoveLines.sort((a, b) => a.start - b.start);

let i = 0;
while (i < lines.length) {
    let skip = false;
    for (const range of toRemoveLines) {
        if (i >= range.start && i <= range.end) {
            skip = true;
            break;
        }
    }
    if (!skip) {
        newLines.push(lines[i]);
    }
    i++;
}

fs.writeFileSync(DATA_FILE, newLines.join('\n'));
console.log('Cleanup complete.');
