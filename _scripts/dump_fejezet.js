const fs = require('fs');
const fileContent = fs.readFileSync('c:\\Users\\Lezli\\Desktop\\Diablo\\Demon tanfolyam.txt', 'utf8');
const lines = fileContent.split(/\r?\n/);
let out = [];
for(let i = 0; i < lines.length; i++) {
  if (lines[i].toLowerCase().includes('fejezet')) {
    out.push(i + ": " + lines[i]);
  }
}
fs.writeFileSync('c:\\Users\\Lezli\\Desktop\\Diablo\\fejezet_lines.txt', out.join('\n'), 'utf8');
