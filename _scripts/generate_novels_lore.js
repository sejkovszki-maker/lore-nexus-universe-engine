const fs = require('fs');

const novelsLore = {
  // LEGACY OF BLOOD (A vér szava)
  "book-legacy-of-blood": {
    id: "book-legacy-of-blood",
    category: "Lore / Könyvek - Olvasó",
    title: "A Vér Szava (Legacy of Blood)",
    subtitle: "Richard A. Knaak Diablo regénye (2001)",
    infobox: {
      "Szerző": "Richard A. Knaak",
      "Kiadás": "2001",
      "Főszereplő": "Norrec Vizharan"
    },
    content: `
      <h2>A Könyv Cselekménye</h2>
      <p>A <strong>Diablo: A vér szava</strong> (Legacy of Blood) a második hivatalos Diablo regény. A történet központjában <em>Norrec Vizharan</em>, egy kiábrándult zsoldos áll, aki egy ősi sírkamrában rátalál Bartucnak, a Vér Hadurának elátkozott páncéljára. Amikor Norrec felveszi a vértet, annak sötét mágiája átveszi az irányítást az elméje és a teste felett.</p>
      <h2>Kulcsszereplők</h2>
      <p>A vértezet démoni erői kegyetlen mészárlásokra kényszerítik Norrecot, miközben folyamatosan a Pokol erői és Bartuc régi szolgái (köztük a démon <em>Galeona</em>) üldözik őt. Menekülése során csatlakozik hozzá <em>Kara Nightshadow</em>, a Rathma papjainak (Nekromanták) egy női képviselője, aki megpróbálja megmenteni a zsoldost, és megakadályozni, hogy a Vér Hadura véglegesen feltámadjon a páncélon keresztül.</p>
    `
  },
  "norrec-vizharan": {
    id: "norrec-vizharan",
    category: "Karakterek - Nephalem & Emberek",
    title: "Norrec Vizharan",
    subtitle: "A megátkozott zsoldos",
    infobox: {
      "Szerepkör": "Zsoldos / Kalandor",
      "Megjelenés": "A vér szava",
      "Átok": "Bartuc páncélja"
    },
    content: `
      <p><strong>Norrec Vizharan</strong> egy egyszerű, sokat próbált zsoldos volt, amíg barátaival együtt be nem merészkedett egy ősi sírba Lut Gholein közelében. Itt találta meg Bartuc arany és vér vörös színű, elátkozott vértezetét. A páncél ráolvadt a testére, és Norrec akarata ellenére hatalmas, pusztító varázslatokat kezdett el szórni (pl. vérgólemek megidézése), miközben a páncél ősi gonoszsága lassan felemésztette az elméjét.</p>
    `
  },
  "kara-nightshadow": {
    id: "kara-nightshadow",
    category: "Karakterek - Nephalem & Emberek",
    title: "Kara Nightshadow",
    subtitle: "Rathma Papnője (Nekromanta)",
    infobox: {
      "Frakció": "Rathma Papjai (Nekromanták)",
      "Megjelenés": "A vér szava",
      "Szövetséges": "Norrec Vizharan"
    },
    content: `
      <p><strong>Kara Nightshadow</strong> egy fiatal, de rendkívül tehetséges nekromanta. A Trag'Oul egyensúlyát szolgáló rend tagjaként érezte meg Bartuc sötét mágiájának felébredését. Ő volt az egyetlen, aki hajlandó volt Norrecnek segíteni, ahelyett, hogy egyszerűen elpusztította volna a megszállt férfit. Hatalmas mágikus tudásával sikerült elszigetelnie Bartuc szellemét Norrec elméjétől, hogy a zsoldos végre levehesse az elátkozott páncélt.</p>
    `
  },
  "bartuc-armor": {
    id: "bartuc-armor",
    category: "Tárgyak & Ereklyék",
    title: "Bartuc Páncélja",
    subtitle: "A Vér Hadurának elátkozott vértje",
    infobox: {
      "Tulajdonos": "Bartuc / Norrec",
      "Tulajdonság": "Szimbióta, Vér-mágia",
      "Megjelenés": "A vér szava"
    },
    content: `
      <p>Bartuc, a Vizjerei mágusklán egykori tagja olyannyira elmélyedt a démonológiában, hogy a "Vér Haduraként" vált ismertté. Halála után az esszenciájának egy része beleivódott ikonikus páncéljába. A <strong>páncél</strong> gyakorlatilag él: önálló akarata van, rátapad a viselőjére, megállíthatatlan mágikus hatalmat (vérgólemek, lángoló vérpermet) biztosít neki, de cserébe vért és gyilkolást követel, miközben teljesen átveszi a gazdatest irányítását.</p>
    `
  },

  // THE BLACK ROAD (A gonosz ösvénye)
  "book-the-black-road": {
    id: "book-the-black-road",
    category: "Lore / Könyvek - Olvasó",
    title: "A Gonosz Ösvénye (The Black Road)",
    subtitle: "Mel Odom Diablo regénye (2002)",
    infobox: {
      "Szerző": "Mel Odom",
      "Kiadás": "2002",
      "Főszereplő": "Darrick Lang"
    },
    content: `
      <h2>A Könyv Cselekménye</h2>
      <p>A <strong>Diablo: A gonosz ösvénye</strong> (The Black Road) a harmadik hivatalos Diablo regény. A cselekmény <em>Darrick Lang</em> tengerészkapitány és zsoldos történetét követi nyomon, aki visszatér szülővárosába, <strong>Bramwellbe</strong>. Azt tapasztalja, hogy a várost egy új, fanatikus vallási szekta, a Fény Útja (Way of the Light) uralja, melyet a karizmatikus pap, <em>Buyard Cholik</em> vezet.</p>
      <h2>A Sötét Titok</h2>
      <p>Cholik valójában egy <em>Kabal</em> nevű hatalmas démon szolgája. A pap arra használja az új vallást, hogy ártatlanok vérmágiájával és feláldozásával utat (A Fekete Utat / The Black Road) nyisson Kabalnak a Lángoló Poklokból Menedékre. Darrick Langnak és maroknyi szövetségesének egy brutális, démonokkal teli háborúban kell megvédenie a várost és lelepleznie az egyház mögött rejlő sötétséget.</p>
    `
  },
  "darrick-lang": {
    id: "darrick-lang",
    category: "Karakterek - Nephalem & Emberek",
    title: "Darrick Lang",
    subtitle: "A Tengerészkapitány",
    infobox: {
      "Szerepkör": "Kapitány / Harcos",
      "Megjelenés": "A gonosz ösvénye",
      "Célpont": "Kabal és Cholik"
    },
    content: `
      <p><strong>Darrick Lang</strong> egy sokat tapasztalt hajóskapitány, aki egy végzetes hajótörés és kardforgató múlt után tér haza Bramwellbe, csak hogy rémülten konstatálja barátai pálfordulását a vallási fanatizmus irányába. Ő az egyetlen, aki gyanakodni kezd Buyard Cholik szándékaira, és a fegyveres ellenállás élére állva próbálja megakadályozni Kabal démoni invázióját.</p>
    `
  },
  "buyard-cholik": {
    id: "buyard-cholik",
    category: "Karakterek - Nephalem & Emberek",
    title: "Buyard Cholik",
    subtitle: "A Sötét Pap",
    infobox: {
      "Frakció": "Kabal Kultusza",
      "Megjelenés": "A gonosz ösvénye",
      "Státusz": "Áruló Pap"
    },
    content: `
      <p><strong>Buyard Cholik</strong> egy zseniálisan manipulatív Zakarum pap volt, aki az emberek reménytelenségét kihasználva egy "új Fényt" hirdetett Bramwellben. A valóságban alkut kötött a Pokol erőivel. Mágikus befolyásolással és véres titkos rituálékkal szipolyozta ki a követői lelkét, hogy a démon Kabal számára átjárót építsen.</p>
    `
  },
  "kabal-demon": {
    id: "kabal-demon",
    category: "Karakterek - Démonok",
    title: "Kabal",
    subtitle: "A Fekete Út Démona",
    infobox: {
      "Rang": "Démon",
      "Megjelenés": "A gonosz ösvénye",
      "Szolga": "Buyard Cholik"
    },
    content: `
      <p><strong>Kabal</strong> egy rendkívül ravasz és erős démon a Lángoló Poklokból, aki nem frontális támadással, hanem manipulatív vérmágiával és emberi kultuszok (Cholik egyháza) kiépítésével akart kaput nyitni Menedékre. Nevéhez fűződik a "Black Road" (Gonosz Ösvénye), egy dimenzióközi híd, amelyet ártatlanok vére tartott stabilan.</p>
    `
  }
};

let d = fs.readFileSync('data.js', 'utf8');

let newArticles = "\n/* DIABLO NOVELS LORE EXPANSION */\n";
for (let key in novelsLore) {
  let article = novelsLore[key];
  newArticles += `  "${key}": ${JSON.stringify(article, null, 4).replace(/\}$/, '  },')}\n`;
}

// Inject into data.js
let targetWiki = /\}\s*\};\s*const timelineData =/g;
d = d.replace(targetWiki, '},\n' + newArticles + '\n};\n\nconst timelineData =');

fs.writeFileSync('data.js', d, 'utf8');
console.log("Novel Lore Injected: 8 New Articles");
