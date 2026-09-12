import type { WikiArticles } from '../../types.ts';

const sourceNote = `<h2>Ellenőrzési alap</h2><p>A könyves történeti ág Andrzej Sapkowski műveire épül. A CD PROJEKT RED játékai és a Netflix feldolgozásai külön folytonosságként szerepelnek, ezért eltéréseik nem írják felül a regényeket.</p>`;

export const witcherArticles: WikiArticles = {
  'witcher-world': {
    id: 'witcher-world', universeId: 'witcher', universeLabel: 'Vaják', category: 'Világ', title: 'A Kontinens világa', subtitle: 'Emberek, tündék, törpök és szörnyek földje', lastEdited: 10,
    content: `<h2>A Kontinens</h2><p>A Vaják történeteinek világa politikailag széttagolt földrész. Északon királyságok vetélkednek, délről a Nilfgaardi Birodalom terjeszkedik, a nem emberi népek pedig üldöztetéssel és felkelésekkel szembesülnek.</p><h2>Varázslat és hatalom</h2><p>A mágia a társadalom és az államok működésének része. A varázslók tanácsadók, diplomaták és hatalmi szereplők, de szervezeteik saját érdekeiket is követik.</p>${sourceNote}`
  },
  'witcher-conjunction': {
    id: 'witcher-conjunction', universeId: 'witcher', universeLabel: 'Vaják', category: 'Történelem', title: 'A Szférák Együttállása', subtitle: 'A világok találkozása és a szörnyek megjelenése', lastEdited: 20,
    relatedArticles: ['witcher-world', 'witcher-witchers'], content: `<h2>Világok ütközése</h2><p>A Szférák Együttállása során különböző világok határai átjárhatóvá váltak. Számos lény és mágikus jelenség ekkor került a Kontinensre; az emberiség eredetét is ehhez a kozmikus eseményhez kapcsolják.</p><h2>Bizonytalanság</h2><p>Az esemény távoli múlt, amelyet a szereplők töredékes tudásból ismernek. A könyvek, játékok és képernyős feldolgozások részletei ezért külön kezelendők.</p>${sourceNote}`
  },
  'witcher-witchers': {
    id: 'witcher-witchers', universeId: 'witcher', universeLabel: 'Vaják', category: 'Rendek', title: 'A vajákok', subtitle: 'Mutációval képzett hivatásos szörnyvadászok', lastEdited: 30,
    relatedArticles: ['witcher-geralt', 'witcher-conjunction'], content: `<h2>Kik a vajákok?</h2><p>A vajákokat gyermekkoruktól képezik, majd veszélyes alkímiai és mágikus változtatásoknak vetik alá. Felfokozott érzékeik, reflexeik, elixírjeik, jeleik és szörnyismeretük teszi őket különleges vadászokká.</p><h2>Az Út</h2><p>Munkájukért fizetséget kérnek, de döntéseiket nem lehet egyszerű közömbösségre redukálni. Geralt történetei újra és újra megmutatják, hogy az emberi kegyetlenség gyakran veszélyesebb a bestiáknál.</p>${sourceNote}`
  },
  'witcher-geralt': {
    id: 'witcher-geralt', universeId: 'witcher', universeLabel: 'Vaják', category: 'Karakterek', title: 'Ríviai Geralt', subtitle: 'A Fehér Farkas és Ciri választott apja', lastEdited: 40,
    infobox: { 'Foglalkozás': 'vaják', 'Ismert név': 'Fehér Farkas', 'Kötődés': 'Ciri, Yennefer, Kökörcsin' }, relatedArticles: ['witcher-ciri', 'witcher-yennefer', 'witcher-witchers'],
    content: `<h2>Szörnyvadász</h2><p>Geralt Kaer Morhenben nevelkedett és a mutációkat követően vajákként járta a Kontinenst. Ríviai előnevét maga választotta, majd később valódi lovagi címet is kapott.</p><h2>A sors kötelékei</h2><p>Yenneferhez viharos szerelem, Cirihez pedig a Meglepetés Törvényéből kiinduló, később tudatosan vállalt apai kapcsolat fűzi. Történetének központi kérdése, hogy lehet-e erkölcsösen dönteni olyan helyzetekben, ahol nincs tiszta választás.</p>${sourceNote}`
  },
  'witcher-yennefer': {
    id: 'witcher-yennefer', universeId: 'witcher', universeLabel: 'Vaják', category: 'Karakterek', title: 'Vengerbergi Yennefer', subtitle: 'Varázslónő, Geralt társa és Ciri anyai oltalmazója', lastEdited: 50,
    infobox: { 'Hivatás': 'varázslónő', 'Származás': 'Vengerberg', 'Kötődés': 'Geralt és Ciri' }, relatedArticles: ['witcher-geralt', 'witcher-ciri'],
    content: `<h2>Hatalom és függetlenség</h2><p>Yennefer rendkívül képzett varázslónő, aki nem hajlandó puszta udvari eszközzé válni. Keménysége mögött erős kötődés és a család iránti vágy húzódik.</p><h2>Ciri tanítója</h2><p>Cirit mágiára, önfegyelemre és túlélésre tanítja. Kapcsolatuk idővel anya–lánya kötelékké válik, amely Geralt mellett a könyvsaga érzelmi középpontja.</p>${sourceNote}`
  },
  'witcher-ciri': {
    id: 'witcher-ciri', universeId: 'witcher', universeLabel: 'Vaják', category: 'Karakterek', title: 'Cirilla Fiona Elen Riannon', subtitle: 'Cintra hercegnője, az Ősi Vér örököse', lastEdited: 60,
    infobox: { 'Becenév': 'Ciri', 'Származás': 'Cintra', 'Örökség': 'Ősi Vér' }, relatedArticles: ['witcher-geralt', 'witcher-yennefer', 'witcher-wild-hunt'],
    content: `<h2>A Meglepetés Gyermeke</h2><p>Ciri Calanthe királynő unokája és Cintra örököse. Sorsa Geralthoz kötődik, de nem passzív megmentendő szereplő: veszteségei, kiképzése és döntései önálló főhőssé formálják.</p><h2>Az Ősi Vér</h2><p>Öröksége különleges tér- és világkapcsolati képességekkel jár, ezért uralkodók, varázslók és természetfeletti üldözők is fel akarják használni.</p>${sourceNote}`
  },
  'witcher-northern-realms': {
    id: 'witcher-northern-realms', universeId: 'witcher', universeLabel: 'Vaják', category: 'Helyszínek', title: 'Az Északi Királyságok', subtitle: 'Temeria, Redania, Kaedwen, Aedirn és szövetségeseik', lastEdited: 70,
    relatedArticles: ['witcher-nilfgaard', 'witcher-world'], content: `<h2>Megosztott Észak</h2><p>Az északi államokat dinasztikus érdekek, területi viták és törékeny szövetségek választják el. Nilfgaard támadásai időnként összefogásra kényszerítik őket, de az egység ritkán tartós.</p><h2>Társadalmi feszültségek</h2><p>Az emberek és nem emberek közötti üldöztetés, valamint a Scoia’tael felkelései a háborúk állandó kísérői.</p>${sourceNote}`
  },
  'witcher-nilfgaard': {
    id: 'witcher-nilfgaard', universeId: 'witcher', universeLabel: 'Vaják', category: 'Frakciók', title: 'A Nilfgaardi Birodalom', subtitle: 'A déli nagyhatalom és északi hadjáratai', lastEdited: 80,
    relatedArticles: ['witcher-ciri', 'witcher-northern-realms'], content: `<h2>A Fehér Láng birodalma</h2><p>Nilfgaard központosított, terjeszkedő hatalom, amely katonai erővel és politikai befolyással igyekszik uralma alá vonni Északot. Emhyr var Emreis terveiben Ciri származása kulcsszerepet kap.</p><h2>Nézőpontok</h2><p>A könyvek nem egységes, arctalan gonoszként ábrázolják a birodalmat: hódítása kegyetlen, miközben alattvalói és ellenfelei eltérő tapasztalatokkal rendelkeznek.</p>${sourceNote}`
  },
  'witcher-wild-hunt': {
    id: 'witcher-wild-hunt', universeId: 'witcher', universeLabel: 'Vaják', category: 'Frakciók', title: 'A Vad Hajsza', subtitle: 'A világok között járó kísérteties lovasok', lastEdited: 90,
    relatedArticles: ['witcher-ciri', 'witcher-conjunction'], content: `<h2>Aen Elle lovasok</h2><p>A Vad Hajsza nem puszta népi jelenés: másik világból érkező Aen Elle tündék csoportja. Ciri képességei lehetővé tennék számukra a világok közötti mozgás korlátainak áttörését.</p><h2>Könyv és játék</h2><p>A könyvek és a CD PROJEKT RED játékai ugyanarra az alapra építenek, de a játékok önálló folytatási ágat alkotnak.</p>${sourceNote}`
  },
  'witcher-games-branch': {
    id: 'witcher-games-branch', universeId: 'witcher', universeLabel: 'Vaják', category: 'Feldolgozások', title: 'A Witcher-játékok történeti ága', subtitle: 'Geralt történetének CD PROJEKT RED-folytatása', lastEdited: 100,
    relatedArticles: ['witcher-geralt', 'witcher-ciri', 'witcher-wild-hunt'], content: `<h2>Külön folytatási ág</h2><p>A három eredeti szerepjáték Sapkowski könyvei után mesél saját történetet. Az első játék Vizimában a Salamandrát követi; a másodikban Geraltot királygyilkossággal vádolják; a harmadikban Cirit keresi a Vad Hajsza előtt.</p><h2>Új saga</h2><p>A CD PROJEKT RED hivatalos közlése szerint a The Witcher IV új sagát kezd, Ciri pedig hivatásos szörnyvadászként indul útnak. Ez játékfolytonosság, nem a könyvek utólagos átírása.</p><h2>Forrás</h2><p><a href="https://www.thewitcher.com/gb/en/classics" target="_blank" rel="noopener noreferrer">The Witcher – a játék-trilógia hivatalos áttekintése</a></p>`
  },
  'witcher-screen-branch': {
    id: 'witcher-screen-branch', universeId: 'witcher', universeLabel: 'Vaják', category: 'Feldolgozások', title: 'A képernyős Vaják-feldolgozások', subtitle: 'Netflix-sorozatok és animációk külön folytonossága', lastEdited: 110,
    relatedArticles: ['witcher-geralt', 'witcher-yennefer', 'witcher-ciri'], content: `<h2>Adaptáció, nem azonos történet</h2><p>A Netflix élőszereplős sorozata Sapkowski történeteit dolgozza fel, de jeleneteket, időrendet és szereplői háttereket módosít. A Nightmare of the Wolf, Blood Origin és Sirens of the Deep ehhez a képernyős világhoz kapcsolódik.</p><p>A wiki ezért ezeket nem keveri a könyves vagy játékos eseménysorral.</p><h2>Forrás</h2><p><a href="https://about.netflix.com/en/news/the-witcher-saga-coming-to-netflix" target="_blank" rel="noopener noreferrer">Netflix: a könyvsaga adaptációjának bejelentése</a></p>`
  },

  'witcher-book-crossroads-ravens': book('witcher-book-crossroads-ravens', 'Hollók válaszútja', 'Crossroads of Ravens / Rozdroże kruków', 'witcher-witchers', 'A fiatal Geralt első lépéseit és Preston Holt mentorálását bemutató önálló előzményregény.', 'https://www.hachettebookgroup.com/titles/andrzej-sapkowski/crossroads-of-ravens/9780316597739/'),
  'witcher-book-last-wish': book('witcher-book-last-wish', 'Az utolsó kívánság', 'Ostatnie życzenie', 'witcher-geralt', 'A Geraltot, Yennefert és a világ alaphelyzeteit bemutató novellafüzér; ajánlott első olvasmány.', 'https://www.hachettebookgroup.com/titles/andrzej-sapkowski/the-last-wish/9780316333528/'),
  'witcher-book-season-storms': book('witcher-book-season-storms', 'Viharidő', 'Sezon burz', 'witcher-geralt', 'Geralt korai korszakában játszódó önálló regény; első olvasáskor célszerű a fősaga után olvasni.', 'https://www.hachettebookgroup.com/series/the-witcher/'),
  'witcher-book-sword-destiny': book('witcher-book-sword-destiny', 'A végzet kardja', 'Miecz przeznaczenia', 'witcher-yennefer', 'A Geralt és Ciri közötti sorskapcsolatot felépítő második novelláskötet.', 'https://www.hachettebookgroup.com/series/the-witcher/'),
  'witcher-book-blood-elves': book('witcher-book-blood-elves', 'Tündevér', 'Krew elfów', 'witcher-ciri', 'A regénysaga nyitánya: Ciri Kaer Morhen-i kiképzése és a háborús veszély kibontakozása.', 'https://www.hachettebookgroup.com/series/the-witcher/'),
  'witcher-book-time-contempt': book('witcher-book-time-contempt', 'A megvetés ideje', 'Czas pogardy', 'witcher-northern-realms', 'A politikai és mágikus rend széthullása elszakítja egymástól Geraltot, Yennefert és Cirit.', 'https://www.hachettebookgroup.com/series/the-witcher/'),
  'witcher-book-baptism-fire': book('witcher-book-baptism-fire', 'Tűzkeresztség', 'Chrzest ognia', 'witcher-nilfgaard', 'Geralt társakat gyűjt, és háborús területeken indul Ciri keresésére.', 'https://www.hachettebookgroup.com/series/the-witcher/'),
  'witcher-book-tower-swallow': book('witcher-book-tower-swallow', 'Fecske-torony', 'Wieża Jaskółki', 'witcher-wild-hunt', 'Ciri menekülése és múltjának elbeszélése a saga végjátéka felé vezet.', 'https://www.hachettebookgroup.com/series/the-witcher/'),
  'witcher-book-lady-lake': book('witcher-book-lady-lake', 'A tó úrnője', 'Pani Jeziora', 'witcher-wild-hunt', 'A fő könyvsaga lezárása, amely összefuttatja Ciri, Geralt, Yennefer és a háború történetszálait.', 'https://www.hachettebookgroup.com/series/the-witcher/'),
};

function book(id: string, title: string, originalTitle: string, storyAfter: string, description: string, url: string) {
  return {
    id, universeId: 'witcher', universeLabel: 'Vaják', type: 'book' as const, creativeWorkType: 'novel' as const, category: 'Könyvek', title,
    subtitle: originalTitle, storyAfter, description, content: `<h2>A mű helye</h2><p>${description}</p><h2>Szerző</h2><p>Andrzej Sapkowski</p><h2>Olvasási megjegyzés</h2><p>Ez az oldal bibliográfiai és történeti ismertető. A teljes könyv csak jogszerűen beszerzett saját példányból importálható a helyi olvasóba.</p><h2>Kiadói forrás</h2><p><a href="${url}" target="_blank" rel="noopener noreferrer">Hachette / Orbit – The Witcher könyvsorozat</a></p>`
  };
}
