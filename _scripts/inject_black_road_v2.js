const fs = require('fs');

let d = fs.readFileSync('data.js', 'utf8');

// 1) Remove existing black-road-ch* entries
// They start right after "brennor" article ends
// Find first black-road-ch1 and last black-road entry
const startMarker = '  "black-road-ch1": {';
const startIdx = d.indexOf(startMarker);

if (startIdx === -1) {
  console.error("black-road-ch1 not found!");
  process.exit(1);
}

// Find the end - the last black-road entry ends with "  },"
// after that should be event entries or the wikiData closing
// Find the closing of the last black-road entry:
let lastEnd = startIdx;
let searchFrom = startIdx;
while (true) {
  let nextEntry = d.indexOf('  "black-road-ch', searchFrom + 1);
  if (nextEntry === -1) break;
  lastEnd = nextEntry;
  searchFrom = nextEntry;
}

// Now find the end of the LAST black-road entry
// It ends with \n  },\n followed by something that's not black-road
// Find the closing }, after lastEnd
let closingIdx = d.indexOf('\n  },\n', lastEnd);
if (closingIdx === -1) closingIdx = d.indexOf('\n  }\n', lastEnd);

// The end of the old black-road block
let blockEnd = closingIdx + '\n  },\n'.length;

// Build the new content
const newArticles = fs.readFileSync('black_road_articles_v2.js', 'utf8');
const articlesOnly = newArticles.replace(/^\/\*.*?\*\/\n/, '');

// Replace the old block with the new
const newContent = d.substring(0, startIdx) + articlesOnly + '\n' + d.substring(blockEnd);

fs.writeFileSync('data.js', newContent, 'utf8');
console.log("Black Road v2 injection complete!");
