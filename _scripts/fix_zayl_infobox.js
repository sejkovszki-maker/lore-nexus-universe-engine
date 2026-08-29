const fs = require('fs');

let data = fs.readFileSync('data.js', 'utf8');

const regex = /"Főszereplő": "Kentril Dumon, Zayl"/g;
const newStr = '"Főszereplő": "Kentril Dumon, <a href=\\"#\\" onclick=\\"openWikiArticle(\'zayl\'); return false;\\" class=\\"lore-link\\">Zayl</a>"';

data = data.replace(regex, newStr);

fs.writeFileSync('data.js', data, 'utf8');
console.log('Done linking Zayl in infobox!');
