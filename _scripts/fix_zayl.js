const fs = require('fs');

let data = fs.readFileSync('data.js', 'utf8');

const regex = /<p>A <strong>The Kingdom of Shadow<\/strong> \(Az.*?\)<\/p>/;

const newStr = '<p>A <strong>The Kingdom of Shadow</strong> (Az Árnyak Királysága) Richard A. Knaak klasszikus Diablo regénye. A történet bemutatja Ureh, a legendás elveszett város sötét titkait, és bevezeti a rajongók egyik kedvenc karakterét, <a href="#" onclick="openWikiArticle(\'zayl\'); return false;" class="lore-link">Zayl-t, a nekromantát</a>, valamint hűséges (és beszédes) koponyáját, <a href="#" onclick="openWikiArticle(\'zayl\'); return false;" class="lore-link">Humbartot</a>. Ez az archívum a könyv teljes, hivatalos kánon magyar nyelvű fordítását tartalmazza.</p>';

data = data.replace(regex, newStr);

fs.writeFileSync('data.js', data, 'utf8');
console.log('Done!');
