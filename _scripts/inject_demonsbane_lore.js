const fs = require('fs');

let d = fs.readFileSync('data.js', 'utf8');
let lore = fs.readFileSync('demonsbane_lore.js', 'utf8');

// Inject Lore Articles into wikiData
let targetWiki = /\}\s*\};\s*const timelineData =/g;
d = d.replace(targetWiki, '},\n' + lore + '\n};\n\nconst timelineData =');

// Add timeline events
let timelineEvents = `
  {
    id: "event-demonsbane-blackmarch",
    eraId: "mageclans",
    eraName: "5. A Mágusklánok Háborúja",
    date: "A Bűn Háborúja Után",
    title: "A Fekete Menetelés (Blackmarch)",
    gameTag: "Lore",
    articleId: "demonsbane",
    summary: "A démoni seregek lemészárolják Entsteig haderejét.",
    description: "Assur fődémon seregei rajtaütöttek Edgewulf Gróf seregén a Fekete Menetelés (Blackmarch) során. Siggard, egy fiatal katona, meghalt a csatában, de bosszúvágya és hatalmas akaratereje visszahozta őt a halálból. Ezzel kezdetét vette a Lelkek Éjszakája.",
    isHighlight: false
  },
  {
    id: "event-demonsbane-brennor",
    eraId: "mageclans",
    eraName: "5. A Mágusklánok Háborúja",
    date: "Blackmarch Után",
    title: "Brennor Ostroma és Assur Bukása",
    gameTag: "Lore",
    articleId: "assur",
    summary: "Siggard és Sarnakyle megvédi Brennort és legyőzi Assurt.",
    description: "Miután rátalált az ősi Guthbreoht rúnakardra, Siggard, Sarnakyle varázsló oldalán eléri Brennor városát, amelyet Assur démoni hordái ostromolnak. Siggard áttöri Assur mágikus pajzsát és levágja a démon fejét, megmentve ezzel a várost és megbosszulva feleségét, Emilye-t.",
    isHighlight: true
  },
`;

// Inject Timeline events right after `const timelineData = [`
let targetTimeline = /const timelineData = \[\s*/;
d = d.replace(targetTimeline, 'const timelineData = [\n' + timelineEvents);

fs.writeFileSync('data.js', d);
console.log('Injection complete');
