const fs = require('fs');
let d = fs.readFileSync('extra.js', 'utf8');

const newNodes = `,\n    // Moon of the Spider & Kingdom of Shadow Nodes
    { id: 81, label: 'Zayl', group: 'humans', title: 'Rathma papja, nekromanta.', articleId: 'zayl' },
    { id: 82, label: 'Humbart\\nWessel', group: 'humans', title: 'Zayl halhatatlan (testetlen) társa.', articleId: 'humbart-wessel' },
    { id: 83, label: 'Astrogha', group: 'demons', title: 'A pókdémon, Diablo alvezére.', articleId: 'astrogha' },
    { id: 84, label: 'Lord Aldric\\nJitan', group: 'humans', title: 'Westmarch korrupt nemese, Astrogha szolgája.', articleId: 'lord-aldric-jitan' }
  ]);`;

const newEdges = `,\n    // Moon of the Spider Edges
    { from: 81, to: 82, label: 'társa', color: { color: '#10b981' } },
    { from: 83, to: 7, label: 'szolgálja' },
    { from: 84, to: 83, label: 'szolgálja (Kultusz)' },
    { from: 81, to: 84, label: 'leplezte', color: { color: '#f59e0b' } },
    { from: 81, to: 83, label: 'legyőzte (avatárt)', color: { color: '#3b82f6' } }
  ]);`;

let firstIdx = d.indexOf('  ]);');
d = d.substring(0, firstIdx) + newNodes + d.substring(firstIdx + 5);

let secondIdx = d.indexOf('  ]);', firstIdx + newNodes.length);
d = d.substring(0, secondIdx) + newEdges + d.substring(secondIdx + 5);

fs.writeFileSync('extra.js', d, 'utf8');
console.log("Spider network injection complete.");
