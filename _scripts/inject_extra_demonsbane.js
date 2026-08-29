const fs = require('fs');

const extraLore = {
  "the-hidden": {
    id: "the-hidden",
    category: "Fajok & Szörnyek",
    title: "A Rejtettek (The Hidden)",
    subtitle: "Démonok, akik a halandók között jártak",
    infobox: {
      "Típus": "Démon",
      "Képesség": "Alakváltás, rejtőzködés",
      "Megjelenés": "Démonok csapása (Demonsbane)"
    },
    content: `
      <h2>Leírás és Célpontok</h2>
      <p>A <strong>Rejtettek (The Hidden)</strong> egy különleges démonfajta, akik képesek voltak felvenni vagy elfoglalni az emberek alakját, hogy észrevétlenül beférkőzzenek a falvak és városok lakói közé. A <em>Démonok csapása</em> regény során Sarnakyle, a Vizjerei varázsló volt az, aki először felfedezte jelenlétüket, felismerve az álcájukat.</p>
      
      <h2>Szerepük a történetben</h2>
      <p>Amikor Siggard visszatért a falujába, hogy figyelmeztesse az embereket, a falusiak jelentős része már nem ember volt, hanem <strong>Rejtett</strong> démon. Ezek a lények szándékosan belülről gyengítették meg az emberek védelmét, hogy megnyissák az utat Assur arkdémon főserege előtt. Alakváltó képességük miatt a gyanútlan emberek gyakran a saját családtagjaiknak hitték őket a végső árulás pillanatáig.</p>
    `
  },
  "night-of-souls": {
    id: "night-of-souls",
    category: "Mágia & Fogalmak",
    title: "A Lelkek Éjszakája (Night of Souls)",
    subtitle: "A ritka kozmikus és mágikus együttállás éjjele",
    infobox: {
      "Típus": "Kozmikus esemény",
      "Jelentőség": "Holtak feltámadása",
      "Érintettek": "Siggard, a Fekete Menetelés áldozatai"
    },
    content: `
      <h2>A Jelenség</h2>
      <p>A <strong>Lelkek Éjszakája</strong> (Night of Souls) egy rendkívül ritka, sötét mágiával és csillagászati együttállással átszőtt éjszaka volt a Bűn Háborúja utáni időszakban. Ezen az éjszakán a világok közötti fátyol elvékonyodott, és a holtak lelkei szorosan kötődtek a fizikai világhoz.</p>
      
      <h2>Siggard Feltámadása</h2>
      <p>A Fekete Menetelés (Blackmarch) mészárlása pont ezen az éjszakán történt. Siggard, aki halálos sebet kapott a csatában, a családja iránt érzett felfoghatatlan szeretete és a bosszúvágya miatt képes volt felhasználni az éjszaka energiáit. Ő maga nem volt tudatában ennek, de a Lelkek Éjszakája tette lehetővé számára, hogy dacoljon a halállal, és a puszta akaraterejéből egy "élőhalott" bosszúállóként térjen vissza.</p>
    `
  },
  "assurs-bane": {
    id: "assurs-bane",
    category: "Tárgyak & Ereklyék",
    title: "Assur Sebezhetetlenségi Rúnája",
    subtitle: "A pokoli jel, amely megvédte a démont a halandóktól",
    infobox: {
      "Típus": "Pokoli Varázslat (Rúna)",
      "Tulajdonos": "Assur",
      "Megtörője": "Guthbreoht és Siggard"
    },
    content: `
      <h2>A Rúna Eredete</h2>
      <p>Assur, a Pokol Bárója nem csupán hatalmas fizikai és mágikus erővel rendelkezett, hanem egy olyan ősi, pokoli <strong>rúnát</strong> (jelet) viselt, amely gyakorlatilag halhatatlanná tette. Ez a rúna megakadályozta, hogy bármilyen halandó által kovácsolt fegyver sebet ejtsen rajta.</p>
      
      <h2>A Védvonal Áttörése</h2>
      <p>Tyrael és Sarnakyle is felismerte a rúna jelenlétét, és tisztában voltak vele, hogy normál eszközökkel a démon legyőzhetetlen. Siggard azonban egy ősi sírhalomból (barrow) szerezte meg a <strong>Guthbreoht</strong> rúnakardot, amely már a halandók uralma és a Bűn Háborúja előtti időkből származott. A kard ősi mágiája, kombinálva Siggard bosszúálló akaratával (és nem teljesen "élő" státuszával), képes volt semlegesíteni Assur rúnáját, lehetővé téve a démon lefejezését.</p>
    `
  },
  "earl-edgewulf": {
    id: "earl-edgewulf",
    category: "Karakterek - Nephalem & Emberek",
    title: "Edgewulf Gróf (Earl Edgewulf)",
    subtitle: "Entsteig seregeinek vezére a Fekete Menetelés során",
    infobox: {
      "Frakció": "Entsteig / Brennor",
      "Státusz": "Elhunyt (Fekete Menetelés)",
      "Utódja": "Tilgar Gróf"
    },
    content: `
      <h2>Vezetése és Halála</h2>
      <p><strong>Edgewulf Gróf</strong> Brennor és a környező területek nemes uralkodója és seregeinek fővezére volt. Ő vezette Entsteig haderejét a tragikus <em>Fekete Menetelés</em> (Blackmarch) során, amikor a démoni hordák rajtaütöttek a seregén. Annak ellenére, hogy bátor hadvezér volt, a démonok számbeli és mágikus fölényével szemben serege elbukott, és Edgewulf maga is elesett a csatatéren.</p>
      
      <h2>Öröksége</h2>
      <p>Halála után a hatalmat fia, <strong>Tilgar Gróf</strong> vette át, akinek egy megtizedelt város védelmét kellett megszerveznie Assur közeledő serege ellen. Edgewulf halála szimbolizálta a halandó seregek tehetetlenségét a rejtett démoni invázióval szemben.</p>
    `
  }
};

let d = fs.readFileSync('data.js', 'utf8');

let newArticles = "\n/* DEMONSBANE EXTRA LORE */\n";
for (let key in extraLore) {
  let article = extraLore[key];
  newArticles += `  "${key}": ${JSON.stringify(article, null, 4).replace(/\}$/, '  },')}\n`;
}

// Inject into data.js before the end of wikiData
let targetWiki = /\}\s*\};\s*const timelineData =/g;
d = d.replace(targetWiki, '},\n' + newArticles + '\n};\n\nconst timelineData =');

fs.writeFileSync('data.js', d, 'utf8');
console.log("Extra lore injected.");
