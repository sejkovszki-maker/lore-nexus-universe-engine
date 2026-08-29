const fs = require('fs');
let d = fs.readFileSync('extra.js', 'utf8');

// The new nodes
const newNodes = `,\n    // Demonsbane Karakterek
    { id: 50, label: 'Siggard', group: 'humans', title: 'Egy katona, aki saját akaraterejéből tért vissza a halálból. Guthbreoht hordozója.', articleId: 'siggard' },
    { id: 51, label: 'Sarnakyle', group: 'humans', title: 'Vizjerei varázsló, aki Siggard mellé szegődik.', articleId: 'sarnakyle' },
    { id: 52, label: 'Assur', group: 'demons', title: 'A Terror Urának szolgája, a Pokol Bárója. Egy sebezhetetlen rúnát hordozott.', articleId: 'assur' },
    { id: 53, label: 'Brennor', group: 'world', title: 'Erődített város, amit Assur démoni hordája ostromolt.', articleId: 'brennor' },
    { id: 54, label: 'Guthbreoht\n(Rúnakard)', group: 'gods', title: 'Egy ősi rúnakard, amelyet Siggard talált egy sírhalomban.', articleId: 'guthbreoht' }
  ]);`;

// The new edges
const newEdges = `,\n    // Demonsbane Kapcsolatok
    { from: 5, to: 50, label: 'útmutatója / feltámasztója' },
    { from: 50, to: 54, label: 'forgatja' },
    { from: 51, to: 50, label: 'kísérője' },
    { from: 52, to: 53, label: 'ostromolta', color: { color: '#ef4444' } },
    { from: 50, to: 53, label: 'megvédte' },
    { from: 50, to: 52, label: 'lefejezte', color: { color: '#ef4444' } }
  ]);`;

// Find first `  ]);` (which is nodes)
let firstIdx = d.indexOf('  ]);');
d = d.substring(0, firstIdx) + newNodes + d.substring(firstIdx + 5);

// Find second `  ]);` (which is edges)
let secondIdx = d.indexOf('  ]);', firstIdx + newNodes.length);
d = d.substring(0, secondIdx) + newEdges + d.substring(secondIdx + 5);

fs.writeFileSync('extra.js', d);
console.log('Network injection complete');
