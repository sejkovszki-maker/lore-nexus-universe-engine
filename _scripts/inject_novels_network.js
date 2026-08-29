const fs = require('fs');
let d = fs.readFileSync('extra.js', 'utf8');

const newNodes = `,\n    // Novels Expansion Nodes (Legacy of Blood & Black Road)
    { id: 74, label: 'Norrec\\nVizharan', group: 'humans', title: 'Zsoldos, aki megtalálta Bartuc páncélját.', articleId: 'norrec-vizharan' },
    { id: 75, label: 'Kara\\nNightshadow', group: 'humans', title: 'Nekromanta, Rathma papnője.', articleId: 'kara-nightshadow' },
    { id: 76, label: 'Bartuc\\nPáncélja', group: 'demons', title: 'A Vér Hadurának elátkozott páncélja.', articleId: 'bartuc-armor' },
    { id: 78, label: 'Darrick\\nLang', group: 'humans', title: 'A hajóskapitány, Bramwell védelmezője.', articleId: 'darrick-lang' },
    { id: 79, label: 'Buyard\\nCholik', group: 'humans', title: 'A sötét Zakarum pap, aki utat nyitott a démonoknak.', articleId: 'buyard-cholik' },
    { id: 80, label: 'Kabal', group: 'demons', title: 'A Fekete Út démona.', articleId: 'kabal-demon' }
  ]);`;

const newEdges = `,\n    // Novels Expansion Edges
    { from: 76, to: 74, label: 'megszállta', color: { color: '#dc2626' } },
    { from: 75, to: 74, label: 'megmentette', color: { color: '#10b981' } },
    { from: 79, to: 80, label: 'szolgálja (Kultusz)' },
    { from: 78, to: 79, label: 'ellensége', color: { color: '#f59e0b' } },
    { from: 78, to: 80, label: 'legyőzte', color: { color: '#3b82f6' } }
  ]);`;

let firstIdx = d.indexOf('  ]);');
d = d.substring(0, firstIdx) + newNodes + d.substring(firstIdx + 5);

let secondIdx = d.indexOf('  ]);', firstIdx + newNodes.length);
d = d.substring(0, secondIdx) + newEdges + d.substring(secondIdx + 5);

fs.writeFileSync('extra.js', d, 'utf8');
console.log("Novels network injection complete.");
