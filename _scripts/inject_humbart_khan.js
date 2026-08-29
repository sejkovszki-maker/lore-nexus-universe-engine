const fs = require('fs');

const humbartAndKhan = `,
  "humbart-wessel": {
    id: "humbart-wessel",
    category: "Lore / Karakterek - Olvasó",
    title: "Humbart Wessel",
    subtitle: "A Beszélő Koponya",
    infobox: {
      "Állapot": "Élőhalott (Koponya)",
      "Előző Élet": "Zsoldos, Kalandor",
      "Társ": "Zayl",
      "Képességek": "Hatalmas tudás, harapás, figyelemelterelés"
    },
    content: \`
      <h2>Bevezetés</h2>
      <p><strong>Humbart Wessel</strong> talán a legkülönlegesebb kísérő az egész Diablo univerzumban. Bár fizikailag csak egy foghíjas, emberi koponya, személyisége, humora és bölcsessége miatt hamar a rajongók kedvencévé vált. Ő Zayl, a nekromanta hűséges társa és tanácsadója, akit a nekromanta sötét, de egyensúlyt kereső mágiája tart életben (vagy inkább tudatánál).</p>

      <h2>Élete Zsoldosként</h2>
      <p>Mielőtt egy beszélő koponyává vált volna, Humbart Wessel egy híres, sőt legendás zsoldos volt. Életében bejárta egész Sanctuary-t, számtalan csatát vívott, és rengeteg kincset megismert. Tapasztalata és cinikus világlátása ebből a zord, véres korszakból származik. Halálának pontos körülményei homályosak, de az biztos, hogy halála után koponyája Zayl birtokába került.</p>

      <h2>A Koponya Élete</h2>
      <p>Zayl rathmiánus varázslattal ébresztette fel Humbart tudatát. A varázslat nem kötötte szolgaságba a lelkét; Humbart megőrizte szabad akaratát és személyiségét, bár helyhez (pontosabban a koponyához) van kötve. Humbart gyakran utazik Zayl köpenyének zsebében, vagy a nekromanta kezében pihen, onnan kommentálva az eseményeket.</p>

      <p>Bár fizikai ereje egy koponyára korlátozódik, Humbart meglepően hasznos:
      <ul>
        <li><strong>Figyelmeztetés:</strong> Képes észlelni a veszélyeket és a sötét mágiát, gyakran megmentve Zayl életét.</li>
        <li><strong>Harapás:</strong> Ha egy ellenség túl közel merészkedik, Humbart nem fél beleharapni (ami egy koponyától meglepően fájdalmas lehet).</li>
        <li><strong>Figyelemelterelés:</strong> Mivel a legtöbb ember (és démon) nem számít egy repülő vagy beszélő koponyára, Zayl gyakran használja őt a harcokban zavarkeltésre.</li>
      </ul></p>

      <h2>Szerepe az Árnyak Királyságában</h2>
      <p>A <em>The Kingdom of Shadow</em> eseményei alatt Humbart folyamatosan tanácsokkal látja el Kentril Dumont és Zayl-t. Cinikus megjegyzéseivel és éleslátásával ő az, aki gyakran kimondja azt a kényelmetlen igazságot, amit a többiek nem akarnak meghallani Ureh városáról. Kapcsolata Zayllel olyan, mint két öreg baráté, akik folyamatosan évődnek egymással, de az életüket is rábíznák a másikra.</p>
    \`
  },
  "juris-khan": {
    id: "juris-khan",
    category: "Lore / Karakterek - Olvasó",
    title: "Juris Khan",
    subtitle: "Ureh Uralkodója és Elátkozója",
    infobox: {
      "Foglalkozás": "Ureh Ura, Varázsló",
      "Szövetséges": "Diablo (A Rettegés Ura)",
      "Állapot": "Démoni Árnyék",
      "Képességek": "Illúzió, Nekromancia, Démonidézés"
    },
    content: \`
      <h2>Bevezetés</h2>
      <p><strong>Juris Khan</strong> a legendás Ureh városának uralkodója, és a <em>The Kingdom of Shadow</em> regény főgonosza. Egykor egy bölcs és tisztelt varázsló-király volt, akinek uralkodása alatt Ureh a "Fények Közötti Fény" (The Light among Lights) néven vált ismertté. Khan hatalomvágya és egy angyali illúzió azonban végül a saját és népe pusztulásához vezetett.</p>

      <h2>A Fények Közötti Fény</h2>
      <p>Ureh városa Nymyr hegyének lábánál feküdt, és Juris Khan vezetésével virágzott. A város olyan spirituális tisztaságot és gazdagságot ért el, hogy sokan azt hitték, képesek lennének egyenesen a Magas Mennyekbe (High Heavens) emelkedni. Khan a legképzettebb mágusokat gyűjtötte maga köré, és folyamatosan kereste a kapcsolatot az angyalokkal.</p>

      <h2>Mirakodus és a Bukás</h2>
      <p>Khan imáira végül válasz érkezett: egy Mirakodus nevű "arkangyal" jelent meg előtte. Mirakodus egy rituálét tanított Khannak, amely állítása szerint az egész várost a Mennyekbe emeli. A fanatikus Khan ráerőltette a rituálét a város lakóira.</p>
      
      <p>Azonban a rituálé közepén Gregus Mazi, egy másik varázsló, rájött a szörnyű igazságra: Mirakodus nem arkangyal volt, hanem maga <strong>Diablo, a Rettegés Ura</strong> álcázva. Bár Mazi megpróbálta megállítani a varázslatot, már túl késő volt. A rituálé megszakadt, és Ureh a Mennyek és a Pokol közötti limbóba (Limbo) zuhant.</p>

      <h2>Az Árnyak Királya</h2>
      <p>Juris Khan nem halt meg. Ehelyett teste és lelke démoni korrupciót szenvedett el. Ahogy teltek az évszázadok a sötét dimenzióban, Khan teljesen azonosult Diablo akaratával. Amikor a csillagok együttállása miatt Ureh időnként visszatért Sanctuary-ba, Khan és az átalakult, élőhalott/démoni lakosok megpróbálták kiszabadítani magukat a limbóból, hogy Diablo seregeként árasszák el a világot.</p>
      
      <p>Külseje is borzalmasan megváltozott: a korábban büszke király egy torz, árnyékokból és sötét mágiából álló lény lett, aki kegyetlenül feláldozott mindenkit, aki az útjába állt.</p>

      <h2>Végső Bukása</h2>
      <p>Kentril Dumon, Zayl, a nekromanta és társaik expedíciója végül szembeszállt Juris Khannal. Zayl csontmágiája és Kentril bátorsága révén sikerült megtörniük Khan sötét varázslatát. Khan elpusztult, és Ureh átka megváltozott, megakadályozva, hogy a város valaha is a Pokol kapujává váljon.</p>
    \`
  }`;

let data = fs.readFileSync('data.js', 'utf8');

if (!data.includes('"juris-khan":')) {
    data = data.replace('};\n\nconst timelineData = [', humbartAndKhan + '\n};\n\nconst timelineData = [');
    fs.writeFileSync('data.js', data, 'utf8');
    console.log('Successfully injected Humbart and Juris Khan!');
} else {
    console.log('Articles already exist!');
}
