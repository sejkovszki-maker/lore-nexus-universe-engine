import type { WikiArticle } from '../../types';

const novelSource = '<a href="https://www.penguinrandomhouse.com/books/538199/the-lost-horadrim-diablo-iv-by-matthew-j-kirby/" target="_blank" rel="noopener noreferrer">Random House Worlds: The Lost Horadrim</a>';

export const lostHoradrimArticles: Record<string, WikiArticle> = {
  'lost-horadrim-expedition': {
    id: 'lost-horadrim-expedition', universeId: 'diablo', type: 'article', gameTag: 'Diablo IV',
    category: 'Események', title: 'Az elveszett Horadrim expedíciója',
    subtitle: 'Skovos válsága a Vessel of Hatred után',
    infobox: { Időrend: 'Vessel of Hatred után; Lord of Hatred előtt', Helyszín: 'Skovos-szigetek', Főszereplők: 'Lorath, Donan, Tyrael, Adreona', Forrás: 'The Lost Horadrim' },
    relatedArticles: ['the-lost-horadrim', 'lorath-nahr', 'donan-horadrim', 'tyrael-mortal', 'adreona', 'keldon', 'etara', 'myrina', 'alenia', 'sho-ren', 'skovos'],
    content: `<h2>Helye a kronológiában</h2><p>A történet a [[diablo-4-voh|Vessel of Hatred|event]] után játszódik, és a kiadó a [[diablo-4-loh|Lord of Hatred|event]] hivatalos előzményregényeként mutatja be. Pontos évszámot a nyilvános leírás nem közöl, ezért az idővonal relatív sorrendet használ.</p><h2>Út Skovos felé</h2><p>A [[horadrim-order|Horadrim rend|faction]] jövője bizonytalanná válik. [[lorath-nahr|Lorath Nahr|character]], [[donan-horadrim|Donan|character]] és [[tyrael-mortal|Tyrael|character]] a távoli [[skovos|Skovos-szigetekre|location]] indulnak. Egy korábbi, öt mágusból álló küldetés nyomát és egy elveszett páncéltermet keresnek; az előző expedíció vezetője [[sho-ren|Sho-Ren|character]] volt.</p><h2>Szövetség az askarikkal</h2><p>A szigeteket belső politikai feszültség és természetfeletti támadás sújtja. Lorath és [[adreona|Adreona kapitány|character]] kezdeti bizalmatlansága kényszerű együttműködéssé alakul. A tengeri átkelésben [[keldon|Keldon|character]] és hajója segít, míg Skovoson [[etara|Etara királynő|character]], tanácsadója, [[myrina|Myrina|character]], valamint [[alenia|Alenia|character]] és [[tavie|Tavie|character]] döntései alakítják az eseményeket.</p><h2>A válság tétje</h2><p>A keresés fokozatosan túlmutat egy eltűnt csapat felkutatásán. A Horadrim múltja, az askarik hatalmi rendje és a szigeteket fenyegető élőhalott lény ugyanazon konfliktus részeivé válnak. A küldetés veszteségei azt is megmutatják, milyen törékeny a rend, amelynek később ismét Sanctuary védelmében kell helytállnia.</p><h2>Olvasási lehetőségek</h2><p>A spoilermentes könyvlap és a helyi, fejezetes olvasó itt érhető el: [[the-lost-horadrim|The Lost Horadrim – Az elveszett Horadrim|book]]. A történetnézetben a könyv ezen esemény után következik, de egyetlen lépéssel átugorható.</p><h2>Forrás és ellenőrzés</h2><p>${novelSource}. A részletes szereplő- és cselekményadatok a helyi könyvpéldány szövege alapján készültek; a kiadói oldal az elhelyezést, Skovost, az elveszett mágusokat, a politikai konfliktust, az élőhalott fenyegetést és Lorath–Adreona szövetségét erősíti meg.</p>`
  },
  'lorath-nahr': {
    id: 'lorath-nahr', universeId: 'diablo', category: 'Karakterek', title: 'Lorath Nahr', subtitle: 'A Horadrim, aki Skovosra vezeti a küldetést',
    infobox: { Rend: 'Horadrim', Szerep: 'Expedícióvezető', Korszak: 'Diablo IV' }, relatedArticles: ['lost-horadrim-expedition', 'the-lost-horadrim', 'donan-horadrim', 'tyrael-mortal', 'adreona'],
    content: `<h2>Szerepe</h2><p>[[lorath-nahr|Lorath Nahr|character]] a [[horadrim-order|Horadrim|faction]] tapasztalt tagja. A Skovosra tartó expedícióban vezetőként kell egyensúlyt teremtenie a rend céljai, társai biztonsága és az askarik érdekei között.</p><h2>Adreonával kötött szövetsége</h2><p>[[adreona|Adreona|character]] nem egyszerű kísérő: saját népéért felelős kapitány. Lorath ezért nem parancsolhat neki, hanem bizalmat épít vele. Kettejük együttműködése a regény egyik meghatározó kapcsolata.</p><h2>Történeti helye</h2><p>Útja a [[diablo-4-voh|Vessel of Hatred|event]] utáni válságból a [[diablo-4-loh|Lord of Hatred|event]] előkészítésébe vezet. Részletes esemény: [[lost-horadrim-expedition|Az elveszett Horadrim expedíciója|event]].</p><h2>Forrás</h2><p>${novelSource}</p>`
  },
  'donan-horadrim': {
    id: 'donan-horadrim', universeId: 'diablo', category: 'Karakterek', title: 'Donan', subtitle: 'Horadrim mágus és a skovosi küldetés tagja',
    infobox: { Rend: 'Horadrim', Szerep: 'Mágus és kutató', Korszak: 'Diablo IV' }, relatedArticles: ['lost-horadrim-expedition', 'lorath-nahr', 'tyrael-mortal', 'apoteozis-donan'],
    content: `<h2>A rend szolgálatában</h2><p>[[donan-horadrim|Donan|character]] a Skovosra induló Horadrim csoport egyik kulcstagja. Tudása és varázslói tapasztalata a nyomozásban és a túlélésben egyaránt fontossá válik.</p><h2>Kapcsolatai</h2><p>Régi kötelék fűzi [[lorath-nahr|Lorathhoz|character]] és [[tyrael-mortal|Tyraelhez|character]]. A regény nem csupán harcosként, hanem a veszteségeket és a rend felelősségét hordozó emberként mutatja meg.</p><h2>Kapcsolódó történetek</h2><p>Skovosi szerepét az [[lost-horadrim-expedition|expedíció cikke|event]], korábbi lélekkő-küldetését az [[apoteozis-donan|Apoteózis|event]] dolgozza fel.</p><h2>Forrás</h2><p>${novelSource}</p>`
  },
  'tyrael-mortal': {
    id: 'tyrael-mortal', universeId: 'diablo', category: 'Karakterek', title: 'Tyrael, a halandó Horadrim', subtitle: 'Az egykori arkangyal Skovoson',
    infobox: { 'Korábbi cím': 'Az Igazság arkangyala', Rend: 'Horadrim', 'Skovosi név': 'Faysal' }, relatedArticles: ['lost-horadrim-expedition', 'lorath-nahr', 'donan-horadrim', 'sho-ren'],
    content: `<h2>Halandó küldetés</h2><p>[[tyrael-mortal|Tyrael|character]] emberként vesz részt a Horadrim munkájában. Skovoson a Faysal nevet is használja, miközben az eltűnt mágusexpedíció és annak vezetője, [[sho-ren|Sho-Ren|character]] nyomait kutatja.</p><h2>Felelősség</h2><p>A történet szembesíti azzal, hogy a korábbi döntései veszélyes küldetésekbe sodorták az új Horadrim tagjait. Ez személyes súlyt ad a kutatásnak: nem távoli rejtélyt, hanem elveszett társakat keres.</p><h2>Időrendi kapcsolat</h2><p>A [[lost-horadrim-expedition|skovosi expedíció|event]] a késői Diablo IV-korszak része. Az idővonal csak a bizonyítható relatív sorrendet jelöli.</p><h2>Forrás</h2><p>${novelSource}</p>`
  },
  'adreona': {
    id: 'adreona', universeId: 'diablo', category: 'Karakterek', title: 'Adreona', subtitle: 'Askari kapitány és Lorath szövetségese',
    infobox: { Nép: 'Askari (amazon)', Rang: 'Kapitány', Helyszín: 'Skovos' }, relatedArticles: ['lost-horadrim-expedition', 'lorath-nahr', 'tavie', 'etara', 'skovos'],
    content: `<h2>Askari kapitány</h2><p>[[adreona|Adreona|character]] Skovos harcosa és kapitánya. Népének védelme elsőbbséget élvez számára, ezért a kívülről érkező [[horadrim-order|Horadrimokat|faction]] kezdetben óvatosan fogadja.</p><h2>Lorath szövetségese</h2><p>A válság során felismeri, hogy a fenyegetés egyik fél erejével sem állítható meg. [[lorath-nahr|Lorath|character]] és Adreona kapcsolata kölcsönös tiszteletté fejlődik, miközben mindketten saját közösségükért vállalnak kockázatot.</p><h2>A történetben</h2><p>Adreona a [[lost-horadrim-expedition|skovosi eseménysor|event]] egyik központi szereplője. [[tavie|Tavie|character]] hű társa; a királyság politikai rendjében [[etara|Etara|character]] és [[myrina|Myrina|character]] döntéseihez is kapcsolódik.</p><h2>Forrás</h2><p>${novelSource}</p>`
  },
  'keldon': {
    id: 'keldon', universeId: 'diablo', category: 'Karakterek', title: 'Keldon', subtitle: 'Az Arabel kapitánya',
    infobox: { Foglalkozás: 'Hajóskapitány', Hajó: 'Arabel', Szerep: 'A Horadrim szállítója' }, relatedArticles: ['lost-horadrim-expedition', 'lorath-nahr', 'skovos'],
    content: `<h2>Az út Skovosra</h2><p>[[keldon|Keldon|character]] az <em>Arabel</em> kapitánya. Vállalja, hogy a Horadrim küldöttségét a veszélyes tengeri úton [[skovos|Skovosra|location]] viszi.</p><h2>Társ a küldetésben</h2><p>Nem marad egyszerű fuvaros: a szigetek válsága őt és legénységét is bevonja az eseményekbe. Gyakorlati tudása és hajója a csoport mozgásának feltétele.</p><h2>Öröksége</h2><p>Keldon története veszteséggel zárul; az Arabel sem tér vissza eredeti útjára. Sorsának helye: [[lost-horadrim-expedition|Az elveszett Horadrim expedíciója|event]].</p><h2>Forrás</h2><p>${novelSource}</p>`
  },
  'etara': {
    id: 'etara', universeId: 'diablo', category: 'Karakterek', title: 'Etara', subtitle: 'Skovos királynője a válság idején',
    infobox: { Cím: 'Királynő', Birodalom: 'Skovos', Tanácsadó: 'Myrina' }, relatedArticles: ['lost-horadrim-expedition', 'myrina', 'adreona', 'skovos'],
    content: `<h2>Skovos uralkodója</h2><p>[[etara|Etara|character]] a szigetek királynője, akinek a külső fenyegetés mellett a saját udvarának feszültségeivel is szembe kell néznie.</p><h2>Politikai válság</h2><p>Főtanácsadója, [[myrina|Myrina|character]] egyre nagyobb befolyásra tesz szert. A döntések következményei összekapcsolódnak az askarik védelmével és a Horadrim kutatásával.</p><h2>Kapcsolódó esemény</h2><p>Etara szerepét a [[lost-horadrim-expedition|skovosi expedíció|event]] hosszú összefoglalója helyezi időrendbe.</p><h2>Forrás</h2><p>${novelSource}</p>`
  },
  'myrina': {
    id: 'myrina', universeId: 'diablo', category: 'Karakterek', title: 'Myrina', subtitle: 'Az askari őrség vezetője és királyi tanácsadó',
    infobox: { Tisztség: 'Az askari őrség vezetője', 'Udvari szerep': 'Etara főtanácsadója', Helyszín: 'Skovos' }, relatedArticles: ['lost-horadrim-expedition', 'etara', 'adreona', 'skovos'],
    content: `<h2>Hatalom Skovoson</h2><p>[[myrina|Myrina|character]] az askari őrség vezetője és [[etara|Etara királynő|character]] főtanácsadója. Katonai és udvari befolyása miatt a szigetek válságának meghatározó alakja.</p><h2>Konfliktus</h2><p>A fenyegetésre adott válaszai nem mindig egyeznek [[adreona|Adreona|character]] vagy a Horadrim céljaival. A regény rajta keresztül mutatja meg, hogy Skovos veszélyét belső bizalmatlanság is súlyosbítja.</p><h2>Időrendi hely</h2><p>Szerepe a [[lost-horadrim-expedition|Vessel of Hatred utáni skovosi eseményekhez|event]] kötődik.</p><h2>Forrás</h2><p>${novelSource}</p>`
  },
  'alenia': {
    id: 'alenia', universeId: 'diablo', category: 'Karakterek', title: 'Alenia', subtitle: 'Skovosi vezető és segítő',
    infobox: { Szerep: 'Vezető és gyógyító segítő', Helyszín: 'Skovos' }, relatedArticles: ['lost-horadrim-expedition', 'donan-horadrim', 'adreona'],
    content: `<h2>Segítség a szigeteken</h2><p>[[alenia|Alenia|character]] útmutatást ad [[donan-horadrim|Donannak|character]], és a veszély ellenére támogatja a küldetést. Tudása a skovosi körülmények között különösen értékes.</p><h2>A gyógyító amulett</h2><p>A történet későbbi szakaszában egy gyógyító amulettel segít a megsebesült [[adreona|Adreonán|character]]. Ezzel közvetlenül hozzájárul a túlélők útjához.</p><h2>Kapcsolódó esemény</h2><p>[[lost-horadrim-expedition|Az elveszett Horadrim expedíciója|event]].</p><h2>Forrás</h2><p>${novelSource}</p>`
  },
  'tavie': {
    id: 'tavie', universeId: 'diablo', category: 'Karakterek', title: 'Tavie', subtitle: 'Adreona askari társa',
    infobox: { Nép: 'Askari (amazon)', Szövetséges: 'Adreona', Helyszín: 'Skovos' }, relatedArticles: ['lost-horadrim-expedition', 'adreona', 'skovos'],
    content: `<h2>Adreona mellett</h2><p>[[tavie|Tavie|character]] [[adreona|Adreona|character]] hű társa és a skovosi események aktív résztvevője. Jelenléte az askarik közötti személyes lojalitást mutatja meg.</p><h2>A küldetésben</h2><p>A Horadrim és az askarik együttműködése során a csoport több veszélyes szakaszán is jelen van. Történeti helye: [[lost-horadrim-expedition|Az elveszett Horadrim expedíciója|event]].</p><h2>Forrás</h2><p>${novelSource}</p>`
  },
  'sho-ren': {
    id: 'sho-ren', universeId: 'diablo', category: 'Karakterek', title: 'Sho-Ren', subtitle: 'Az első, elveszett Horadrim expedíció vezetője',
    infobox: { Származás: 'Xiansai', Képzés: 'Yshari Szentély', Rend: 'Horadrim' }, relatedArticles: ['lost-horadrim-expedition', 'tyrael-mortal', 'horadrim-order'],
    content: `<h2>Az első expedíció</h2><p>[[sho-ren|Sho-Ren|character]] xiansai mágus, az Yshari Szentélyben tanult, majd az öt Horadrimból álló korábbi skovosi küldetés vezetője lett.</p><h2>Az eltűnés öröksége</h2><p>Csapatának eltűnése indítja el a regény egyik fő nyomozási szálát. [[tyrael-mortal|Tyrael|character]] számára a keresés személyes felelősséggel is jár, mivel a Horadrim veszélyes küldetései az ő döntéseihez kapcsolódnak.</p><h2>Történeti hely</h2><p>Sho-Ren története a [[lost-horadrim-expedition|skovosi expedíció|event]] előzményében és feltárásában jelenik meg.</p><h2>Forrás</h2><p>${novelSource}</p>`
  }
};
