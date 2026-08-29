const fs = require('fs');

const massiveLore = {
  // ANGYALOK - ANGIRIS COUNCIL
  "imperius": {
    id: "imperius",
    category: "Karakterek - Angyalok",
    title: "Imperius",
    subtitle: "A Bátorság Arkangyala",
    infobox: {
      "Frakció": "Mennyei Seregek",
      "Rang": "Az Angiris Tanács Vezetője (informális)",
      "Fegyver": "Solarion (A Bátorság Lándzsája)",
      "Lakhely": "A Bátorság Csarnoka (High Heavens)"
    },
    content: `
      <h2>Leírás és Szerep</h2>
      <p><strong>Imperius</strong> a Bátorság Arkangyala, a Mennyei Seregek legnagyobb harcosa és stratégája. Az Angiris Tanács (Angiris Council) de facto vezetője Malthael távozása után. A démonok elleni Örök Konfliktus leghevesebb és leghajthatatlanabb támogatója.</p>
      <h2>Személyisége és Története</h2>
      <p>Imperius büszke, arrogáns és forrófejű. Megveti a démonokat, de a nephalemeket és az embereket (Menedék lakóit) is sötétnek és megbízhatatlannak tartja a démoni vérvonaluk miatt. Tyraellel, az Igazság Arkangyalával gyakran keveredik éles konfliktusba, különösen azután, hogy Tyrael az emberek oldalára állt. A Diablo III eseményei során Imperius egy az egy elleni harcot vívott Diablóval a Gyémántkapunál, de vereséget szenvedett, ami után a Mennyeket lerohanták.</p>
    `
  },
  "auriel": {
    id: "auriel",
    category: "Karakterek - Angyalok",
    title: "Auriel",
    subtitle: "A Remény Arkangyala",
    infobox: {
      "Frakció": "Mennyei Seregek",
      "Rang": "Az Angiris Tanács Tagja",
      "Fegyver": "Al'maiesh (A Remény Zsinórja)",
      "Lakhely": "A Remény Kertjei (High Heavens)"
    },
    content: `
      <h2>Leírás és Szerep</h2>
      <p><strong>Auriel</strong> a Remény Arkangyala, a leginkább optimista és békés tagja az Angiris Tanácsnak. Ő az a fény, amely a legmélyebb sötétségben is pislákol, harmonizálja az Angyali seregeket és az arkangyalok közötti ellentéteket.</p>
      <h2>Története</h2>
      <p>Fegyvere, az Al'maiesh nem pusztít, hanem gyógyít, megbékéltet, de harcban ostorként is használható. Amikor a Bűn Háborúja (Sin War) végén a Tanács Menedék (Sanctuary) elpusztításáról szavazott, Auriel volt az első, aki a megmentésükre voksolt, látva bennük a jóra való képességet és a reményt. A Diablo III-ban Rakanoth börtönözte be, de a Nephalem kiszabadította, visszaállítva a reményt a Mennyekben.</p>
    `
  },
  "itherael": {
    id: "itherael",
    category: "Karakterek - Angyalok",
    title: "Itherael",
    subtitle: "A Sors Arkangyala",
    infobox: {
      "Frakció": "Mennyei Seregek",
      "Rang": "Az Angiris Tanács Tagja",
      "Ereklye": "Talus'ar (A Sors Tekercse)",
      "Lakhely": "A Sors Könyvtára (High Heavens)"
    },
    content: `
      <h2>Leírás és Szerep</h2>
      <p><strong>Itherael</strong> a Sors Arkangyala, az a lény, aki képes átlátni a tér és idő szövetén. Nem jósolja a jövőt a szó hagyományos értelmében, hanem az események valószínű kimeneteleit olvassa a Talus'ar-ból, a Sors Tekercséből.</p>
      <h2>Menedék Különlegessége</h2>
      <p>Itherael rendkívül fontos felfedezést tett: Menedék lakói, a nephalemek nem szerepelnek a sors tekercseiben, mivel ők egy "természetellenes" egyesülés (angyal és démon) eredményei. Ezért tetteik kiszámíthatatlanok. A Bűn Háborúja végén Auriellel egyetértve Menedék fennmaradása mellett szavazott, mivel úgy látta, az emberiség puszta létezése is megváltoztathatja az Örök Konfliktus egyensúlyát.</p>
    `
  },
  "malthael": {
    id: "malthael",
    category: "Karakterek - Angyalok",
    title: "Malthael",
    subtitle: "A Bölcsesség (később a Halál) Arkangyala",
    infobox: {
      "Frakció": "Mennyei Seregek / Kaszások (Reapers)",
      "Eredeti Rang": "Az Angiris Tanács Vezetője",
      "Új Titulus": "A Halál Angyala",
      "Fegyver": "Soul Rippers (Kaszák)"
    },
    content: `
      <h2>A Bölcsesség Angyala</h2>
      <p><strong>Malthael</strong> egykor az Angiris Tanács vezetője és a Bölcsesség Arkangyala volt. A Világkő (Worldstone) ellopása Inarius és Lilith által (Menedék teremtésekor) olyannyira megtörte, hogy elkezdett elszigetelődni és a komorságba süllyedni. A Világkő elpusztulása (Diablo II vége) után Malthael nyomtalanul eltűnt a Mennyekből, és a Bölcsesség odalett.</p>
      <h2>A Halál Angyala (Reaper of Souls)</h2>
      <p>Évekkel később Malthael rájött, hogy a démoni esszencia sosem irtható ki teljesen, amíg az emberiség (amelyben jelen van) létezik. Ezért átalakult a Halál Angyalává. Ellopta a Fekete Lélekkövet (Black Soulstone), hogy kiszívja vele az összes démoni esszenciát Menedékből, ami egyben az egész emberiség kipusztulását is jelentette volna. A Nephalem végül a Pandemonium Erődben állította meg.</p>
    `
  },
  "tyrael": {
    id: "tyrael",
    category: "Karakterek - Angyalok",
    title: "Tyrael",
    subtitle: "Az Igazság (majd a Bölcsesség) Arkangyala",
    infobox: {
      "Frakció": "Mennyei Seregek / Emberiség",
      "Rang": "Az Angiris Tanács Tagja (később Halandó)",
      "Fegyver": "El'druin (Az Igazság Kardja)"
    },
    content: `
      <h2>Leírás és Szerep</h2>
      <p><strong>Tyrael</strong> vitathatatlanul az emberiség legnagyobb védelmezője a Mennyekben. Eredetileg ő volt a legszigorúbb az Örök Konfliktus során, de amikor látta Uldyssian önfeláldozását a Bűn Háborújában, rájött, hogy a halandókban több nemesség rejtőzhet, mint a Mennyek seregeiben. Ő szervezte meg a Horadrim rendet a Három Fő Gonosz bebörtönzésére.</p>
      <h2>Halandóvá Válása</h2>
      <p>A Diablo III-ban Tyrael szembeszállt Imperiusszal, kijelentve, hogy a Mennyek törvényei már nem szolgálják az igazságot, ha tétlenül nézik a pusztítást. Tyrael letépte saját angyali szárnyait, és <strong>halandóként</strong> hullott le Menedékre (Tristramba, mint a "Hullócsillag"). Később, Malthael bukása után felvette a Bölcsesség Aspektusát, bár továbbra is halandó maradt, jelezve a Mennyek és Menedék új szövetségét.</p>
    `
  },

  // FŐ GONOSZOK - PRIME EVILS
  "mephisto": {
    id: "mephisto",
    category: "Karakterek - Démonok",
    title: "Mephisto",
    subtitle: "A Gyűlölet Ura (Lord of Hatred)",
    infobox: {
      "Rang": "Fő Gonosz (Prime Evil)",
      "Frakció": "Lángoló Poklok (Burning Hells)",
      "Testvérek": "Baal, Diablo",
      "Gyermekek": "Lilith, Lucion"
    },
    content: `
      <h2>A Legidősebb Testvér</h2>
      <p>Dul'Mephistos, azaz <strong>Mephisto</strong> a Gyűlölet Ura, a legidősebb, legokosabb és leghatékonyabb manipulátor a Három Fő Gonosz közül. Az ő gyűlölete táplálja a Lángoló Poklok erejének nagy részét. Képes angyalokat és démonokat egyaránt egymás ellen fordítani. Ő Lilith (Menedék teremtője) és Lucion apja.</p>
      <h2>Szerepe Menedéken</h2>
      <p>A Sötét Száműzetés (Dark Exile) után a Horadrim a Zakarum templomvárosában, Kurastban börtönözte be (Travincal alatt). Azonban az évszázadok során Mephisto kiterjesztette gyűlöletét, és szép lassan megrontotta az egész Zakarum papságot (Que-Hegan-t és a Főtanácsot), fanatikus rabszolgáivá téve őket. Ő volt az agy a Prime Evils kiszabadulási tervének hátterében a Diablo II során.</p>
    `
  },
  "baal": {
    id: "baal",
    category: "Karakterek - Démonok",
    title: "Baal",
    subtitle: "A Pusztítás Ura (Lord of Destruction)",
    infobox: {
      "Rang": "Fő Gonosz (Prime Evil)",
      "Frakció": "Lángoló Poklok (Burning Hells)",
      "Testvérek": "Mephisto, Diablo"
    },
    content: `
      <h2>A Pusztítás Maga</h2>
      <p>Tor'Baalos, azaz <strong>Baal</strong> a Pusztítás Ura. Bár nem olyan ravasz, mint Mephisto, vagy olyan félelmetes, mint Diablo, Baal egy színtiszta, brutális erő, aki magában a megsemmisítésben és a káoszban leli örömét. Ő az Örök Konfliktus egyik legdurvább tábornoka.</p>
      <h2>Tal Rasha és a Világkő</h2>
      <p>Amikor a Horadrim megpróbálta bebörtönözni, Baal összetörte a számára szánt Sárga Lélekkövet. Tal Rasha, a Horadrim vezetője önként jelentkezett, hogy a saját testébe fogadja a törött kő szilánkját, és a sivatag mélyén lekötözve tartsa kordában a démont az idők végezetéig. Diablo végül kiszabadította, majd Baal északra, a Barbár Felföldökre (Mount Arreat) ment, hogy megfertőzze a Világkövet (Worldstone). Bár a hősök legyőzték, a Világkő menthetetlenül korrumpálódott, így Tyraelnek el kellett pusztítania azt.</p>
    `
  },

  // KISEBB GONOSZOK - LESSER EVILS
  "andariel": {
    id: "andariel",
    category: "Karakterek - Démonok",
    title: "Andariel",
    subtitle: "A Kínok Leánya (Maiden of Anguish)",
    infobox: {
      "Rang": "Kisebb Gonosz (Lesser Evil)",
      "Frakció": "Lángoló Poklok (Burning Hells)"
    },
    content: `
      <p><strong>Andariel</strong> az egyetlen női Lesser Evil, a mentális és érzelmi kínok, a szenvedés és bűntudat megtestesítője. Bár részt vett a Sötét Száműzetés (Dark Exile) megtervezésében a Prime Evils ellen, később, amikor Diablo megérkezett Menedékre, behódolt neki. A Diablo II során Andariel őrizte az apácák kolostorát (Rogue Monastery), hogy elzárja a hősök útját Kelet felé, míg végül legyőzték.</p>
    `
  },
  "duriel": {
    id: "duriel",
    category: "Karakterek - Démonok",
    title: "Duriel",
    subtitle: "A Fájdalom Ura (Lord of Pain)",
    infobox: {
      "Rang": "Kisebb Gonosz (Lesser Evil)",
      "Frakció": "Lángoló Poklok (Burning Hells)"
    },
    content: `
      <p><strong>Duriel</strong> Andariel ikertestvére (bizonyos értelmezések szerint). Míg Andariel a lelki kínok úrnője, Duriel a tiszta fizikai fájdalom, a tortúra és a pusztítás szadista mestere. Andarielhez hasonlóan ő is megbánta a Fő Gonoszok elárulását. Amikor Diablo kiszabadította Baalt Tal Rasha sírjából, Durielt hagyta hátra, hogy őrizze a sírt és elpusztítsa az őket üldöző hősöket. Megjelenésében egy hatalmas, groteszk ízeltlábúra emlékeztet.</p>
    `
  },
  "belial": {
    id: "belial",
    category: "Karakterek - Démonok",
    title: "Belial",
    subtitle: "A Hazugság Ura (Lord of Lies)",
    infobox: {
      "Rang": "Kisebb Gonosz (Lesser Evil)",
      "Frakció": "Lángoló Poklok (Burning Hells)"
    },
    content: `
      <p><strong>Belial</strong> a megtévesztés, az illúziók és az árulás mestere. Az ő hazugságai szították a lázadást a Pokolban, ami a Sötét Száműzetéshez vezetett. Az ezt követő pokoli polgárháborúban összecsapott Azmodannal. A Diablo III során Belial Caldeum városába fészkelte be magát, ahol Hakan Császár képében (egy gyermek képében) vette át az irányítást, és démoni szolgáit (akik embernek álcázták magukat) a város őrségébe integrálta.</p>
    `
  },
  "azmodan": {
    id: "azmodan",
    category: "Karakterek - Démonok",
    title: "Azmodan",
    subtitle: "A Bűn Ura (Lord of Sin)",
    infobox: {
      "Rang": "Kisebb Gonosz (Lesser Evil)",
      "Frakció": "Lángoló Poklok (Burning Hells)"
    },
    content: `
      <p><strong>Azmodan</strong> a Pokol legnagyobb és legzseniálisabb taktikusa és hadvezére, akit sosem győztek le csatatéren az Angiris Tanács seregei. A Bűn Urának hét démonparancsnoka volt (a hét főbűn megtestesítői). A Diablo III során hatalmas démoni inváziót indított Bastion's Keep (Az Erőd) ellen, hogy megszerezze a Fekete Lélekkövet és magába olvasztva annak erejét Ő legyen az Egyetlen Fő Gonosz (The Prime Evil). Végül a Nephalem a pokol legmélyén (Arreat Kráterében) elpusztította.</p>
    `
  },

  // HORADRIM
  "tal-rasha": {
    id: "tal-rasha",
    category: "Karakterek - Nephalem & Emberek",
    title: "Tal Rasha",
    subtitle: "A Horadrim Rend Eredeti Vezetője",
    infobox: {
      "Frakció": "Horadrim",
      "Szerep": "Mágus, Főmágus",
      "Áldozat": "Baal börtöne"
    },
    content: `
      <h2>A Horadrim Alapítása</h2>
      <p><strong>Tal Rasha</strong> a világ egyik leghatalmasabb mágusa volt, akit Tyrael azért hívott össze (más mágusklánok vezetőivel együtt), hogy létrehozza a Horadrim Rendet. Feladatuk a Sötét Száműzetés során Menedékre szabadult Három Fő Gonosz levadászása és Lélekkövekbe zárása volt.</p>
      <h2>A Végső Áldozat</h2>
      <p>Amikor a Horadrim megütközött Baallal Aranoch sivatagjában, a démon elpusztította az őt foglyul ejteni hivatott Sárga Lélekkövet. A kő legnagyobb szilánkja csupán arra volt elég, hogy egy élőlénybe ágyazva tartsa fogva a démont. Tal Rasha önként vállalta a terhet: a szilánkot a mellkasába szúrták, őt magát pedig élve egy ősi sírbolt (Tal Rasha's Tomb) falához láncolták, hogy örökké küzdjön Baal esszenciájával. Évszázadokkal később Diablo kiszabadította Baalt, Tal Rasha elméje és teste pedig megsemmisült.</p>
    `
  },
  "zoltun-kulle": {
    id: "zoltun-kulle",
    category: "Karakterek - Nephalem & Emberek",
    title: "Zoltun Kulle",
    subtitle: "A Lázadó Horadrim Alkimista",
    infobox: {
      "Frakció": "Horadrim (korábban)",
      "Szerep": "Alkimista, Történész",
      "Alkotás": "A Fekete Lélekkő (Black Soulstone)"
    },
    content: `
      <h2>A Fekete Lélekkő Megalkotója</h2>
      <p><strong>Zoltun Kulle</strong> a Horadrim Rend egyik legerősebb alapítója volt, de sosem bízott meg teljesen az angyalokban. Zseniális alkimista lévén rájött, hogyan alkosson egy saját ereklyét – a Fekete Lélekkövet –, amely nemcsak a Három, de MIND a Hét Gonosz esszenciáját képes egyszerre magába zárni. Hitvallása szerint az emberiségnek (a nephalemeknek) a saját lábára kell állnia, angyalok és démonok segítsége nélkül.</p>
      <h2>Bukása és Visszatérése</h2>
      <p>Túlzott hatalomvágya és sötét kísérletei miatt a többi Horadrim (köztük Tal Rasha) szembefordult vele. Mivel mágikusan halhatatlanná tette magát, nem tudták megölni; ehelyett lefejezték, testrészeit és vérét a Kietlen Homok (Desolate Sands) különböző pontjain rejtették el. A Diablo III-ban a Nephalem feltámasztotta őt, hogy megszerezze a Fekete Lélekkövet. Kulle megpróbálta maga mellé állítani a Nephalemet, de visszautasították, így másodszor (immár véglegesen) is elesett.</p>
    `
  },

  // TÁRGYAK ÉS HELYSZÍNEK
  "soulstones": {
    id: "soulstones",
    category: "Tárgyak & Ereklyék",
    title: "A Lélekkövek (Soulstones)",
    subtitle: "Tyrael ajándéka a Gonoszok bebörtönzésére",
    infobox: {
      "Típus": "Mágikus Börtönök",
      "Készítő": "Tyrael / Worldstone",
      "Vörös Kő": "Diablo",
      "Kék Kő": "Mephisto",
      "Sárga Kő": "Baal"
    },
    content: `
      <p>A <strong>Lélekkövek</strong> a Világkőből (Worldstone) származó mágikus szilánkok voltak, melyeket Tyrael arkangyal adott a Horadrimnak. Feladatuk az volt, hogy magukba zárják a Három Fő Gonosz démoni esszenciáját Menedéken, mivel a démonok a haláluk után egyszerűen visszatértek volna a Pokolba. 
      <br><br>
      Sajnos a kövek hosszú távon nem bírták el a Prime Evils korrupcióját, és a Gonoszok lassan megmérgezték a környezetüket (Mephisto Travincalt, Diablo Tristramot). A Vörös és a Kék követ végül a Hellforge-nál semmisítették meg.</p>
    `
  },
  "black-soulstone": {
    id: "black-soulstone",
    category: "Tárgyak & Ereklyék",
    title: "A Fekete Lélekkő (The Black Soulstone)",
    subtitle: "Zoltun Kulle mesterműve",
    infobox: {
      "Típus": "Mágikus Ereklye",
      "Készítő": "Zoltun Kulle",
      "Kapacitás": "Mind a 7 Gonosz",
      "Státusz": "Elpusztítva (Malthael által)"
    },
    content: `
      <p>A normál Lélekkövekkel ellentétben a <strong>Fekete Lélekkövet</strong> egy halandó (Zoltun Kulle) hozta létre. Képes volt arra, amire az angyali kövek nem: rengeteg angyali és démoni lelket szívott magába, hogy erejét növelje, és képes volt befogadni a Pokol mind a Hét Nagy Urát. 
      <br><br>
      Adria (a boszorkány) és Diablo felhasználta a követ arra, hogy Diablo magába olvassza mind a hét démon esszenciáját, létrehozva "The Prime Evil"-t. Miután Diablót legyőzték, a kő a Mennyekben maradt, de Malthael később ellopta, hogy fegyverként használja. Amikor a Nephalem megküzdött Malthaellel, az Angyal összetörte a követ, elnyelve annak erejét, de halálakor az összes gonosz esszencia ismét kiszabadult a világba.</p>
    `
  }
};

let d = fs.readFileSync('data.js', 'utf8');

let newArticles = "\n/* MASSIVE LORE EXPANSION */\n";
for (let key in massiveLore) {
  let article = massiveLore[key];
  newArticles += `  "${key}": ${JSON.stringify(article, null, 4).replace(/\}$/, '  },')}\n`;
}

// Inject into data.js before the end of wikiData
let targetWiki = /\}\s*\};\s*const timelineData =/g;
d = d.replace(targetWiki, '},\n' + newArticles + '\n};\n\nconst timelineData =');

fs.writeFileSync('data.js', d, 'utf8');
console.log("Massive Lore Injected: 15 New Articles");
