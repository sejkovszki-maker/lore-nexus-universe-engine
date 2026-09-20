import type { WikiArticles } from '../../types.ts';

const blizzardSeasonSource = 'https://news.blizzard.com/en-us/article/24295394/celebrate-30-years-of-diablo-in-season-of-hell-s-legacy';
const songsSource = 'https://press.cdprojektred.com/en/news/1839/the-witcher-3-wild-hunt-remastered-announced-songs-of-the-past-gets-first-look';
const witcher3Source = 'https://www.thewitcher.com/_next/witcher3';
const reignsSource = 'https://www.thewitcher.com/us/en/news/51911/reigns-the-witcher-available-now';
const reignsBackgroundSource = 'https://www.cdprojektred.com/en/blog/177/walking-the-path-with-nerial-and-devolver-digital-to-create-reigns-the-witcher';

export const latestOfficialReleaseArticles: WikiArticles = {
  'season-hells-legacy': {
    id: 'season-hells-legacy',
    universeId: 'diablo',
    universeLabel: 'Diablo',
    category: 'Események – Szezonális történetek',
    title: "Season of Hell's Legacy – A Pokol örökségének szezonja",
    subtitle: 'Diablo harminc évének emlékei és a Főgonoszok visszhangjai',
    lastEdited: 2026092001,
    infobox: {
      'Játék': 'Diablo IV',
      'Szezon': '15. szezon',
      'Kezdet': '2026. szeptember 15.',
      'Történeti státusz': 'hivatalos szezonális történet',
      'Fő ellenfelek': 'Diablo, Baal és Mephisto visszhangjai',
      'Központi alak': 'Deckard Cain elveszett lelke',
    },
    relatedArticles: ['prime-lesser-evils', 'diablo-1-story', 'diablo-2-story', 'diablo-4-loh', 'horadrim-order', 'sanctuary-relics'],
    content: `<h2>Áttekintés</h2><p>A <em>Season of Hell's Legacy</em> a Diablo-sorozat harmincadik évfordulójára készült Diablo IV-szezon. Kerettörténete Sanctuary múltját nem egyszerű történelmi visszaemlékezésként, hanem életre kelt rémálmokként idézi meg. A játékos a korábbi részek meghatározó helyszíneinek és összecsapásainak újraalkotott változataiba lép be, miközben a [[prime-lesser-evils|három Főgonosz|characters]] hatalmának maradványaival szembesül.</p>
    <h2>A szezon történeti alaphelyzete</h2><p>Pandemonium felől halottak térnek vissza, és velük együtt megjelenik [[horadrim-order|Deckard Cain|character]] elveszett lelke. A Horadrim bölcs három sötét vándorra figyelmeztet, akiket Diablo, Baal és Mephisto rémálmai gyötörnek. A feladat nem a történelmi Főgonoszok végleges, jelen idejű feltámadásának bizonyítása, hanem a vándorok lelkéhez tapadt visszhangok legyőzése és a három Gonoszszilánk megszerzése.</p>
    <h2>A három rémálom</h2><p>Diablo visszhangja a [[diablo-1-story|tristrami katedrális|location]] mélyén jelenik meg; Baal emléke az [[diablo-2-lod|Arreat-hegy|location]] pusztulásához kapcsolódik; Mephisto rémálma pedig a [[diablo-2-story|Gyűlölet Börtönébe|location]] vezeti az utazót. Ezek a helyszínek a sorozat múltjának felújított emlékképei. A wiki ezért nem írja át velük a korábbi játékok eseményeit, és nem kezeli őket újabb történelmi ostromként.</p>
    <h2>Gonoszszilánkok és a sötét vándor szerepe</h2><p>A három nagy Gonoszszilánk a Rettegéshez, a Pusztításhoz és a Gyűlölethez kötődik. A viselőjük ideiglenesen maga is sötét vándorrá válik: a kiválasztott Főgonosz jellegzetes ereje időről időre megnyilvánul benne, ugyanakkor sebezhetőbbé is válik ugyanazzal a hatalommal szemben. A szezon ezzel a Diablo-történetek visszatérő kérdését dolgozza fel: meddig használható a Pokol ereje anélkül, hogy az használóját is birtokba venné?</p>
    <h2>Éber rémálmok</h2><p>Az Éber rémálmok három méretben jelennek meg. A legnagyobbak többszintes, csúcskategóriás kazamaták, amelyek a Főgonoszokkal vívott történelmi küzdelmeket idézik fel. A közepes változatok egy-egy klasszikus helyszínt, például a Diablo II Gonoszok Odúját építik újjá. A legkisebbek váratlan, rövid világ-események, amelyek régi ellenfeleket vagy szörnyhullámokat hoznak vissza.</p>
    <h2>Kisebb lélekszilánkok</h2><p>A szezon további szilánkjai Andarielhez, Azmodanhoz, Belialhoz, Durielhez, Lilithhez, Na-Krulhoz és Skarnhoz, valamint a Fekete Lélekkőhöz kapcsolódnak. Ezek elsősorban játékmeneti tárgyak: erős előnyt és ellensúlyozó hátrányt adnak. Jelenlétük nem jelenti automatikusan, hogy valamennyi névadó szereplő fizikailag visszatért a fő történetben.</p>
    <h2>Örökségtárgyak</h2><p>A szezon kilenc, régebbi Diablo-játékokból ismert egyedi tárgyat emel át a Diablo IV-be. Köztük van Leoric koronája, a Jordán Köve, Messerschmidt fosztófejszéje és több más relikvia. A tárgyak mechanikai újraértelmezések, de nevük és leírásuk kapcsolatot teremt Sanctuary korábbi korszakaival.</p>
    <h2>Helye a kánonban</h2><p>A szezon hivatalos Diablo IV-tartalom, de nosztalgikus, szezonális kerettörténete miatt külön rétegben szerepel. Biztos történeti állítás Deckard Cain lelkének figyelmeztetése, a három megszállott vándor és a rémálmok elleni küldetés. A régi csaták újrajátszása emlékkép, ezért nem duplikálható a fő idővonalban. A szezon a [[diablo-4-loh|Lord of Hatred|event]] rendszereire is épít, de nem helyettesíti annak fő kampányát.</p>
    <h2>Forrás és ellenőrzés</h2><p><a href="${blizzardSeasonSource}" target="_blank" rel="noopener noreferrer">Blizzard Entertainment: Celebrate 30 Years of Diablo in Season of Hell's Legacy</a>. A cikk saját magyar összefoglaló; a történeti állításokat elválasztja a tárgy-, jutalom- és játékmeneti adatoktól.</p>`,
  },

  'witcher-songs-of-the-past': {
    id: 'witcher-songs-of-the-past',
    universeId: 'witcher',
    universeLabel: 'Vaják',
    category: 'Játékok – Kiegészítők',
    title: 'The Witcher 3: Wild Hunt – Songs of the Past',
    subtitle: 'Geralt új története Letten látszólag békés vidékén',
    lastEdited: 2026092002,
    infobox: {
      'Típus': 'fizetős történeti kiegészítő',
      'Alapjáték': 'The Witcher 3: Wild Hunt',
      'Főszereplő': 'Ríviai Geralt',
      'Új helyszín': 'Letten',
      'Tervezett megjelenés': '2027',
      'Folytonosság': 'CD PROJEKT RED játékág',
    },
    relatedArticles: ['witcher-letten', 'witcher-geralt', 'witcher-games-branch', 'witcher-wild-hunt', 'witcher-game-codex', 'witcher3-remastered'],
    content: `<h2>Bejelentés</h2><p>A <em>Songs of the Past</em> a The Witcher 3 új, fizetős történeti kiegészítője. A CD PROJEKT RED 2026-ban mutatta be, 2027-es megjelenési tervvel. A főszereplő ismét [[witcher-geralt|Ríviai Geralt|character]], a történet pedig egy korábban nem látott birodalomba, [[witcher-letten|Lettenbe|location]] vezeti.</p>
    <h2>Letten felszíne és titka</h2><p>A hivatalos ismertető Letten földjét vidéki hagyományokat őrző, idilli tájként mutatja be. A békés kép alatt azonban régóta szunnyadó sötétség rejtőzik. Geralt feladata új, korábban nem látott ellenfelekkel szembesíti. A nyilvános anyag ennél részletesebb történeti fordulatokat még nem erősít meg, ezért a wiki nem talál ki szereplőket, szörnyneveket vagy küldetéseket.</p>
    <h2>Helye a játékfolytonosságban</h2><p>A kiegészítő a [[witcher-games-branch|CD PROJEKT RED játékágához|continuity]] tartozik. A könyvsaga világára és szereplőire épül, de nem tekinthető Andrzej Sapkowski regényei új fejezetének. A pontos időrendi helyet csak akkor szabad véglegesíteni, amikor a fejlesztők vagy maga a játék egyértelműen meghatározza a történet viszonyát az alapjáték és a korábbi kiegészítők befejezéseihez.</p>
    <h2>Kapcsolat a The Witcher 3-mal</h2><p>A mű új fejezetet ad a több mint egy évtizeddel korábban megjelent alapjátékhoz. Nem önálló főrész, hanem a The Witcher 3 bővítménye. Az új történetet ezért a [[witcher-game-codex|játékkódexben|catalogue]] is külön kiegészítőazonosítóval kell kezelni, hogy a helyszínek, ellenfelek, küldetések és olvasmányok ne keveredjenek az alapjátékkal.</p>
    <h2>Platformok és kiadási helyzet</h2><p>A hivatalos közlemény PC-re, PlayStation 5-re, Xbox Series X|S-re és Nintendo Switch 2-re nevezi meg a kiegészítőt. A bejelentett adatok megjelenés előtt változhatnak; a wiki ezért a dátumot és platformlistát kiadási metaadatként, nem történeti tényként tartja nyilván.</p>
    <h2>Amit még nem tudunk</h2><p>A részletes cselekmény, a szereplőgárda, a szörnyek, a döntési ágak és a befejezések még nem rendelkeznek teljes nyilvános forráslefedettséggel. Ezek számára a lap előkészített kapcsolati helyet biztosít, de csak hivatalos megerősítés után bővíthetők.</p>
    <h2>Forrás</h2><p><a href="${songsSource}" target="_blank" rel="noopener noreferrer">CD PROJEKT RED Press Center: The Witcher 3 Remastered Announced, Songs of the Past Gets First Look</a>.</p>`,
  },

  'witcher-letten': {
    id: 'witcher-letten',
    universeId: 'witcher',
    universeLabel: 'Vaják',
    category: 'Helyszínek – Játékok',
    title: 'Letten',
    subtitle: 'A Songs of the Past új, hagyományőrző birodalma',
    lastEdited: 2026092003,
    infobox: {
      'Világ': 'A Kontinens játékfolytonossága',
      'Első megjelenés': 'Songs of the Past',
      'Jelleg': 'vidéki hagyományokat őrző föld',
      'Ismert veszély': 'régen szunnyadó sötétség',
      'Ellenőrzési státusz': 'előzetesen megerősített',
    },
    relatedArticles: ['witcher-songs-of-the-past', 'witcher-geralt', 'witcher-game-locations', 'witcher-games-branch'],
    content: `<h2>Áttekintés</h2><p>Letten a [[witcher-songs-of-the-past|Songs of the Past|expansion]] számára létrehozott új birodalom. A hivatalos bemutatás szerint természeti szépsége és vidéki hagyományai első pillantásra nyugalmat sugallnak, de a felszín alatt sötét titok rejtőzik.</p>
    <h2>Hagyomány és elszigeteltség</h2><p>A kiadó a helyi tradíciót Letten meghatározó tulajdonságaként emeli ki. Ez arra utal, hogy Geralt konfliktusa nem pusztán egy szörny levadászásáról szólhat, hanem a közösség múltjához és önképéhez is kapcsolódhat. Ennél részletesebb társadalmi vagy politikai állítás azonban a jelenlegi hivatalos anyagból még nem bizonyítható.</p>
    <h2>A szunnyadó fenyegetés</h2><p>A nyilvános leírás egy régóta szunnyadó gonoszt említ. A wiki ezt nem azonosítja konkrét lénnyel vagy frakcióval, amíg hivatalos név nem áll rendelkezésre. Az új ellenfeleket a megjelenés után a [[witcher-game-bestiary|játékkódex bestiáriumához|catalogue]] kell kapcsolni.</p>
    <h2>Folytonossági besorolás</h2><p>Letten a CD PROJEKT RED játékvilágának helyszíne. Nem szabad automatikusan Sapkowski könyveinek földrajzába visszavetíteni, és a térképi helyét sem lehet találgatással meghatározni. A későbbi hivatalos térképet vagy játékbeli útleírást külön bizonyítékként kell rögzíteni.</p>
    <h2>Forrás</h2><p><a href="${songsSource}" target="_blank" rel="noopener noreferrer">CD PROJEKT RED – Songs of the Past első hivatalos bemutatója</a>.</p>`,
  },

  'witcher3-remastered': {
    id: 'witcher3-remastered',
    universeId: 'witcher',
    universeLabel: 'Vaják',
    category: 'Játékok – Kiadások',
    title: 'The Witcher 3: Wild Hunt – Remastered',
    subtitle: 'A harmadik játék korszerűsített kiadása',
    lastEdited: 2026092004,
    infobox: {
      'Rekordtípus': 'Edition – korszerűsített kiadás',
      'Alapmű': 'The Witcher 3: Wild Hunt',
      'Megjelenés': '2026. szeptember 29.',
      'Tartalom': 'alapjáték, Hearts of Stone, Blood and Wine',
      'Mentések': 'kompatibilisek',
      'Folytonosság': 'változatlan játékfolytonosság',
    },
    relatedArticles: ['witcher-games-branch', 'witcher-geralt', 'witcher-wild-hunt', 'witcher-songs-of-the-past', 'witcher-game-codex'],
    content: `<h2>Nem új történet, hanem új kiadás</h2><p>A <em>The Witcher 3: Wild Hunt – Remastered</em> az eredeti játék korszerűsített változata. A tudásmodellben nem önálló történeti mű, hanem ugyanannak a Work rekordnak egy új Edition rekordja. Ez megakadályozza, hogy Geralt, Ciri és a Vad Hajsza története kétszer jelenjen meg a kronológiában.</p>
    <h2>Tartalmi csomag</h2><p>A kiadás az alapjátékot, valamint a <em>Hearts of Stone</em> és a <em>Blood and Wine</em> kiegészítőt együtt kezeli. A korábbi alapjáték-tulajdonosok számára a hivatalos tájékoztatás ingyenes frissítést ír le a megfelelő platformokon, a két korábbi bővítmény pedig az alapcsomag részévé válik.</p>
    <h2>Technikai korszerűsítés</h2><p>A Remastered vizuális, teljesítménybeli és játékélményt érintő fejlesztéseket ígér. Ezek verziózott technikai adatok: nem módosítják automatikusan a [[witcher-games-branch|játék történeti ágát|continuity]], ezért a wiki cselekményleírásait csak tényleges szöveges vagy tartalmi változás esetén kell új verzióval ellátni.</p>
    <h2>Mentések és modok</h2><p>A hivatalos ismertető szerint a meglévő mentések és a keresztplatformos előrehaladás kompatibilis marad. A fejlesztők nem számítanak arra, hogy maga a változat megtöri a modokat, de az egyes modok kompatibilitásáért azok készítői felelnek.</p>
    <h2>Platformok</h2><p>A kiadás PC-re, PlayStation 5-re, Xbox Series X|S-re és Nintendo Switch 2-re érkezik. A Battle.net-megjelenés külön terjesztési csatorna, nem külön történeti verzió.</p>
    <h2>Kapcsolat a Songs of the Pasttal</h2><p>A Remastered és a [[witcher-songs-of-the-past|Songs of the Past|expansion]] egyszerre került a figyelem középpontjába, de két külön termékjellegű rekord: az egyik az alapmű korszerűsített kiadása, a másik új történeti kiegészítő.</p>
    <h2>Forrás</h2><p><a href="${witcher3Source}" target="_blank" rel="noopener noreferrer">The Witcher 3 hivatalos oldala – Remastered információk és GYIK</a>; <a href="${songsSource}" target="_blank" rel="noopener noreferrer">CD PROJEKT RED Press Center</a>.</p>`,
  },

  'reigns-the-witcher': {
    id: 'reigns-the-witcher',
    universeId: 'witcher',
    universeLabel: 'Vaják',
    category: 'Játékok – Alternatív történetek',
    title: 'Reigns: The Witcher',
    subtitle: 'Geralt legendái Kökörcsin túlzó és elágazó balladáiban',
    lastEdited: 2026092005,
    infobox: {
      'Fejlesztő': 'Nerial',
      'Kiadó': 'Devolver Digital',
      'Licencadó': 'CD PROJEKT RED',
      'Megjelenés': '2026. február 25.',
      'Műfaj': 'kártyás döntési játék',
      'Folytonosság': 'alternatív, ismétlődő balladakeret',
    },
    relatedArticles: ['witcher-geralt', 'witcher-games-branch', 'witcher-game-quests', 'witcher-game-codex'],
    content: `<h2>Áttekintés</h2><p>A <em>Reigns: The Witcher</em> történetközpontú döntési játék, amelyben [[witcher-geralt|Geralt|character]] kalandjai Kökörcsin balladáin keresztül elevenednek meg. A játékos balra vagy jobbra húzott kártyákkal választ, a döntések pedig új találkozásokhoz, következményekhez és gyakran Geralt halálához vezetnek. A történet ezután más változatban újrakezdődhet.</p>
    <h2>Kökörcsin mint elbeszélő</h2><p>A balladakeret szándékosan bizonytalanná teszi, hogy egy esemény pontos történeti beszámoló, költői túlzás vagy teljesen új változat. Kökörcsin a hősiességet, botrányt és komikumot egyaránt felnagyíthatja. Ez nem hiba, hanem a játék szerkezetének része: a játékos újra és újra más legendát épít Geraltról.</p>
    <h2>Döntések és ismétlődés</h2><p>A játék nem egyetlen rögzített cselekményvonalat követ. A döntések erkölcsi, politikai és személyes következményeket nyitnak meg, miközben a sorozatos próbálkozások egymással ellentétes eredményeket is létrehozhatnak. Emiatt az egyedi játékmenetek eseményei nem emelhetők automatikusan a fő [[witcher-games-branch|CDPR-idővonalba|continuity]].</p>
    <h2>A világ újraértelmezése</h2><p>A fejlesztői háttéranyag példája szerint Geralt akár egy szomorú sziklatrollt is más életútra terelhet, amely később tűznyelőként vagy a Codringher és Fenn iroda kémjeként bukkanhat fel. Az ilyen elágazások a Kontinens ismert elemeit játékos, gyakran szatirikus lehetőségekkel kapcsolják össze.</p>
    <h2>Játékmeneti tudásmodell</h2><p>A wiki a mű biztos metaadatait, visszatérő szereplőit és narratív keretét rögzítheti. Az egyes döntési kártyákat, végkimeneteleket és halálokat külön „lehetséges ág” jelöléssel kell tárolni. Így a [[witcher-game-quests|döntési gráf|catalogue]] kereshető marad anélkül, hogy alternatív eredményei történelmi tényekké válnának.</p>
    <h2>Alkotók és megjelenés</h2><p>A játékot a Nerial készítette, a Devolver Digital adta ki, a CD PROJEKT RED közreműködésével. PC-n, Macen, Androidon és iOS-en jelent meg. A hivatalos fejlesztői ismertető szerint a készítők a Witcher erkölcsi útvesztőit a Reigns egyszerű döntési formájával akarták ötvözni.</p>
    <h2>Kánon- és forráskezelés</h2><p>A mű hivatalosan licencelt, de elágazó és önmagát újraíró szerkezete miatt alternatív játékfolytonosságként szerepel. A „hivatalos” itt a kiadás jogállását és eredetét jelenti, nem azt, hogy minden lehetséges döntés egyszerre a fő történeti kánon része.</p>
    <h2>Források</h2><p><a href="${reignsSource}" target="_blank" rel="noopener noreferrer">The Witcher hivatalos oldala: Reigns: The Witcher Available Now</a>; <a href="${reignsBackgroundSource}" target="_blank" rel="noopener noreferrer">CD PROJEKT RED: fejlesztői háttéranyag a játék narratívájáról</a>.</p>`,
  },
};
