const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data.js');

// Try reading with utf8 first, if it fails or has null bytes, maybe utf16le
let rawContent = fs.readFileSync(DATA_FILE);
let content = '';

if (rawContent[0] === 0xFF && rawContent[1] === 0xFE) {
    content = rawContent.toString('utf16le');
} else {
    content = rawContent.toString('utf8');
}

console.log("File loaded. Length:", content.length);

// We want to find top-level keys like:
//   "sin-war-scales-ch12": {
// and
//   "sanctuary-short-stories": {
// But there could be variations in spacing.

// Let's find all occurrences of "sin-war-..."
const regex = /"([^"]+)":\s*\{/g;
let match;
let keys = new Map();
let duplicates = [];

while ((match = regex.exec(content)) !== null) {
    const key = match[1];
    // To be safe, we only consider it a top-level key if it's near the start of a line
    // Let's check the characters before the match to see if there's only whitespace and a newline
    const before = content.substring(Math.max(0, match.index - 20), match.index);
    if (before.match(/\n\s*$/)) {
        if (!keys.has(key)) {
            keys.set(key, [match.index]);
        } else {
            keys.get(key).push(match.index);
            if (keys.get(key).length === 2) {
                duplicates.push(key);
            }
        }
    }
}

console.log("Found duplicates:", duplicates);

// Now for each duplicate, we need to remove the SECOND occurrence completely.
// But wait, the user also mentioned:
// 5. A sanctuary-short-stories esetében
// Az egyik marad: { id: "sanctuary-short-stories", title: "Diablo Hivatalos Novellák és Előzmény Cikkek", ... }
// A másik pedig: { id: "sanctuary-wayfarer", title: "Wayfarer (A Vándor) – Cameron Dayton", ... }
// Így nem veszítjük el egyik tartalmat sem.

// Let's output the text of the duplicates to see what we are dealing with.
// For each duplicate key, we'll find where it ends (the matching closing brace).

function findClosingBrace(str, startIdx) {
    let openCount = 0;
    let inString = false;
    let escape = false;

    for (let i = startIdx; i < str.length; i++) {
        const char = str[i];
        if (inString) {
            if (escape) {
                escape = false;
            } else if (char === '\\') {
                escape = true;
            } else if (char === '"') { // Assuming keys/strings are double-quoted. Might be backticks?
                inString = false;
            }
        } else {
            if (char === '"' || char === "'" || char === "\`") {
                // Actually JS can have different quotes.
                // It's a bit complex to parse perfectly without AST.
            }
            if (char === '{') openCount++;
            if (char === '}') {
                openCount--;
                if (openCount === 0) {
                    return i;
                }
            }
        }
    }
    return -1;
}

// Let's just use Acorn or Babel if available? Probably not installed.
// We can use a simpler brace matching since data.js is mostly uniform.
