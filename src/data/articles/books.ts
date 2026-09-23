/**
 * Diablo Lore Portal – könyvadatlapok és rövid könyves cikkek.
 * A hosszú olvasói fejezetek a public/reader-library/articles.json fájlban vannak,
 * és csak a Könyvtár vagy a Folyamatos történet megnyitásakor töltődnek be.
 * Generálás: npm run reader:split
 */

import type { WikiArticle } from '../../types';

export const booksArticles: Record<string, WikiArticle> = {
  "sanctuary-novels": {
    "id": "sanctuary-novels",
    "category": "Könyvek – Olvasó",
    "title": "Könyvespolc: A Diablo Regények és Kánon Kötetek",
    "subtitle": "A Sin War könyvektől a Book of Cain, Tyrael és Adria feljegyzéseiig!",
    "infobox": {
      "Fő Trilógia": "The Sin War (Birthright, Scales of the Serpent, The Veiled Prophet)",
      "Forráskönyvek": "Book of Cain, Book of Tyrael, Book of Adria",
      "Egyéb Regények": "Demonsbane, Legacy of Blood, The Black Road, Storm of Light..."
    },
    "content": "\n      <h2>A Sin War Trilógia (Richard A. Knaak)</h2>\n      <p>A három könyv (Birthright, Scales of the Serpent, The Veiled Prophet) Sanctuary őstörténetének és a Nephalemek felébredésének a legfontosabb kánon alapja. Megismerjük Uldyssian ul-Diomed epikus történetét, ahogy egy egyszerű farmerből isteni hatalmú nephalemmé válik, aki puszta létezésével fenyegeti a Mennyek és a Pokol uralmát. A könyv bemutatja Lilith manipulációit, Inarius bukását és a Triune (Hármasság) kultuszának felemelkedését.</p>\n\n      <h2>A Kánon \"Book of...\" Sorozata (Lore és Artbook Kötetek)</h2>\n      <ul>\n        <li><strong>Book of Cain (Cain Könyve):</strong> Deckard Cain életműve. Egy lenyűgöző, krónikaszerű mű, amely az egész univerzum történetét foglalja össze a teremtéstől (Anu és Tathamet) egészen a Diablo III eseményeiig. Kiemelten tárgyalja a Világkövet és a Dark Exile korszakát.</li>\n        <li><strong>Book of Tyrael (Tyrael Könyve):</strong> Tyrael, aki már halandó Bölcsességként éli életét, kiegészíti Cain munkáját. Ez a kötet az angyali hierarchiát, az Angiris Council belső politikai harcait, és az embereket érintő mennyei megítélést vizsgálja.</li>\n        <li><strong>Book of Adria (Adria Könyve - Bestiárium):</strong> Adria, a boszorkány (Diablo leghűségesebb szolgája) jegyzetei Sanctuary szörnyeiről, a vér-mágiáról, a démoni paktumokról és a Pokol lényeinek anatómiájáról.</li>\n        <li><strong>Book of Lorath (Lorath Könyve):</strong> A Diablo IV-hez kiadott legújabb lore-kötet. Lorath Nahr, az idős Horadrim mesél Sanctuary modern kori relikviáiról, a frakciók közötti feszültségekről és Lilith közelgő visszatéréséről.</li>\n      </ul>\n\n      <h2>A Klasszikus Regények és Képregények</h2>\n      <ul>\n        <li><strong>Demonsbane (Robert B. Marks):</strong> A legelső kiadott Diablo novella, amely Siggard, a démonvadász és a Khanduras-t sújtó sötét erők összecsapását mutatja be.</li>\n        <li><strong>Legacy of Blood (Richard A. Knaak) és The Black Road (Mel Odom):</strong> Zsoldosok, elátkozott páncélok és a démoni fertőzés. Ezek a regények a halandó emberek szemszögéből mutatják be, mennyire kétségbeejtő egy démoni entitással szembeszállni.</li>\n        <li><strong>The Kingdom of Shadow (Richard A. Knaak):</strong> Ureh legendás, eltűnt városának felfedezése, amely valójában egy démoni csapda. Kentril Dumon zsoldoskapitány és társai az újjászülető város titkával küzdenek meg.</li>\n        <li><strong>Moon of the Spider (Richard A. Knaak):</strong> A Nekromanta, Zayl (és beszélő koponyája, Humbart) utazásai és küzdelmei egy pókdémon-kultusszal, Astrogha újjászületésével kapcsolatban.</li>\n        <li><strong>The Order (Nate Kenyon):</strong> A Diablo III előzményregénye, amely Deckard Cain és Leah utazásait követi végig, miközben próbálják újjáépíteni a Horadrim Rendet, és szembenéznek Belial rejtett ügynökeivel.</li>\n        <li><strong>Storm of Light (Nate Kenyon):</strong> Közvetlen átvezető a Diablo III és a Reaper of Souls között. A Mennyeket sújtó politikai válságot és Tyrael Horadrimjainak megalakulását (köztük Jacob és Shanar) meséli el, miközben el akarják lopni a Black Soulstone-t az Angiris Council orra elől.</li>\n        <li><strong>Tales of Sanctuary (Képregény):</strong> Egy antológia, amely rövidebb történeteket mesél el Sanctuary különböző hőseiről (Barbárok, Nekromanták, Druidák), megmutatva a mindennapi életüket a démoni fenyegetés árnyékában.</li>\n      </ul>\n    "
  },
  "sanctuary-short-stories": {
    "id": "sanctuary-short-stories",
    "category": "Könyvek – Olvasó",
    "title": "Diablo Hivatalos Novellák és Előzmény Cikkek",
    "subtitle": "A Blizzard webes novellái: Tales of Sanctuary és On Nightmare's Wings",
    "infobox": {
      "Kiadó": "Blizzard Entertainment (Webes publikációk)",
      "Formátum": "Novellák, PDF-ek, Audio-felolvasások",
      "Kiemelt gyűjtemények": "Tales of Sanctuary, On Nightmare's Wings",
      "Korszak": "Közvetlenül a Diablo IV és a VoH kiegészítő előtt"
    },
    "content": "\n      <h2>Webes Novellák és a Lore Bővítése</h2>\n      <p>A nagy regények mellett a Blizzard egyre nagyobb hangsúlyt fektet a rövid, weben (a hivatalos Blizzard News oldalon) publikált novellákra és PDF formátumban letölthető elbeszélésekre. Ezek a történetek tökéletes kiegészítései a játékmenetnek, mivel mélyebb betekintést engednek a főbb karakterek belső világába, félelmeibe és múltjába a nagy konfliktusok előtt. Ezt a hagyományt a fejlesztők a Diablo III megjelenésével indították el.</p>\n\n      <h2>Klasszikus Novellák (A Diablo III Korszaka)</h2>\n      <p>A Diablo III alapjáték megjelenése előtt a Blizzard egy hivatalos novella-sorozatot publikált az oldalán, amelynek célja a választható kasztok (játszható karakterek) bemutatása volt. Ezek a novellák alapozták meg az egyes nephalem hősök személyes motivációit:</p>\n      <ul>\n        <li><strong>Wayfarer (A Vándor) – <em>Írta: Cameron Dayton:</em></strong> A Barbár kasztot bemutató történet, amely az Arreat-hegy pusztulásának utóhatásaival küzdő harcos zarándoklatáról szól.</li>\n        <li><strong>Hatred and Discipline (Gyűlölet és Fegyelem) – <em>Írta: Micky Neilson:</em></strong> A Démonvadász (Demon Hunter) komor eredettörténete, amely bemutatja, hogyan képzik ki ezeket a bosszúálló harcosokat a sötét mesterségre.</li>\n        <li><strong>Unyielding (A Megingathatatlan) – <em>Írta: Matt Burns:</em></strong> A Szerzetes (Monk) kaszt bemutatása, mélyen beleásva Ivgorod vallási rendjébe és harcművészeti filozófiájába.</li>\n        <li><strong>Doubtwalker (A Kételyjáró) – <em>Írta: Matt Burns:</em></strong> A Boszorkánydoktor (Witch Doctor) rituáléiról és a Formátlan Világgal (Unformed Land) való spirituális kapcsolatáról szóló írás.</li>\n        <li><strong>Firefly (Szentjánosbogár) – <em>Írta: Michael Chu:</em></strong> A Varázsló (Wizard) története, amely egy lázadó, arrogáns zseni arcana mágiával való kísérletezéseit mutatja be Xiansai szigetén.</li>\n      </ul>\n      <p>Később ezeket és még néhány történetet (pl. <em>The End of Her Journey</em>) egy <strong>Heroes Rise, Darkness Falls</strong> című e-könyv antológiában is kiadták.</p>\n\n      <h2>Tales of Sanctuary (Menedék Meséi)</h2>\n      <p>A Diablo IV megjelenése környékén indított, gyakran <em>Tejal</em> (az in-game boltos) által narrált novella-sorozat. Ezek a történetek Sanctuary sötét, reménytelen, de emberi oldalát mutatják be az egyszerű túlélők vagy kisebb hősök szemszögéből:</p>\n      <ul>\n        <li><strong>Witness (A Tanú) – <em>Írta: Alma Katsu:</em></strong> Tejal meséje egy fiatal lányról és családjáról, akik próbálják túlélni a pusztítást, miután Lilith seregei végigsöpörnek a vidéken. Bemutatja az átlagemberek mindennapi terrorját Sanctuary világában.</li>\n        <li><strong>The Toll of Darkness and Light (A Sötétség és Fény Vámja) – <em>Írta: Jonathan Maberry:</em></strong> Egy sötét hangulatú történet, amely a Fény Katedrálisának (Cathedral of Light) vallási fanatizmusát és a démoni fertőzés közötti vékony határvonalat feszegeti, megmutatva Inarius híveinek kegyetlenségét.</li>\n        <li><strong>Sanctum of Bone (A Csontok Szentélye):</strong> A Kehjistan és Scosglen vidékén barangoló remeték és túlélők sorsáról szóló kiegészítő történetek.</li>\n      </ul>\n\n      <h2>On Nightmare's Wings (A Rémálom Szárnyain)</h2>\n      <p>Közvetlenül a <em>Vessel of Hatred</em> kiegészítő rajtja előtt kiadott legújabb novella-gyűjtemény (Jonathan Maberry tollából). Ezek a történetek azt vizsgálják, hogyan mételyezi meg Mephisto (A Gyűlölet Ura) a legfontosabb karakterek elméjét a belső félelmeiken keresztül.</p>\n      <ul>\n        <li><strong>Neyrelle Története:</strong> Részletesen bemutatja Neyrelle fizikai és mentális tortúráját a Kurast felé vezető úton. A kék Lélekkő folyamatosan suttog neki, az anyja (Vhenard) halálával kapcsolatos bűntudatát felerősítve, megpróbálva rávenni őt, hogy engedjen a Gyűlöletnek.</li>\n        <li><strong>Lorath Nahr Küzdelme:</strong> A megöregedett, megkeseredett Horadrim, Lorath legmélyebb félelmeit térképezi fel. Lorath az alkohollal és a kudarc érzésével küzd (Elias árulása és Deckard Cain halála miatt), miközben Mephisto árnyéka a távolból is kísérti őt.</li>\n        <li><strong>Adreona, az Amazon Királynő:</strong> Egy történet, amely a Diablo II-ből ismert Amazon kaszt (Skovos Isles harcosai) jelenlegi vezetőjének szemszögéből mutatja meg a közelgő apokalipszis fenyegetését.</li>\n      </ul>\n\n      <h2>A Novellák Kánon Szerepe</h2>\n      <p>Ezek a cikkek <strong>hivatalos, 100%-os kánon</strong> minősítésűek. A fejlesztők (köztük a lore masters) azzal a céllal írják őket, hogy a játékban esetlegesen időhiány miatt ki nem fejtett érzelmi motivációkat (például, hogy miért vágja le Neyrelle a saját karját, vagy miért van Lorath teljesen összetörve) megmagyarázzák a játékosoknak.</p>\n    "
  },
  "sin-war-birthright": {
    "id": "sin-war-birthright",
    "category": "Könyvek – Olvasó",
    "title": "Diablo: The Sin War Trilogy - Book One: Birthright (Születésjog)",
    "subtitle": "Richard A. Knaak regényének teljes kánon összefoglalója és elemzése",
    "infobox": {
      "Szerző": "Richard A. Knaak",
      "Kiadás Éve": "2006",
      "Korszak": "A Bűn Háborúja (Sin War)",
      "Főszereplő": "Uldyssian ul-Diomed",
      "Frakciók": "Cathedral of Light, Temple of the Triune",
      "Téma": "Nephalem ébredés, a mágia és a halandók sorsa"
    },
    "content": "\n      <h2>Bevezetés és Jelentőség</h2>\n      <p>A <strong>The Sin War: Birthright</strong> (A Bűn Háborúja: Születésjog) Richard A. Knaak trilógiájának első kötete. Ez a regény a Diablo univerzum egyik legfontosabb irodalmi műve, mivel elmeséli Sanctuary (A Menedék) korai történelmét, az angyalok és démonok titkos hidegháborúját az emberiség lelkéért, és a legendás nephalem, Uldyssian ébredését. Mivel egy teljes regény több száz oldalát lehetetlen szószerint beépíteni egy enciklopédiába, ez az archívum a könyv teljes, hivatalos kánon összefoglalóját és lore elemzését tartalmazza.</p>\n\n      <h2>A Világ Helyzete (A Két Egyház)</h2>\n      <p>Évezredekkel a Diablo I eseményei előtt járunk. Sanctuary titokban létezik, de az emberiség (a nephalemek gyengített leszármazottai) nem ismeri az angyalok és démonok létezését. Két látszólag békés, ám valójában manipulatív vallás küzd a halandók lelkéért:</p>\n      <ul>\n        <li><strong>A Fény Katedrálisa (Cathedral of Light):</strong> A Rendet, az engedelmességet és a \"Fényt\" hirdeti. Vezetője a rejtélyes <em>Próféta</em>, aki valójában <strong>Inarius</strong> arkangyal, Sanctuary egyik teremtője. Inarius arrogáns, és saját magát tartja az emberiség isteni uralkodójának.</li>\n        <li><strong>A Háromság Temploma (Temple of the Triune):</strong> A szeretet, a teremtés és a béke szellemeit (Dialon, Bala, Mefis) imádják, de valójában a három <em>Prime Evil</em> (Diablo, Baal, Mephisto) titkos szektája. A szektát a Főpap, azaz <strong>Lucion</strong> (Mephisto fia, Lilith testvére) vezeti.</li>\n      </ul>\n\n      <h2>A Főszereplők</h2>\n      <p>A történet egy maroknyi egyszerű ember, főként Uldyssian és barátai köré épül, akik akaratlanul is a kozmikus háború középpontjába kerülnek:</p>\n      <ul>\n        <li><strong>Uldyssian ul-Diomed:</strong> Egy tragikus sorsú farmer Seram falujából. Családját (szüleit és testvéreit, kivéve Mendelnt) egy járvány vitte el. Uldyssian emiatt meggyűlölte mindkét egyházat, mivel imáik nem segítettek. Ő a történet vonakodó hőse, akiben először ébred fel az isteni nephalem erő.</li>\n        <li><strong>Mendeln:</strong> Uldyssian fiatalabb öccse. Míg bátyja az erejére támaszkodik, Mendeln csendes, filozofikus, és vonzódik a halál, a szellemek és a misztikum tanulmányozásához. Később ő válik a legelső <em>Necromancer-ré</em> (Rathma papjává).</li>\n        <li><strong>Serenthia:</strong> Seram falu kereskedőjének lánya, bátor és makacs harcosnő, aki titokban szerelmes Uldyssianba.</li>\n        <li><strong>Achilios:</strong> A falu legjobb íjásza és vadásza, Uldyssian barátja, aki Serenthiát szereti.</li>\n        <li><strong>Lylia (Lilith):</strong> Egy titokzatos, gyönyörű nemesasszony, aki Uldyssian mellé szegődik. Valójában ő <strong>Lilith</strong> démonnő, Mephisto lánya és Sanctuary társ-teremtője (Inarius egykori szerelme). Lilith az emberi (nephalem) potenciált akarja felébreszteni, hogy a saját fegyvereként használja fel mind a Menny, mind a Pokol ellen.</li>\n      </ul>\n\n      <h2>A Cselekmény Részletes Összefoglalója</h2>\n\n      <h3>1. A Serami Gyilkosságok és a Menekülés</h3>\n      <p>A regény Seram békés falujában kezdődik. Két misszionáriust – egyet a Katedrálistól, egyet a Triune-tól – brutálisan meggyilkolnak, és a bizonyítékok egyértelműen Uldyssianra utalnak. Ekkor jelenik meg Lylia, aki megmenti Uldyssiant a feldühödött tömegtől. Uldyssian, Mendeln, Serenthia és Achilios kénytelenek elmenekülni a faluból, maguk mögött hagyva addigi életüket.</p>\n\n      <h3>2. A Nephalem Erők Felébredése</h3>\n      <p>A menekülés során Lylia titokban manipulálja Uldyssiant. A férfi felfedezi, hogy képes puszta akarattal manipulálni a valóságot: vihart tud idézni, emberfeletti ereje van, és képes mások elméjét is befolyásolni. Nem tudja, hogy erejének forrása a nephalem vérvonal, amelyet Lilith szándékosan ébresztett fel benne. Uldyssian eleinte fél a hatalmától, de rájön, hogy képes másokban is felébreszteni ezt a lappangó potenciált (őket hívják később <em>Edyrem</em>-nek, az Ébredőknek).</p>\n\n      <h3>3. Lucion és az Inkvizítorok</h3>\n      <p>Ahogy Uldyssian ereje növekszik, mind Inarius, mind a Triune (Lucion) felfigyel rá. Lucion démoni bérgyilkosokat (Malic) és agymosott papokat küld a csapat után, míg Inarius Katedrálisa Inkvizítorokat uszít rájuk. Uldyssian szembeszáll a mágia és a démonok jelentette fenyegetéssel, és lassan elfogadja vezetői szerepét. Közben Lylia folyamatosan tüzeli a dühét, hogy Inarius és a Triune ellen forduljon.</p>\n\n      <h3>4. Az Igazság Kiderül</h3>\n      <p>A regény csúcspontján Uldyssian csapata rájön Lylia valódi kilétére. Mendeln egyre mélyebb látomásokat tapasztal, amelyeket egy titokzatos hang irányít. Kiderül, hogy Lylia valójában Lilith, a Démonok Anyja, aki azért ébresztette fel Uldyssiant, hogy egy legyőzhetetlen sereget (az Edyrems) hozzon létre, amellyel átveheti az uralmat a Kozmosz felett. Amikor Uldyssian visszautasítja, hogy a démonnő bábja legyen, Lilith ellene fordul.</p>\n\n      <h3>5. Rathma és Trag'Oul Színrelépése</h3>\n      <p>A konfliktus során feltűnik <strong>Linarian</strong> (aki később felveszi a <strong>Rathma</strong> nevet), Inarius és Lilith ősi nephalem fia. Rathma a kozmikus egyensúlyt (Balance) szolgálja, mestere pedig nem más, mint <strong>Trag'Oul</strong>, a Sanctuaryt védelmező hatalmas kozmikus sárkány (aki csillagképként öleli körül a bolygót). Trag'Oul és Rathma kapcsolatba lépnek Mendelnnel, és elkezdik bevezetni őt az Egyensúly és a halál mágiájának titkaiba. Céljuk, hogy segítsenek Uldyssiannak megállítani Lilith-et és Inariust, anélkül, hogy a Menny vagy a Pokol beavatkozna.</p>\n\n      <h2>A Könyv Végkifejlete</h2>\n      <p>A <em>Birthright</em> végén Uldyssiannak sikerül visszaszorítania Lilithet (egy időre), és elhatározza, hogy az Edyrems élén hadjáratot indít a két korrupt egyház ellen. Megérti, hogy az emberiség sorsát a saját kezébe kell vennie, nem engedve sem az angyalok, sem a démonok zsarnokságának. Ezzel kezdetét veszi a tényleges <strong>Bűn Háborúja (The Sin War)</strong>, amely majd a második (Scales of the Serpent) és harmadik (The Veiled Prophet) könyvben csúcsosodik ki.</p>\n\n      <h2>Tartalomjegyzék: The Sin War: Birthright (Magyar Fordítás)</h2>\n      <p>Kattints az alábbi gombokra az adott fejezet megnyitásához:</p>\n      <div style=\"display: flex; gap: 10px; margin-top: 20px; margin-bottom: 20px; flex-wrap: wrap;\">\n        <p>[[sin-war-birthright-ch1|Prológus és 1. Fejezet|references]]</p>\n        <p>[[sin-war-birthright-ch2|2. Fejezet|references]]</p>\n        <p>[[sin-war-birthright-ch3|3. Fejezet|references]]</p>\n        <p>[[sin-war-birthright-ch4|4. Fejezet|references]]</p>\n        <p>[[sin-war-birthright-ch5|5. Fejezet|references]]</p>\n        <p>[[sin-war-birthright-ch6|6. Fejezet|references]]</p>\n        <p>[[sin-war-birthright-ch7|7. Fejezet|references]]</p>\n        <p>[[sin-war-birthright-ch8|8. Fejezet|references]]</p>\n        <p>[[sin-war-birthright-ch9|9. Fejezet|references]]</p>\n        <p>[[sin-war-birthright-ch10|10. Fejezet|references]]</p>\n        <p>[[sin-war-birthright-ch11|11. Fejezet|references]]</p>\n        <p>[[sin-war-birthright-ch12|12. Fejezet|references]]</p>\n        <p>[[sin-war-birthright-ch13|13. Fejezet|references]]</p>\n        <p>[[sin-war-birthright-ch14|14. Fejezet|references]]</p>\n        <p>[[sin-war-birthright-ch15|15. Fejezet|references]]</p>\n        <p>[[sin-war-birthright-ch16|16. Fejezet|references]]</p>\n        <p>[[sin-war-birthright-ch17|17. Fejezet|references]]</p>\n        <p>[[sin-war-birthright-ch18|18. Fejezet|references]]</p>\n        <p>[[sin-war-birthright-ch19|19. Fejezet|references]]</p>\n        <p>[[sin-war-birthright-ch20|20. Fejezet|references]]</p>\n        <p>[[sin-war-birthright-ch21|21. Fejezet|references]]</p>\n        <p>[[sin-war-birthright-ch22|22. Fejezet|references]]</p>\n        <p>[[sin-war-birthright-ch23|23. Fejezet|references]]</p>\n      </div>\n\n      <h2>Kapcsolódó szócikkek</h2>\n      <ul>\n        <li>[[sin-war-prophet-ch18|The Sin War: The Veiled Prophet|references]] - Olvass a Bűn Háborújának eseményeiről, amelyek Ureh felemelkedése előtt történtek.</li>\n        <li>[[zayl|Zayl, a Nekromanta|references]] - Ismerd meg a regény egyik legfontosabb főszereplőjét!</li>\n      </ul>\n    "
  },
  "sin-war-prophet": {
    "id": "sin-war-prophet",
    "category": "Könyvek – Olvasó",
    "title": "Diablo: The Sin War Trilogy - Book Three: The Veiled Prophet",
    "subtitle": "Richard A. Knaak (Magyar Fordítás)",
    "infobox": {
      "Szerző": "Richard A. Knaak",
      "Megjelenés": "2007 (Eredeti)",
      "Műfaj": "Sötét Fantasy",
      "Téma": "A Bűn Háborúja (The Sin War)"
    },
    "content": "\n      <h2>The Veiled Prophet (A Fátyolos Próféta) - 3. Könyv</h2>\n      <p>A Bűn Háborúja trilógia lenyűgöző befejező kötetében Uldyssian és edyrem serege végre szembesül a teljes igazsággal. A Háromság (Triune) Templomának pusztulása után a Fény Katedrálisa (Cathedral of Light) maradt az egyetlen látszólagos menedék Menedék (Sanctuary) világában. Inarius, a Fátyolos Próféta azonban sokkal sötétebb és ősibb titkokat őriz, mint amit a halandók valaha is elképzeltek volna.</p>\n\n      <p>Miközben a Magas Mennyek (High Heavens) és a Lángoló Poklok (Burning Hells) végre tudomást szereznek Menedék létezéséről, az angyalok és démonok készen állnak, hogy eltöröljék az emberiséget a létezésből. Uldyssian, aki egyre kevésbé tudja irányítani ébredező isteni erejét, kénytelen lesz meghozni a végső áldozatot, hogy megmentse mindazokat, akiket szeret, és megőrizze világának függetlenségét az Örök Konfliktusban.</p>\n\n      <h3>Olvasás megkezdése:</h3>\n      <div style=\"display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;\">\n        <p>[[sin-war-prophet-ch0|Prológus|references]]</p>\n        <p>[[sin-war-prophet-ch1|1. Fejezet|references]]</p>\n        <p>[[sin-war-prophet-ch2|2. Fejezet|references]]</p>\n        <p>[[sin-war-prophet-ch3|3. Fejezet|references]]</p>\n        <p>[[sin-war-prophet-ch4|4. Fejezet|references]]</p>\n        <p>[[sin-war-prophet-ch5|5. Fejezet|references]]</p>\n        <p>[[sin-war-prophet-ch6|6. Fejezet|references]]</p>\n        <p>[[sin-war-prophet-ch7|7. Fejezet|references]]</p>\n        <p>[[sin-war-prophet-ch8|8. Fejezet|references]]</p>\n        <p>[[sin-war-prophet-ch9|9. Fejezet|references]]</p>\n        <p>[[sin-war-prophet-ch10|10. Fejezet|references]]</p>\n        <p>[[sin-war-prophet-ch11|11. Fejezet|references]]</p>\n        <p>[[sin-war-prophet-ch12|12. Fejezet|references]]</p>\n        <p>[[sin-war-prophet-ch13|13. Fejezet|references]]</p>\n        <p>[[sin-war-prophet-ch14|14. Fejezet|references]]</p>\n        <p>[[sin-war-prophet-ch15|15. Fejezet|references]]</p>\n        <p>[[sin-war-prophet-ch16|16. Fejezet|references]]</p>\n        <p>[[sin-war-prophet-ch17|17. Fejezet|references]]</p>\n        <p>[[sin-war-prophet-ch18|18. Fejezet|references]]</p>\n        <p>[[sin-war-prophet-ch19|19. Fejezet|references]]</p>\n        <p>[[sin-war-prophet-ch20|20. Fejezet|references]]</p>\n        <p>[[sin-war-prophet-ch21|21. Fejezet|references]]</p>\n      </div>\n\n      <h2>Kapcsolódó szócikkek</h2>\n      <ul>\n        <li>[[sin-war-prophet-ch18|The Sin War: The Veiled Prophet|references]] - Olvass a Bűn Háborújának eseményeiről, amelyek Ureh felemelkedése előtt történtek.</li>\n        <li>[[zayl|Zayl, a Nekromanta|references]] - Ismerd meg a regény egyik legfontosabb főszereplőjét!</li>\n      </ul>\n    "
  },
  "sin-war-scales": {
    "id": "sin-war-scales",
    "category": "Könyvek – Olvasó",
    "title": "Diablo: The Sin War Trilogy - Book Two: Scales of the Serpent (A Kígyó Pikkelyei)",
    "subtitle": "Richard A. Knaak regényének teljes kánon összefoglalója és elemzése",
    "infobox": {
      "Mű": "The Sin War: Scales of the Serpent",
      "Szerző": "Richard A. Knaak",
      "Megjelenés": "2007. Március 27.",
      "Típus": "Regény (Trilógia 2. kötet)"
    },
    "content": "\n      <h2>A Kígyó Pikkelyei - Második Kötet</h2>\n      <p>A Bűn Háborúja trilógia második kötetében Uldyssian és követői tovább küzdenek Inarius (Fény Katedrálisa) és a Háromság (Triune) ellen. Miközben Uldyssian ereje tovább növekszik, az Edyrem seregével együtt kell szembenéznie a démoni és angyali manipulációkkal.</p>\n\n      <h3>Fejezetek</h3>\n      <div style=\"display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px;\">\n        <p>[[sin-war-scales-ch0|Prológus|references]]</p>\n                <p>[[sin-war-scales-ch1|1. Fejezet|references]]</p>\n        <p>[[sin-war-scales-ch2|2. Fejezet|references]]</p>\n        <p>[[sin-war-scales-ch3|3. Fejezet|references]]</p>\n        <p>[[sin-war-scales-ch4|4. Fejezet|references]]</p>\n        <p>[[sin-war-scales-ch5|5. Fejezet|references]]</p>\n        <p>[[sin-war-scales-ch6|6. Fejezet|references]]</p>\n        <p>[[sin-war-scales-ch7|7. Fejezet|references]]</p>\n        <p>[[sin-war-scales-ch8|8. Fejezet|references]]</p>\n        <p>[[sin-war-scales-ch9|9. Fejezet|references]]</p>\n        <p>[[sin-war-scales-ch10|10. Fejezet|references]]</p>\n        <p>[[sin-war-scales-ch11|11. Fejezet|references]]</p>\n        <p>[[sin-war-scales-ch12|12. Fejezet|references]]</p>\n        <p>[[sin-war-scales-ch13|13. Fejezet|references]]</p>\n        <p>[[sin-war-scales-ch14|14. Fejezet|references]]</p>\n        <p>[[sin-war-scales-ch15|15. Fejezet|references]]</p>\n        <p>[[sin-war-scales-ch16|16. Fejezet|references]]</p>\n        <p>[[sin-war-scales-ch17|17. Fejezet|references]]</p>\n        <p>[[sin-war-scales-ch18|18. Fejezet|references]]</p>\n        <p>[[sin-war-scales-ch19|19. Fejezet|references]]</p>\n        <p>[[sin-war-scales-ch20|20. Fejezet|references]]</p>\n        <p>[[sin-war-scales-ch21|21. Fejezet|references]]</p>\n        <p>[[sin-war-scales-ch22|22. Fejezet|references]]</p>\n        <p>[[sin-war-scales-ch23|23. Fejezet|references]]</p>\n      </div>\n\n      <h2>Kapcsolódó szócikkek</h2>\n      <ul>\n        <li>[[sin-war-prophet-ch18|The Sin War: The Veiled Prophet|references]] - Olvass a Bűn Háborújának eseményeiről, amelyek Ureh felemelkedése előtt történtek.</li>\n        <li>[[zayl|Zayl, a Nekromanta|references]] - Ismerd meg a regény egyik legfontosabb főszereplőjét!</li>\n      </ul>\n    "
  },
  "lore-uldyssian": {
    "id": "lore-uldyssian",
    "category": "Karakterek – Olvasó",
    "title": "Uldyssian ul-Diomed",
    "subtitle": "Az emberiség megmentője és az Edyrem vezetője",
    "infobox": {
      "Származás": "Seram faluja, Partha közelében",
      "Faj": "Nephalem (Ébredt Ember)",
      "Család": "Mendeln ul-Diomed (Testvér)",
      "Végzet": "Feláldozta magát Sanctuary védelmében"
    },
    "content": "\n      <h2>Uldyssian ul-Diomed: A Földművesből lett Félisten</h2>\n      <p>Uldyssian ul-Diomed a <em>Sin War (Bűn Háborúja)</em> trilógia központi hőse, egy egyszerű serami földműves, akinek tettei örökre megváltoztatták Menedék (Sanctuary) világát, és megmentették az emberiséget az angyalok és démonok haragjától.</p>\n\n      <h3>🌾 A Kezdetek és a Tragédia</h3>\n      <p>Uldyssian békés életet élt testvérével, Mendelnnel, miután családjuk nagy részét elvitte egy pusztító járvány. A tragédia miatt Uldyssian megvetett minden vallást, így gyanakvóan tekintett mind a <strong>Háromság (Triune)</strong>, mind a <strong>Fény Katedrálisa (Cathedral of Light)</strong> misszionáriusaira. Élete akkor vett drasztikus fordulatot, amikor a falujába érkező inkvizítorokat és papokat egy titokzatos, megállíthatatlan erő végzett ki – méghozzá úgy, mintha ő maga tette volna.</p>\n\n      <p>Menekülni kényszerült, vele tartott barátja, Achilios, Serenthia, és egy gyönyörű, titokzatos nő, Lylia – aki valójában <strong>Lilith</strong> démonnő, Mephisto lánya volt, emberi álruhában.</p>\n\n      <h3>⚡ Az Erő Ébredése (Edyrem)</h3>\n      <p>Lilith titokban manipulálta a Világkövet (Worldstone), és felébresztette Uldyssianban a szunnyadó <em>Nephalem</em> képességeket. Célja az volt, hogy Uldyssiant a saját, mindenható seregének vezérévé tegye. Uldyssian képessé vált az anyag manipulálására, pajzsok varázslására, és puszta akarattal hatalmas pusztítást tudott véghezvinni.</p>\n\n      <p>Miután rájött Lilith árulására, Uldyssian ellene fordult. Ahelyett, hogy démoni vagy angyali befolyás alá került volna, elkezdte tanítani a többi embert a saját képességeik felébresztésére. Követői magukat <strong>Edyrem</strong>-nek (\"Akik láttak\") nevezték el. Ezzel a sereggel Uldyssian lerombolta a Háromság (Triune) összes templomát, véget vetve a démonok vallási uralmának.</p>\n\n      <h3>✝️ A Végső Áldozat</h3>\n      <p>Amikor az Edyrem szembeszállt a Fény Katedrálisával és magával Inariusszal, a küzdelem elszabadította Uldyssian valódi isteni potenciálját. Ekkor azonban feltárult Sanctuary létezése mind a Lángoló Poklok, mind a Magas Mennyek (Angiris Council) előtt, akik megjelentek, hogy elpusztítsák a bolygót.</p>\n\n      <p>Uldyssian rájött, hogy a benne lévő korlátlan hatalom – ami már a Világkő energiáival vetekedett – szétszakítja magát a valóságot. Hogy megmentse a világot a pusztulástól, <strong>magába szívta az összes Nephalem erejét a csatatéren, majd energiáját a földbe és a Világkőbe irányította</strong>, újra lezárva a halandók hatalmát és elrejtve a bolygót. Ebben a kozmikus robbanásban ő maga megsemmisült, de áldozata meggyőzte Tyrael arkangyalt (aki eddig az emberiség elpusztítására szavazott), hogy az emberek képesek a legnagyobb jóra is, megmentve ezzel a Sanctuary-t.</p>\n    "
  },
  "lore-mendeln": {
    "id": "lore-mendeln",
    "category": "Karakterek – Olvasó",
    "title": "Mendeln ul-Diomed (Kalan)",
    "subtitle": "Az első Nekromanta és a Rathma Papjainak alapítója",
    "infobox": {
      "Származás": "Seram faluja",
      "Mesterei": "Rathma és Trag'Oul",
      "Titulus": "Kalan (A Tanító)"
    },
    "content": "\n      <h2>Mendeln ul-Diomed: A Halál Követe</h2>\n      <p>Mendeln Uldyssian öccse volt, aki sokkal csendesebb, befelé fordulóbb személyiséggel rendelkezett. Míg bátyja a világot formáló fizikai erők mesterévé vált, Mendeln a szellemek, a halál és a kozmikus Egyensúly (The Balance) hívásának engedelmeskedett.</p>\n\n      <h3>🐉 Rathma és Trag'Oul Tanítványa</h3>\n      <p>A Bűn Háborúja alatt Mendelnt kiválasztotta <strong>Rathma</strong> (az első Nephalem) és mestere, <strong>Trag'Oul</strong>, a mennyek és poklok felett álló, Sanctuary-t őrző kozmikus sárkány. Mendeln megtanulta látni és értelmezni a halál utáni birodalmat. Képessé vált kommunikálni a szellemekkel, és megértette a világot összetartó ciklus törvényszerűségeit.</p>\n\n      <p>Ő hozta vissza barátjukat, Achiliost a halálból (bár Rathma is közrejátszott benne), ami az első komoly beavatkozása volt a nekromancia területén.</p>\n\n      <h3>📜 Kalan Prófétája</h3>\n      <p>Miután bátyja, Uldyssian feláldozta magát, és a Világkő ereje eltörölte az Edyremek memóriáját a háborúról, <strong>csak Mendeln emlékezett mindenre</strong>. Trag'Oul és az Angiris Council egyezsége értelmében ő megtarthatta az emlékeit és erejét, hogy titokban őrizze a világ Egyensúlyát.</p>\n\n      <p>Mendeln felvette a <strong>Kalan</strong> (A Tanító) nevet. Ő alapította meg a <em>Priests of Rathma</em> (Rathma Papjai) rendet, akiket a világ később <strong>Nekromantákként</strong> ismert meg. Ő írta a <em>Kalan Könyveit (Books of Kalan)</em>, amelyek a nekromanták legszentebb szövegeivé váltak, és ő tanította meg rendjének, hogy soha ne álljanak se a Fény, se a Sötétség oldalára, mert a végletes győzelem bármelyik részről Sanctuary pusztulását jelentené.</p>\n    "
  },
  "lore-tragoul": {
    "id": "lore-tragoul",
    "category": "Karakterek – Olvasó",
    "title": "Trag'Oul (A Sárkány)",
    "subtitle": "Sanctuary Kozmikus Védelmezője",
    "infobox": {
      "Faj": "Kozmikus Entitás (Sárkány)",
      "Székhely": "A Csillagközi Üresség (The Void)",
      "Tanítványok": "Rathma, Mendeln (Kalan)"
    },
    "content": "\n      <h2>Trag'Oul, Sanctuary Őrzője</h2>\n      <p>Trag'Oul (vagy Trag'Oul, a Nagy Sárkány) egy titokzatos, csillagszerű kozmikus entitás a Diablo univerzumban. Sem nem angyal, sem nem démon, hanem maga Sanctuary (Menedék) világának fizikai és szellemi megtestesülése.</p>\n\n      <h3>🌌 Az Egyensúly Őre</h3>\n      <p>Amikor Inarius és Lilith megteremtették Sanctuary-t a Világkő (Worldstone) segítségével, maga a világ is öntudatra ébredt, és ez a tudat Trag'Oul formáját öltötte. Teste úgy néz ki, mint egy csillagokból és égi fényekből álló gigantikus sárkány. Ő létezik Menedék minden fájában, kövében és lelkében.</p>\n\n      <p>Trag'Oul célja az <strong>Egyensúly (The Balance)</strong> fenntartása. Úgy véli, hogy ha a Fény (Mennyek) vagy a Sötétség (Pokol) totális győzelmet arat, a világ elpusztul. Ő volt az, aki elbújtatta és kiképezte Inarius fiát, Rathmát, majd később Mendelnt, hogy a Nekromanták Rendjén keresztül a színfalak mögül irányítsák és védjék a világot a Bűn Háborúja után.</p>\n\n      <h3>A nekromanták mestere</h3>\n      <p>A Nekromanták pikkelyes, sárkányos öltözete, csontmágiája és teljes filozófiája egyenesen Trag'Oultól származik. Bár soha nem avatkozik be közvetlenül fizikai formában a csatákba, az ő útmutatása mentette meg az emberiséget az angyalok ítéletétől és a démonok rabszolgaságától.</p>\n    "
  },
  "kingdom-of-shadow": {
    "id": "kingdom-of-shadow",
    "category": "Könyvek – Olvasó",
    "title": "Diablo: The Kingdom of Shadow (Az Árnyak Királysága)",
    "subtitle": "Richard A. Knaak regényének magyar nyelvű ismertetője",
    "infobox": {
      "Szerző": "Richard A. Knaak",
      "Kiadás Éve": "2002",
      "Korszak": "A Bűn Háborúja Után",
      "Főszereplő": "Kentril Dumon, Zayl",
      "Helyszín": "Ureh, Kehjistan",
      "Téma": "Elveszett város, nekromancia"
    },
    "content": "\n      <h2>Bevezetés és Jelentőség</h2>\n      <p>A <strong>The Kingdom of Shadow</strong> (Az Árnyak Királysága) Richard A. Knaak klasszikus Diablo-regénye. A történet bemutatja Ureh, a legendás elveszett város sötét titkait, és bevezeti Zaylt, a nekromantát, valamint hűséges, beszédes koponyáját, Humbartot.</p>\n\n      <h2>Olvasási információ</h2>\n      <p>A korábbi fejezetimport hiányos és több helyen hibásan darabolt volt, ezért nem jelenik meg olvasható könyvként. A mű adatai és az ellenőrzött kapcsolódó szócikkek továbbra is elérhetők.</p>\n\n      <h2>Kapcsolódó szócikkek</h2>\n      <ul>\n        <li>[[sin-war-prophet-ch18|The Sin War: The Veiled Prophet|references]] - Olvass a Bűn Háborújának eseményeiről, amelyek Ureh felemelkedése előtt történtek.</li>\n        <li>[[zayl|Zayl, a Nekromanta|references]] - Ismerd meg a regény egyik legfontosabb főszereplőjét!</li>\n      </ul>\n    "
  },
  "zayl": {
    "id": "zayl",
    "category": "Karakterek – Olvasó",
    "title": "Zayl, a Nekromanta",
    "subtitle": "Rathma Papja és az Egyensúly Őrzője",
    "infobox": {
      "Foglalkozás": "Nekromanta (Priest of Rathma)",
      "Társ": "Humbart Wessel (Beszélő koponya)",
      "Fegyver": "Csonttőr",
      "Fő Szereplések": "The Kingdom of Shadow, Moon of the Spider, The Order"
    },
    "content": "\n      <h2>Bevezetés</h2>\n      <p><strong>Zayl</strong> a Diablo univerzum egyik legikonikusabb és legismertebb karaktere a regényekből. Mint Rathma Papja, Zayl egy igazi nekromanta, aki a halál mágiáját és a csontok erejét használja, de nem a pusztítás, hanem a világ Egyensúlyának fenntartása érdekében. Fekete köpenye és sápadt, rejtélyes megjelenése mögött egy mélyen filozofikus és rendkívül erős mágiahasználó rejtőzik.</p>\n\n      <h2>Rathma Papjai és az Egyensúly</h2>\n      <p>A nekromanták, akiket Rathma Papjaiként is ismernek, Kehjistan mélyén, a távoli dzsungelekben képzik magukat. Céljuk nem a Fény vagy a Sötétség győzelme, hanem a Kettő közötti <strong>Egyensúly</strong> fenntartása, amit Trag'Oul, a hatalmas kozmikus sárkány tanításai alapján követnek. Zayl teljes szívvel hisz ebben az egyensúlyban, és élete nagy részét azzal tölti, hogy Sanctuary-t járva megakadályozza, hogy akár a Mennyek, akár a Pokol túl nagy befolyást szerezzen a halandók világa felett.</p>\n\n      <h2>Humbart Wessel, a Hűséges Társ</h2>\n      <p>Zayl ritkán utazik egyedül. Oldalán – pontosabban a köpenyébe vagy kezébe rejtve – mindig ott van <strong>Humbart Wessel</strong>. Humbart nem más, mint egy beszélő emberi koponya, aki egykor egy híres és hatalmas zsoldos harcos volt. Zayl nekromanta képességeivel tartja a lelket a koponyában, így Humbart megőrizte egykori személyiségét és tudatát.</p>\n      <p>A kettejük közti dinamika gyakran szolgál komikus és bölcs pillanatokkal. Humbart a harcokban és a történetekben egyaránt hasznos: sokszor szolgáltat információt, figyelmezteti Zayl-t a veszélyekre, és harapásával – vagy inkább szellemi jelenlétével – hozzájárul a túléléshez. A köztük lévő mély tisztelet és bajtársiasság különleges színezetet ad Zayl amúgy komor karakterének.</p>\n\n      <h2>Kalandjai</h2>\n      <h3>Az Árnyak Királysága (The Kingdom of Shadow)</h3>\n      <p>Zayl először a <em>The Kingdom of Shadow</em> című könyvben tűnt fel (szerző: Richard A. Knaak), ahol Kentril Dumon zsoldoskapitányhoz csatlakozik, hogy felfedezzék Ureh elveszett, legendás városát. Zayl hamar rájön, hogy a város nem egy mennyei menedék, hanem a Pokol erői és a sötét varázsló, Juris Khan által átkozott csapda. Csontmágiájával és a holtak irányításával Zayl kulcsszerepet játszik a túlélők megmentésében és a sötétség megállításában.</p>\n\n      <h3>A Pók Holdja (Moon of the Spider)</h3>\n      <p>Ebben a kalandban Zayl Lord Aldric Jitan nyomába ered, és Westmarch városában szembesül egy újabb borzalommal. Itt Zayl az arachnida démonok és egy ősi pókkirálynő ellen harcol, miközben újra bebizonyítja, hogy a nekromanták sötét mágiája képes a világ világosságát szolgálni.</p>\n\n      <h3>A Rend (The Order)</h3>\n      <p>Zayl feltűnik a Diablo III eseményei előtt játszódó <em>The Order</em> című könyvben is (szerző: Nate Kenyon). Itt Deckard Cain, a Horadrim utolsó tagja találkozik a nekromantával. Zayl segít Cain-nek és a fiatal Leah-nak, kiderül, hogy a nekromanták egy részét megtámadták, és Zayl élete is veszélybe kerül, ahogy egy új, egyensúlyt fenyegető sötétség kezd felemelkedni.</p>\n\n      <h2>Képességei és Felszerelése</h2>\n      <p>Zayl a tradicionális nekromanta képességeket használja a legmagasabb fokon. Főbb varázslatai és eszközei közé tartoznak:</p>\n      <ul>\n        <li><strong>Csontmágia:</strong> Képes csontlándzsákat (Bone Spear), csontpajzsot (Bone Armor) és börtönöket (Bone Prison) varázsolni puszta akaraterejéből.</li>\n        <li><strong>Holtak Feltámasztása:</strong> Pillanatok alatt képes feltámasztani az elhunytak csontvázait, hogy azok neki engedelmeskedjenek és harcoljanak mellette.</li>\n        <li><strong>Gólemek:</strong> Amikor az ellenség túlerőben van, Zayl képes hatalmas Gólemeket (különösen Vérgólemeket vagy Csontgólemeket) megidézni a földből és az elesettek maradványaiból.</li>\n        <li><strong>Csonttőr:</strong> Fegyvere egy rituális, varázslatokkal átitatott tőr, mely nemcsak közelharcban, de a halálos energiák irányításában is nélkülözhetetlen számára.</li>\n      </ul>\n\n      <p>Zayl a Diablo univerzum egyik legjobban kidolgozott hőse. A holtak uralása ellenére az életet és az Egyensúlyt tiszteli, bebizonyítva, hogy a sötét mágia is használható jó célokra, ha azt bölcsesség és önfegyelem irányítja.</p>\n    "
  },
  "humbart-wessel": {
    "id": "humbart-wessel",
    "category": "Karakterek – Olvasó",
    "title": "Humbart Wessel",
    "subtitle": "A Beszélő Koponya",
    "infobox": {
      "Állapot": "Élőhalott (Koponya)",
      "Előző Élet": "Zsoldos, Kalandor",
      "Társ": "Zayl",
      "Képességek": "Hatalmas tudás, harapás, figyelemelterelés"
    },
    "content": "\n      <h2>Bevezetés</h2>\n      <p><strong>Humbart Wessel</strong> talán a legkülönlegesebb kísérő az egész Diablo univerzumban. Bár fizikailag csak egy foghíjas, emberi koponya, személyisége, humora és bölcsessége miatt hamar a rajongók kedvencévé vált. Ő Zayl, a nekromanta hűséges társa és tanácsadója, akit a nekromanta sötét, de egyensúlyt kereső mágiája tart életben (vagy inkább tudatánál).</p>\n\n      <h2>Élete Zsoldosként</h2>\n      <p>Mielőtt egy beszélő koponyává vált volna, Humbart Wessel egy híres, sőt legendás zsoldos volt. Életében bejárta egész Sanctuary-t, számtalan csatát vívott, és rengeteg kincset megismert. Tapasztalata és cinikus világlátása ebből a zord, véres korszakból származik. Halálának pontos körülményei homályosak, de az biztos, hogy halála után koponyája Zayl birtokába került.</p>\n\n      <h2>A Koponya Élete</h2>\n      <p>Zayl rathmiánus varázslattal ébresztette fel Humbart tudatát. A varázslat nem kötötte szolgaságba a lelkét; Humbart megőrizte szabad akaratát és személyiségét, bár helyhez (pontosabban a koponyához) van kötve. Humbart gyakran utazik Zayl köpenyének zsebében, vagy a nekromanta kezében pihen, onnan kommentálva az eseményeket.</p>\n\n      <p>Bár fizikai ereje egy koponyára korlátozódik, Humbart meglepően hasznos:\n      <ul>\n        <li><strong>Figyelmeztetés:</strong> Képes észlelni a veszélyeket és a sötét mágiát, gyakran megmentve Zayl életét.</li>\n        <li><strong>Harapás:</strong> Ha egy ellenség túl közel merészkedik, Humbart nem fél beleharapni (ami egy koponyától meglepően fájdalmas lehet).</li>\n        <li><strong>Figyelemelterelés:</strong> Mivel a legtöbb ember (és démon) nem számít egy repülő vagy beszélő koponyára, Zayl gyakran használja őt a harcokban zavarkeltésre.</li>\n      </ul></p>\n\n      <h2>Szerepe az Árnyak Királyságában</h2>\n      <p>A <em>The Kingdom of Shadow</em> eseményei alatt Humbart folyamatosan tanácsokkal látja el Kentril Dumont és Zayl-t. Cinikus megjegyzéseivel és éleslátásával ő az, aki gyakran kimondja azt a kényelmetlen igazságot, amit a többiek nem akarnak meghallani Ureh városáról. Kapcsolata Zayllel olyan, mint két öreg baráté, akik folyamatosan évődnek egymással, de az életüket is rábíznák a másikra.</p>\n    "
  },
  "juris-khan": {
    "id": "juris-khan",
    "category": "Karakterek – Olvasó",
    "title": "Juris Khan",
    "subtitle": "Ureh Uralkodója és Elátkozója",
    "infobox": {
      "Foglalkozás": "Ureh Ura, Varázsló",
      "Szövetséges": "Diablo (A Rettegés Ura)",
      "Állapot": "Démoni Árnyék",
      "Képességek": "Illúzió, Nekromancia, Démonidézés"
    },
    "content": "\n      <h2>Bevezetés</h2>\n      <p><strong>Juris Khan</strong> a legendás Ureh városának uralkodója, és a <em>The Kingdom of Shadow</em> regény főgonosza. Egykor egy bölcs és tisztelt varázsló-király volt, akinek uralkodása alatt Ureh a \"Fények Közötti Fény\" (The Light among Lights) néven vált ismertté. Khan hatalomvágya és egy angyali illúzió azonban végül a saját és népe pusztulásához vezetett.</p>\n\n      <h2>A Fények Közötti Fény</h2>\n      <p>Ureh városa Nymyr hegyének lábánál feküdt, és Juris Khan vezetésével virágzott. A város olyan spirituális tisztaságot és gazdagságot ért el, hogy sokan azt hitték, képesek lennének egyenesen a Magas Mennyekbe (High Heavens) emelkedni. Khan a legképzettebb mágusokat gyűjtötte maga köré, és folyamatosan kereste a kapcsolatot az angyalokkal.</p>\n\n      <h2>Mirakodus és a Bukás</h2>\n      <p>Khan imáira végül válasz érkezett: egy Mirakodus nevű \"arkangyal\" jelent meg előtte. Mirakodus egy rituálét tanított Khannak, amely állítása szerint az egész várost a Mennyekbe emeli. A fanatikus Khan ráerőltette a rituálét a város lakóira.</p>\n\n      <p>Azonban a rituálé közepén Gregus Mazi, egy másik varázsló, rájött a szörnyű igazságra: Mirakodus nem arkangyal volt, hanem maga <strong>Diablo, a Rettegés Ura</strong> álcázva. Bár Mazi megpróbálta megállítani a varázslatot, már túl késő volt. A rituálé megszakadt, és Ureh a Mennyek és a Pokol közötti limbóba (Limbo) zuhant.</p>\n\n      <h2>Az Árnyak Királya</h2>\n      <p>Juris Khan nem halt meg. Ehelyett teste és lelke démoni korrupciót szenvedett el. Ahogy teltek az évszázadok a sötét dimenzióban, Khan teljesen azonosult Diablo akaratával. Amikor a csillagok együttállása miatt Ureh időnként visszatért Sanctuary-ba, Khan és az átalakult, élőhalott/démoni lakosok megpróbálták kiszabadítani magukat a limbóból, hogy Diablo seregeként árasszák el a világot.</p>\n\n      <p>Külseje is borzalmasan megváltozott: a korábban büszke király egy torz, árnyékokból és sötét mágiából álló lény lett, aki kegyetlenül feláldozott mindenkit, aki az útjába állt.</p>\n\n      <h2>Végső Bukása</h2>\n      <p>Kentril Dumon, Zayl, a nekromanta és társaik expedíciója végül szembeszállt Juris Khannal. Zayl csontmágiája és Kentril bátorsága révén sikerült megtörniük Khan sötét varázslatát. Khan elpusztult, és Ureh átka megváltozott, megakadályozva, hogy a város valaha is a Pokol kapujává váljon.</p>\n    "
  },
  "aki-hazudik-belial": {
    "id": "aki-hazudik-belial",
    "title": "Aki hazudik – Belial visszatérése",
    "subtitle": "Matthew J. Kirby hivatalos Diablo IV-elbeszélésének magyar ismertetője",
    "category": "Rövid történetek",
    "gameTag": "Diablo IV",
    "image": "",
    "description": "Egy titkos éjszakai szertartás és egy haldokló gyermek története, amely Belial, a Hazugság Ura visszatérését készíti elő.",
    "relatedArticles": [
      "prime-lesser-evils",
      "diablo-3-story"
    ],
    "content": "<h2>A történet</h2><p>Egy apa, egy anya, egy pap, egy közvetítő és egy boszorkány éjszaka összegyűlik, hogy megmentsen egy haldokló kislányt. A szertartás során azonban egyre kevésbé világos, hogy valóban a gyermek lelkét hívják-e vissza, vagy egy sokkal veszélyesebb lény használja fel a résztvevők hazugságait.</p><p>A történet Belial természetét nem pusztán megtévesztésként, hanem az önámítás és a bizalom szétrombolásának erejeként mutatja be. Ez a Diablo IV nyolcadik évadában bekövetkező visszatérésének hivatalos előzménye.</p><h2>Forrás</h2><p><a href=\"https://news.blizzard.com/fr-fr/article/24195755/une-nouvelle-histoire-quiconque-ment\" target=\"_blank\" rel=\"noopener noreferrer\">Blizzard: Quiconque ment / Aki hazudik</a></p>"
  },
  "aratas-eve-sharval": {
    "id": "aratas-eve-sharval",
    "title": "Az aratás éve – Albrecht Sharvalban",
    "subtitle": "A Prince of Freedom küldetés hivatalos képregény-előzménye",
    "category": "Rövid történetek",
    "gameTag": "Diablo Immortal",
    "image": "",
    "description": "Albrecht követői reményt és igazságot ígérnek Sharval lakóinak, miközben egyre nagyobbra növelik híveik seregét.",
    "relatedArticles": [
      "diablo-immortal",
      "diablo-1-story"
    ],
    "content": "<h2>Sharval bizonytalan megmentője</h2><p>Sharval vadonjának lakói vigaszért és igazságért kiáltanak. Albrecht emberei válaszolnak a hívásra, de segítségük egyúttal a követőik számát és uruk befolyását is növeli. A képregény ezért szándékosan nyitva hagyja, hogy a visszatért herceg valódi oltalmazó vagy egy újabb fenyegetés-e.</p><p>Az elbeszélés a <em>Prince of Freedom</em> történeti küldetés közvetlen előzménye, és a Diablo Immortal későbbi korszakában helyezi új megvilágításba Albrecht örökségét.</p><h2>Forrás</h2><p><a href=\"https://news.blizzard.com/es-es/article/24214091/una-nueva-historia-ano-de-la-cosecha\" target=\"_blank\" rel=\"noopener noreferrer\">Blizzard: Año de la Cosecha / Az aratás éve</a></p>"
  },
  "csontok-szentelye": {
    "id": "csontok-szentelye",
    "title": "A Csontok szentélye",
    "subtitle": "Iolaynah útja Scosglen lápvidékén",
    "category": "Rövid történetek",
    "gameTag": "Diablo IV",
    "image": "",
    "description": "Iolaynah eltűnt nővérét és annak mágusmesterét keresve egy romlott szentély titkaiba ereszkedik alá.",
    "relatedArticles": [
      "diablo-4-story"
    ],
    "content": "<h2>Iolaynah keresése</h2><p>Tejal elbeszélésében Iolaynah Scosglen ködös lápvidékére indul eltűnt nővére után. A nyomok Droman Grigsóhoz, ahhoz a varázslóhoz vezetnek, akinél a nővére tanulni akart. A mágus omladozó szentélyében azonban nem tudás, hanem elhallgatott bűnök és áldozatok öröksége várja.</p><p>A történet a Sanctuary meséi sorozat része, és azt vizsgálja, hogyan válhat a tudás keresése kiszolgáltatottsággá egy olyan világban, ahol a mesterek szándékai ritkán tiszták.</p><h2>Forrás</h2><p><a href=\"https://news.blizzard.com/en-us/article/23972666/diablo-iv-short-story-sanctum-of-bone-by-carly-anne-west\" target=\"_blank\" rel=\"noopener noreferrer\">Blizzard: Sanctum of Bone</a></p>"
  },
  "vak-szem-haza": {
    "id": "vak-szem-haza",
    "title": "A Vak Szem Háza",
    "subtitle": "A Nővérek hazatérése a Világ Koronájánál vívott csata után",
    "category": "Rövid történetek",
    "gameTag": "Diablo Immortal",
    "image": "",
    "description": "A Vak Szem Nővérei győztesen térnek vissza Eastgate-be, de a háború sebei velük együtt érkeznek haza.",
    "relatedArticles": [
      "diablo-immortal"
    ],
    "content": "<h2>A győzelem ára</h2><p>A Világ Koronájánál megnyert csata után a Vak Szem Nővérei visszatérnek Eastgate-be. A rend azonban nem tud egyszerűen visszatérni korábbi életéhez: a veszteség, a harag és a háborúban meghozott döntések tovább élnek a túlélőkben.</p><p>Fred Kennedy hivatalos képregénye azt mutatja meg, hogy Sanctuaryban a győzelem sem állítja helyre automatikusan az otthont. A történet közvetlenül a Diablo Immortal újabb eseményeihez kapcsolódik.</p><h2>Forrás</h2><p><a href=\"https://news.blizzard.com/en-us/article/24259071/a-new-tale-house-of-the-sightless\" target=\"_blank\" rel=\"noopener noreferrer\">Blizzard: House of the Sightless</a></p>"
  },
  "bunfalo-warlock": {
    "id": "bunfalo-warlock",
    "title": "Bűnfaló – a Warlock ára",
    "subtitle": "Egy pokoli erőt használó harcos erkölcsi terhe",
    "category": "Rövid történetek",
    "gameTag": "Diablo Immortal",
    "image": "",
    "description": "A Warlock a Pokol erejét fordítja a démonok ellen, de minden győzelemért személyes árat fizet.",
    "relatedArticles": [
      "diablo-immortal",
      "prime-lesser-evils"
    ],
    "content": "<h2>Bűn és áldozat</h2><p>A Warlock útján nincsenek tisztán jó vagy rossz döntések. Pokoli hatalmat használ a démonok elpusztítására, ezért minden győzelem azzal a veszéllyel jár, hogy az alkalmazott erő őt magát is megváltoztatja.</p><p>Benjamin Wagner hivatalos képregénye a kaszt eredettörténetét nem diadalmeseként, hanem a szükséges rossz és az önfeláldozás közötti küzdelemként mutatja be.</p><h2>Forrás</h2><p><a href=\"https://news.blizzard.com/en-us/article/24259078/a-new-tale-sin-eater\" target=\"_blank\" rel=\"noopener noreferrer\">Blizzard: Sin Eater</a></p>"
  },
  "megcsonkitott-varos": {
    "id": "megcsonkitott-varos",
    "title": "A megcsonkított város – Lut Gholein megszállása",
    "subtitle": "A Gondozó uralma és Andariel rejtett befolyása",
    "category": "Rövid történetek",
    "gameTag": "Diablo Immortal",
    "image": "",
    "description": "Lut Gholein ellenállóit a Gondozó a halálnál is rosszabb sorsra küldi, miközben a háttérből más mozgatja a szálakat.",
    "relatedArticles": [
      "diablo-immortal",
      "diablo-2-story"
    ],
    "content": "<h2>Megszállt Lut Gholein</h2><p>Az egykor virágzó sivatagi város a Gondozó uralma alatt él. Akik ellenállnak a megszállásnak, azokat olyan büntetés várja, amely a halálnál is kegyetlenebb lehet. A történet központi kérdése nemcsak a város börtönőrének kiléte, hanem az is, hogy valójában ki irányítja őt.</p><p>Clay McLeod Chapman hivatalos képregénye Andariel befolyását és Lut Gholein újabb tragédiáját kapcsolja a Diablo Immortal folytatódó történetéhez.</p><h2>Forrás</h2><p><a href=\"https://news.blizzard.com/en-gb/article/24280279/a-new-tale-the-maimed-city\" target=\"_blank\" rel=\"noopener noreferrer\">Blizzard: The Maimed City</a></p>"
  },
  "the-lost-horadrim": {
    "id": "the-lost-horadrim",
    "title": "The Lost Horadrim – Az elveszett Horadrim",
    "subtitle": "A Lord of Hatred hivatalos előzményregénye",
    "category": "Könyvek és írások",
    "gameTag": "Diablo IV",
    "type": "book",
    "image": "",
    "description": "Matthew J. Kirby regénye a Horadrim Skovosra vezető útját, Lorath és Adreona kényszerű szövetségét mutatja be.",
    "relatedArticles": [
      "lost-horadrim-expedition",
      "lorath-nahr",
      "adreona",
      "diablo-4-loh",
      "horadrim-order",
      "skovos"
    ],
    "content": "<h2>Bibliográfia</h2><p><strong>Szerző:</strong> Matthew J. Kirby<br><strong>Kiadó:</strong> Random House Worlds<br><strong>Megjelenés:</strong> 2026. április 21.<br><strong>ISBN:</strong> 9780425284896</p><h2>Spoilermentes összefoglaló</h2><p>A [[horadrim-order|Horadrim rend|faction]] fennmaradása veszélybe kerül, ezért [[lorath-nahr|Lorath Nahr|character]] vezetésével a távoli [[skovos|Skovos-szigetekre|location]] indulnak. Egy korábban eltűnt mágusexpedíció és egy elrejtett páncélterem nyomát követik, miközben az amazonok saját politikai válsággal és egy több irányból támadó élőhalott lénnyel néznek szembe.</p><p>[[lorath-nahr|Lorath|character]] és [[adreona|Adreona kapitány|character]] kénytelen szövetséget kötni. A részletes, spoileres történeti feldolgozás itt olvasható: [[lost-horadrim-expedition|Az elveszett Horadrim expedíciója|event]].</p><h2>Történeti jelentőség</h2><p>A kiadó hivatalosan a <em>Diablo IV: Lord of Hatred</em> előzményregényeként azonosítja. Az idővonal ezért a <em>Vessel of Hatred</em> után, de a <em>Lord of Hatred</em> fő kampánya előtt mutatja; pontos évszám hiányában relatív dátummal.</p><h2>Helyi olvasás</h2><p>A magyar nyelvű helyi példány fejezetenként olvasható. A történetnézetben a regény a kapcsolódó esemény után jelenik meg, és átugorható.</p><h2>Forrás</h2><p><a href=\"https://www.penguinrandomhouse.com/books/538199/the-lost-horadrim-diablo-iv-by-matthew-j-kirby/\" target=\"_blank\" rel=\"noopener noreferrer\">Random House Worlds: The Lost Horadrim</a></p>"
  },
  "elveszettek-es-elatkozottak": {
    "id": "elveszettek-es-elatkozottak",
    "title": "Az elveszettek és az elátkozottak",
    "subtitle": "Egy Warlock magányos szolgálata",
    "category": "Rövid történetek",
    "gameTag": "Diablo IV",
    "image": "",
    "description": "A Warlock önként vállalt elszigeteltségét egy váratlan találkozás teszi próbára.",
    "relatedArticles": [
      "diablo-4-loh",
      "skovos"
    ],
    "content": "<h2>A tiltott erő őrzője</h2><p>A Warlock küldetése önzetlen, mégis hálátlan: a Pokol teremtményeit saját uraik ellen fordítja, miközben a közösségtől távol kell maradnia. Paul Tobin illusztrált története azt a pillanatot vizsgálja, amikor a megszokott magányt egy váratlan emberi kapcsolat töri meg.</p><h2>Történeti helye</h2><p>A történet a <em>Lord of Hatred</em> Warlock osztályának hivatalos felvezetése. Pontos Sanctuary-beli dátumot a közlemény nem ad, ezért a wiki nem rendel hozzá kitalált évszámot.</p><h2>Alkotók</h2><p>Író: Paul Tobin; rajzi tervek: Corey Peterschmidt; tus: Christopher Mitten; színek: Lauren Affe.</p><h2>Forrás</h2><p><a href=\"https://news.blizzard.com/en-us/article/24259141/a-new-tale-the-lost-the-damned\" target=\"_blank\" rel=\"noopener noreferrer\">Blizzard: The Lost &amp; the Damned</a></p>"
  },
  "apoteozis-donan": {
    "id": "apoteozis-donan",
    "title": "Apoteózis – Donan és Astaroth lélekköve",
    "subtitle": "A Horadrim kötelesség ára Lilith visszatérése előtt",
    "category": "Rövid történetek",
    "gameTag": "Diablo IV",
    "image": "",
    "description": "Donan évtizedekkel Lilith visszatérése előtt megújítja Astaroth lélekkövét őrző védelmet.",
    "relatedArticles": [
      "diablo-4-story",
      "horadrim-order"
    ],
    "content": "<h2>A megújítandó pecsét</h2><p>Évtizedekkel Lilith visszatérése előtt Donan visszatér Astaroth lélekkövéhez, hogy megerősítse annak gyengülő védelmét. A feladat közben szembe kell néznie a Horadrim által őrzött tiltott tudással és azzal, milyen személyes árat követel a rend szolgálata.</p><h2>Kapcsolódás a Diablo IV-hez</h2><p>A történet a <em>Sins of the Horadrim</em> évad előzménye, ugyanakkor Donan, Astaroth és a lélekkő korábbi kapcsolatát is megvilágítja. A közlemény relatív időpontot ad, pontos évet nem.</p><h2>Forrás</h2><p><a href=\"https://news.blizzard.com/en-us/article/24215258/a-new-tale-apotheosis\" target=\"_blank\" rel=\"noopener noreferrer\">Blizzard: Apotheosis</a></p>"
  },
  "az-elhivas-paladin": {
    "id": "az-elhivas-paladin",
    "title": "Az elhívás – a Fény Őrzőinek Paladinja",
    "subtitle": "A hit újjászületése a Gyűlölet Ura elleni háború előtt",
    "category": "Rövid történetek",
    "gameTag": "Diablo IV",
    "image": "",
    "description": "A Paladin útját és a Fény Őrzőinek szolgálatát bemutató hivatalos előtörténet.",
    "relatedArticles": [
      "diablo-4-loh",
      "akarat-nahantu"
    ],
    "content": "<h2>Hívás a szolgálatra</h2><p>Chris Roberson története a Paladin hitből, felelősségből és vezeklésből születő küldetését mutatja be. A szereplő nem egy romlatlan intézményt szolgál: a Fény Őrzői olyan rendként jelennek meg, amely a korábbi egyházi korrupciótól és dogmáktól függetlenül akarja védeni Sanctuary lakóit.</p><h2>A Fény Őrzői</h2><p>A <em>Lord of Hatred</em> hivatalos leírása szerint az Őrzők befogadják a kitaszítottakat és bűnösöket is, ha életüket Sanctuary védelmének szentelik. Ez megkülönbözteti őket a Zakarum történelmi rendjeinek minden korábbi ágától.</p><h2>Forrás</h2><p><a href=\"https://news.blizzard.com/en-us/article/24243641/a-new-tale-the-calling\" target=\"_blank\" rel=\"noopener noreferrer\">Blizzard: The Calling</a></p>"
  },
  "warlock-vizjerei-orokseg": {
    "id": "warlock-vizjerei-orokseg",
    "title": "A Warlock és a Vizjerei tiltott öröksége",
    "subtitle": "Démonológia, üldöztetés és pokoli kötelékek",
    "category": "Frakciók és rendek",
    "gameTag": "Diablo IV",
    "image": "",
    "description": "A Warlock hagyománya a Vizjerei démonidézőinek bukásáig és a mágusklán-háborúkig vezethető vissza.",
    "relatedArticles": [
      "mage-clan-wars",
      "diablo-4-loh",
      "elveszettek-es-elatkozottak"
    ],
    "content": "<h2>Vizjerei eredet</h2><p>A Vizjerei mágusok egy része démonokat idézett és kötött szolgálatba. A gyakorlat hozzájárult a mágusklán-háborúk kitöréséhez; túlélő művelőit Warlock néven megbélyegezték és üldözték.</p><h2>A Pokol ereje a Pokol ellen</h2><p>A Warlock nem egyszerű démonimádó. Kockázatos paktumokkal, idézéssel és akaraterejével pokoli szolgákat kényszerít harcra korábbi uraik ellen. Módszere ezért egyszerre lehet Sanctuary védelme és a használóját fenyegető romlás forrása.</p><h2>Forrás</h2><p><a href=\"https://news.blizzard.com/en-us/article/24267728/master-hell-itself-with-the-warlock\" target=\"_blank\" rel=\"noopener noreferrer\">Blizzard: Master Hell Itself with the Warlock</a></p>"
  },
  "nehezen-lepj-druida": {
    "id": "nehezen-lepj-druida",
    "title": "Nehéz léptekkel – Bertolt és az Első Erdő",
    "subtitle": "A Sharval vadonját védő druida története",
    "category": "Rövid történetek",
    "gameTag": "Diablo Immortal",
    "image": "",
    "description": "Bertolt druida a rothadó Első Erdőben száll szembe a pusztító tündérlényekkel.",
    "relatedArticles": [
      "diablo-immortal"
    ],
    "content": "<h2>Az erdő válasza</h2><p>Az Első Erdő szívében idegen romlás terjed, a tündérlények pedig fákat, állatokat és embereket emésztenek fel. Bertoltot arra tanították, hogy könnyedén járjon a természetben, de a fenyegetéssel szemben felismeri: az erdő megóvásához néha súlyosabb kézre van szükség.</p><h2>Szerepe</h2><p>Ryan Quinn hivatalos képregénye a Diablo Immortal Druidájának világon belüli szerepét mutatja be; nem a teljes kaszt történetének időrendi összefoglalója.</p><h2>Forrás</h2><p><a href=\"https://news.blizzard.com/en-us/article/24216887/a-new-tale-tread-heavy\" target=\"_blank\" rel=\"noopener noreferrer\">Blizzard: Tread Heavy</a></p>"
  },
  "veres-ekkő-lut-gholein": {
    "id": "veres-ekkő-lut-gholein",
    "title": "A véres ékkő – visszatérés Lut Gholeinbe",
    "subtitle": "Vizjerei kísérletek és tiltott démonmágia",
    "category": "Események",
    "gameTag": "Diablo Immortal",
    "image": "",
    "description": "A Diablo Immortal 5.0 történeti fejezete Lut Gholein romlását és a Warlock tiltott hagyományát kapcsolja össze.",
    "relatedArticles": [
      "diablo-immortal",
      "megcsonkitott-varos",
      "warlock-vizjerei-orokseg"
    ],
    "content": "<h2>Lut Gholein új válsága</h2><p>A kalandozók visszatérnek a legendás sivatagi városba, ahol régi Vizjerei kísérletek áldozatai készülnek bosszúra. A történeti fejezet összeköti a város megszállását, a démonok feletti tiltott uralmat és a Warlock felemelkedését.</p><h2>Biztos és előzetes adatok</h2><p>A helyszín, a Vizjerei-kapcsolat és a Warlock szerepe hivatalosan megerősített. A korai előzetes változtatható információkat is tartalmazott, ezért a wiki csak a későbbi történetben is megerősített elemeket kezeli biztosként.</p><h2>Forrás</h2><p><a href=\"https://news.blizzard.com/en-us/article/24244890/the-bloodied-jewel-your-first-look-at-our-next-major-update\" target=\"_blank\" rel=\"noopener noreferrer\">Blizzard: The Bloodied Jewel</a></p>"
  },
  "gyotrelem-nemzete": {
    "id": "gyotrelem-nemzete",
    "title": "Gyötrelem nemzete – Lut Gholein két kínzója",
    "subtitle": "Fájdalom és Gyötrelem szorításában",
    "category": "Események",
    "gameTag": "Diablo Immortal",
    "image": "",
    "description": "Lut Gholein története a Magas Körzettel és a város falain túl terjedő torzulásokkal folytatódik.",
    "relatedArticles": [
      "diablo-immortal",
      "veres-ekkő-lut-gholein",
      "megcsonkitott-varos"
    ],
    "content": "<h2>A megszállás folytatása</h2><p>Fájdalom és Gyötrelem erői Lut Gholein fölött szorítják meg uralmukat. A történet a Magas Körzetbe vezet, miközben a torzító kínok már a város falain túlra is elérnek.</p><h2>Ellenőrzési megjegyzés</h2><p>A fejezet folytatása hivatalosan bejelentett történeti tartalom. Mivel a részletes javítási jegyzék 2026. szeptember 14-re van ütemezve, a wiki nem állít ennél részletesebb, még nem véglegesített eseménysort.</p><h2>Forrás</h2><p><a href=\"https://news.blizzard.com/en-us/article/24297202/made-to-suffer-your-first-look-at-our-next-update\" target=\"_blank\" rel=\"noopener noreferrer\">Blizzard: Made to Suffer</a></p>"
  },
  "stay-awhile-listen-book-1": {
    "id": "stay-awhile-listen-book-1",
    "title": "Stay Awhile and Listen: Book I",
    "subtitle": "Az első Diablo fejlesztéstörténete",
    "category": "Könyvek és írások",
    "gameTag": "Háttéranyag",
    "type": "book",
    "image": "",
    "description": "David L. Craddock dokumentumkönyve a Blizzard North és az első Diablo létrejöttéről.",
    "relatedArticles": [
      "diablo-1-story"
    ],
    "content": "<h2>Bibliográfia</h2><p><strong>Szerző:</strong> David L. Craddock<br><strong>Kiadó:</strong> DM Press<br><strong>Legendary Edition:</strong> 2017. július 17.<br><strong>ISBN:</strong> 9780988409910</p><h2>Összefoglaló</h2><p>A könyv a Blizzard és a Condor – később Blizzard North – alkotóinak munkáján keresztül mutatja be az első Diablo megszületését. Fejlesztői döntésekkel, technikai és üzleti háttérrel, valamint a stúdiók együttműködésével foglalkozik.</p><h2>Forrásérték és kánon</h2><p>Fejlesztéstörténeti háttérforrás, ezért nem Sanctuary világán belüli kánonmű és nem használható önmagában lore-események igazolására. A játék készítésére és az alkotók történetére vonatkozó kutatásban azonban releváns másodlagos forrás.</p><h2>Kiadások</h2><p>A szerző külön Legendary és rövidebb Narrative kiadást ismertet. A helyi fájl PDF-metaadata a Legendary Edition címet és David L. Craddock szerzőségét erősíti meg.</p><h2>Forrás</h2><p><a href=\"https://davidlcraddock.com/news/page/chronicles-craddock-2017/\" target=\"_blank\" rel=\"noopener noreferrer\">David L. Craddock: Chronicles of Craddock 2017</a></p>"
  }
};
