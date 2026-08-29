const fs = require('fs');

const d = fs.readFileSync('data.js', 'utf8');
const newArticles = fs.readFileSync('black_road_articles.js', 'utf8');

// Find the exact closing of wikiData: `\n};` before `const timelineData`
const timelineIdx = d.lastIndexOf('const timelineData');
const wikiDataEnd = d.lastIndexOf('\n};', timelineIdx);

if (wikiDataEnd === -1) {
  console.error("Could not find wikiData end!");
  process.exit(1);
}

// Insert before the closing };
// At wikiDataEnd we have \n}; — we insert our articles before the \n};
const before = d.substring(0, wikiDataEnd);
const after = d.substring(wikiDataEnd);

// The newArticles content is a series of  "key": { ... },  entries
// Strip the comment line at the top
const articlesOnly = newArticles.replace(/^\/\*.*?\*\/\n/, '');

const result = before + ',\n' + articlesOnly + '\n' + after;

fs.writeFileSync('data.js', result, 'utf8');
console.log("Black Road injected successfully!");
