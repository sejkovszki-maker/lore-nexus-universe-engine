const fs = require('fs');

const spiderLore = {
  "book-moon-of-the-spider": {
    id: "book-moon-of-the-spider",
    category: "Lore / Könyvek - Olvasó",
    title: "A Pók Holdja (Moon of the Spider)",
    subtitle: "Richard A. Knaak Diablo regénye (2006)",
    infobox: {
      "Szerző": "Richard A. Knaak",
      "Kiadás": "2006",
      "Főszereplő": "Zayl és Humbart"
    },
    content: `
      <h2>A Könyv Cselekménye</h2>
      <p>A <strong>Diablo: A Pók Holdja</strong> (Moon of the Spider) közvetlen folytatása az <em>Árnyak birodalma (Kingdom of Shadow)</em> című regénynek. A történetben visszatér kedvenc nekromantánk, <strong>Zayl</strong>, és elválaszthatatlan (bár testetlen) társa, <strong>Humbart Wessel</strong> koponyája. Utazásuk Westmarch (Nyugatvég) hatalmas városába vezet, ahol sötét ármánykodás készülődik a felszín alatt.</p>
      <h2>A Pókdémon Ébredése</h2>
      <p>Westmarch korrupt nemességének egy része (Lord Aldric Jitan vezetésével) titokban a Pokol erőit szolgálja. Egy sötét rituálé során felébresztik a <strong>Pók Holdja</strong> nevű ereklyét, amely kaput nyit <strong>Astroghának</strong>, a pókdémonnak. Astrogha Diablo egyik legősibb, legveszélyesebb alvezére, akinek célja, hogy pók-ivzadékaival elárassza a halandó világot. Zaylnak egész Westmarch-ot meg kell mentenie a belülről érkező végzettel szemben.</p>
    `
  },
  "astrogha": {
    id: "astrogha",
    category: "Karakterek - Démonok",
    title: "Astrogha",
    subtitle: "A Pokol Pók-Démona",
    infobox: {
      "Frakció": "Lángoló Poklok",
      "Mester": "Diablo",
      "Megjelenés": "A Pók Holdja, Bűn Háborúja"
    },
    content: `
      <p><strong>Astrogha</strong> egy hatalmas, ősi és hihetetlenül ravasz pókdémon, aki magának Diablónak, a Rettegés Urának volt az egyik legfőbb alvezére és kémje. Már a Bűn Háborúja (Sin War) során is jelen volt Menedéken (Sanctuary-n), ahol az árnyékokból manipulálta az emberiséget.</p>
      <p>Astrogha hálója a puszta rettegésből és sötétségből szövődik. Célja, hogy hálójával befonja az egész halandó világot, ám Zayl nekromanta – halálmágiáját és intelligenciáját használva – útját állta Westmarch-ban. Bár Zayl legyőzte az avatárját, egy ilyen ősi démon végleges elpusztítása szinte lehetetlen.</p>
    `
  },
  "lord-aldric-jitan": {
    id: "lord-aldric-jitan",
    category: "Karakterek - Nephalem & Emberek",
    title: "Lord Aldric Jitan",
    subtitle: "Westmarch Korrupt Nemese",
    infobox: {
      "Frakció": "Astrogha Kultusza",
      "Megjelenés": "A Pók Holdja",
      "Státusz": "Áruló"
    },
    content: `
      <p><strong>Lord Aldric Jitan</strong> egy magas rangú, befolyásos nemes volt Westmarch (Nyugatvég) hatalmas birodalmában. Hatalomvágya olyannyira elvakította, hogy lepaktált a Pokol erőivel. Rituáléi és sötét machinációi révén ő tette lehetővé, hogy a pókdémon, Astrogha betegye a lábát a halandók világába, megfertőzve ezzel az egykor büszke várost. Zayl végül leleplezte az árulását.</p>
    `
  }
};

let d = fs.readFileSync('data.js', 'utf8');

let newArticles = "\n/* MOON OF THE SPIDER LORE */\n";
for (let key in spiderLore) {
  let article = spiderLore[key];
  newArticles += `  "${key}": ${JSON.stringify(article, null, 4).replace(/\}$/, '  },')}\n`;
}

// Inject into data.js
let targetWiki = /\}\s*\};\s*const timelineData =/g;
d = d.replace(targetWiki, '},\n' + newArticles + '\n};\n\nconst timelineData =');

fs.writeFileSync('data.js', d, 'utf8');
console.log("Spider Lore Injected: 3 New Articles");
