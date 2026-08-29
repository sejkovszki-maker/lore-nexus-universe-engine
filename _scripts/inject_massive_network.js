const fs = require('fs');
let d = fs.readFileSync('extra.js', 'utf8');

const newNodes = `,\n    // Massive Lore Expansion Nodes
    { id: 60, label: 'Imperius', group: 'angels', title: 'A Bátorság Arkangyala, az Angiris Tanács vezetője.', articleId: 'imperius' },
    { id: 61, label: 'Auriel', group: 'angels', title: 'A Remény Arkangyala.', articleId: 'auriel' },
    { id: 62, label: 'Itherael', group: 'angels', title: 'A Sors Arkangyala.', articleId: 'itherael' },
    { id: 63, label: 'Malthael', group: 'angels', title: 'A Bölcsesség (majd a Halál) Arkangyala.', articleId: 'malthael' },
    { id: 64, label: 'Mephisto', group: 'demons', title: 'A Gyűlölet Ura, Fő Gonosz.', articleId: 'mephisto' },
    { id: 65, label: 'Baal', group: 'demons', title: 'A Pusztítás Ura, Fő Gonosz.', articleId: 'baal' },
    { id: 66, label: 'Andariel', group: 'demons', title: 'A Kínok Leánya.', articleId: 'andariel' },
    { id: 67, label: 'Duriel', group: 'demons', title: 'A Fájdalom Ura.', articleId: 'duriel' },
    { id: 68, label: 'Belial', group: 'demons', title: 'A Hazugság Ura.', articleId: 'belial' },
    { id: 69, label: 'Azmodan', group: 'demons', title: 'A Bűn Ura.', articleId: 'azmodan' },
    { id: 70, label: 'Tal Rasha', group: 'humans', title: 'A Horadrim vezetője, Baal élő börtöne.', articleId: 'tal-rasha' },
    { id: 71, label: 'Zoltun Kulle', group: 'humans', title: 'A Lázadó Horadrim Alkimista.', articleId: 'zoltun-kulle' },
    { id: 72, label: 'Lélekkövek\\n(Soulstones)', group: 'world', title: 'Mágikus börtönök a Fő Gonoszok számára.', articleId: 'soulstones' },
    { id: 73, label: 'Fekete\\nLélekkő', group: 'world', title: 'Zoltun Kulle alkotása, amely mind a 7 Gonoszt képes elnyelni.', articleId: 'black-soulstone' }
  ]);`;

const newEdges = `,\n    // Massive Lore Expansion Edges
    { from: 60, to: 5, label: 'riválisok', color: { color: '#dc2626' } },
    { from: 64, to: 3, label: 'apa - lánya' },
    { from: 64, to: 7, label: 'testvérek' },
    { from: 64, to: 65, label: 'testvérek' },
    { from: 65, to: 7, label: 'testvérek' },
    { from: 70, to: 65, label: 'élő börtöne', color: { color: '#f59e0b' } },
    { from: 71, to: 73, label: 'megalkotta', color: { color: '#10b981' } },
    { from: 5, to: 70, label: 'alapította' },
    { from: 72, to: 7, label: 'foglyul ejtette' },
    { from: 72, to: 64, label: 'foglyul ejtette' },
    { from: 72, to: 65, label: 'foglyul ejtette' },
    { from: 69, to: 7, label: 'fellázadt' },
    { from: 68, to: 7, label: 'fellázadt' },
    { from: 63, to: 73, label: 'ellopta', color: { color: '#8b5cf6' } }
  ]);`;

let firstIdx = d.indexOf('  ]);');
d = d.substring(0, firstIdx) + newNodes + d.substring(firstIdx + 5);

let secondIdx = d.indexOf('  ]);', firstIdx + newNodes.length);
d = d.substring(0, secondIdx) + newEdges + d.substring(secondIdx + 5);

fs.writeFileSync('extra.js', d, 'utf8');
console.log("Massive network injection complete.");
