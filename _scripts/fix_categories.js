const fs = require('fs');

let d = fs.readFileSync('data.js', 'utf8');

// Count before
const beforeCount = (d.match(/Lore \/ K\\u00F6nyvek - Olvas\\u00F3/g) || []).length;
console.log('Broken category occurrences:', beforeCount);

// Fix: replace the escaped unicode version with proper UTF-8
d = d.split('Lore / K\\u00F6nyvek - Olvas\\u00F3').join('Lore / Könyvek - Olvasó');

// Also fix if it appears as JSON-escaped in template literals
d = d.split('Lore / K\u00f6nyvek - Olvas\u00f3').join('Lore / Könyvek - Olvasó');

const afterCount = (d.match(/Lore \/ Könyvek - Olvasó/g) || []).length;
console.log('Fixed category occurrences:', afterCount);

fs.writeFileSync('data.js', d, 'utf8');
console.log('Done!');
