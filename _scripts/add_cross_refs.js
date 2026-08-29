const fs = require('fs');

let data = fs.readFileSync('data.js', 'utf8');

// Add cross-reference to kingdom-of-shadow
const kosRegex = /      <\/div>\r?\n    `/g;
const kosReplacement = `      </div>
      
      <h2>Kapcsolódó Szócikkek (Lore Hálózat)</h2>
      <ul>
        <li><a href="#" onclick="openWikiArticle('sin-war-prophet-ch18'); return false;" class="lore-link">The Sin War: The Veiled Prophet</a> - Olvass a Bűn Háborújának eseményeiről, amelyek Ureh felemelkedése előtt történtek.</li>
        <li><a href="#" onclick="openWikiArticle('zayl'); return false;" class="lore-link">Zayl, a Nekromanta</a> - Ismerd meg a regény egyik legfontosabb főszereplőjét!</li>
      </ul>
    \``;
if (data.match(kosRegex)) {
    data = data.replace(kosRegex, kosReplacement);
}

// Add cross-reference to sin-war-prophet-ch18
const swRegex = /      <p>A fű…<\/p>\r?\n    `/g;
const swReplacement = `      <p>A fű…</p>
      
      <h2>Kapcsolódó Szócikkek (Lore Hálózat)</h2>
      <ul>
        <li><a href="#" onclick="openWikiArticle('kingdom-of-shadow'); return false;" class="lore-link">Diablo: The Kingdom of Shadow</a> - Fedezd fel a Bűn Háborúja utáni korszak egyik legfontosabb regényét, amelyben Ureh sötét titkaira derül fény.</li>
      </ul>
    \``;
if (data.match(swRegex)) {
    data = data.replace(swRegex, swReplacement);
}

fs.writeFileSync('data.js', data, 'utf8');
console.log('Done adding cross-references!');
