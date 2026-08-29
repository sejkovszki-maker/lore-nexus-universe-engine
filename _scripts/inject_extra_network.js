const fs = require('fs');
let d = fs.readFileSync('extra.js', 'utf8');

const newNodes = `,\n    // Demonsbane Mély-Lore
    { id: 55, label: 'A Rejtettek\n(The Hidden)', group: 'demons', title: 'Alakváltó démonok, akik beszivárogtak a falvakba.', articleId: 'the-hidden' },
    { id: 56, label: 'Lelkek Éjszakája', group: 'world', title: 'Egy kozmikus esemény, amikor a halottak visszatérhettek. Siggard ekkor támadt fel.', articleId: 'night-of-souls' },
    { id: 57, label: 'Assur Rúnája', group: 'demons', title: 'A pokoli varázslat, ami Assurt sebezhetetlenné tette.', articleId: 'assurs-bane' },
    { id: 58, label: 'Edgewulf Gróf', group: 'humans', title: 'Brennor volt ura, aki elesett a Fekete Menetelésben.', articleId: 'earl-edgewulf' }
  ]);`;

const newEdges = `,\n    // Demonsbane Mély-Lore Kapcsolatok
    { from: 58, to: 53, label: 'uralkodott' },
    { from: 55, to: 53, label: 'beszivárgott' },
    { from: 55, to: 52, label: 'szolgálta' },
    { from: 57, to: 52, label: 'védelmezte' },
    { from: 50, to: 56, label: 'itt támadt fel', color: { color: '#8b5cf6' } }
  ]);`;

let firstIdx = d.indexOf('  ]);');
d = d.substring(0, firstIdx) + newNodes + d.substring(firstIdx + 5);

let secondIdx = d.indexOf('  ]);', firstIdx + newNodes.length);
d = d.substring(0, secondIdx) + newEdges + d.substring(secondIdx + 5);

fs.writeFileSync('extra.js', d, 'utf8');
console.log("Extra network injection complete.");
