const fs = require('fs');
let d = fs.readFileSync('data.js', 'utf8');
const lines = d.split('\n');

// Remove the standalone comma line at 16638 (0-indexed: 16637)
if (lines[16637].trim() === ',') {
  lines.splice(16637, 1);
  console.log("Removed stray comma at line 16638");
} else {
  console.log("Line 16638 content:", JSON.stringify(lines[16637]));
}

fs.writeFileSync('data.js', lines.join('\n'), 'utf8');
