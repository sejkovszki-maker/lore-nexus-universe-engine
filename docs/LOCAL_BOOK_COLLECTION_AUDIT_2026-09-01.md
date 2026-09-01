# Helyi könyvgyűjtemény audit

Forrásmappa: `C:\Users\Lezli\Desktop\Diablo fejleszt`

## Leltár

- Összesen 85 fájl: 14 PDF, 3 EPUB, 6 TXT, fejlesztési dokumentumok és egy már kibontott EPUB-struktúra.
- A kibontott HTML-, kép-, OPF-, NCX- és CSS-fájlok nem önálló művek.
- Az EPUB és az azonos tartalmú ZIP egy byte-azonos duplikátumpár.
- A fájlok 11 önálló könyvművet képviselnek; a Sin War Box Set gyűjtőkiadás, nem három új Work.

## Work Resolution

| Mű | Helyi példány | Korábbi registry | Eredmény |
|---|---|---|---|
| Demonsbane | 2 PDF | igen | SAME_WORK_DIFFERENT_INSTANCE |
| Birthright | PDF, EPUB, TXT és box set | igen | SAME_WORK_DIFFERENT_INSTANCE |
| Scales of the Serpent | EPUB/TXT, cseh PDF és box set | igen | SAME_WORK_DIFFERENT_INSTANCE |
| The Veiled Prophet | PDF/TXT és box set | igen | SAME_WORK_DIFFERENT_INSTANCE |
| The Kingdom of Shadow | 2 PDF | igen | SAME_WORK_DIFFERENT_INSTANCE |
| The Black Road | PDF | igen | MATCH_EXISTING; a helyi fájlnév szerzőadata hibás |
| Diablo III: The Order | PDF | igen | MATCH_EXISTING |
| Legacy of Blood | PDF | igen | MATCH_EXISTING |
| Moon of the Spider | PDF | igen | MATCH_EXISTING |
| Stay Awhile and Listen: Book I | PDF | nem | CREATE_NEW, non-canon reference |
| The Lost Horadrim | PDF | nem | CREATE_NEW, official licensed novel |

## Meglévő wiki ellenőrzése

- A Sin War három kötete, a Demonsbane és a The Black Road fejezetrekordokkal is jelen van.
- A meglévő teljes fejezetek nem számítanak bibliográfiai bizonyítéknak; a Source Registry rekordjai az authoritative hivatkozások.
- Javítva: `Scales of the Serpent` magyar címe „A kígyó pikkelyei”.
- Javítva: a `Legacy of Blood` szerzője Richard A. Knaak, a `The Black Road` szerzője Mel Odom.
- Javítva: Kentril Dumon zsoldoskapitány, nem „Zakarum zsoldos”.

## Integráció

- `The Lost Horadrim`: új Source, Work, két Edition, két Verified Claim és magyar könyvadatlap.
- `Stay Awhile and Listen: Book I`: új szerzői Source, non-canon Work, Edition és magyar háttérkönyv-adatlap.
- A többi kilenc Work már létezett; ezekhez nem készült duplikált Work rekord.

## Hátralék

1. A helyi példányok privát Work Item rekordjainak létrehozása tartalomfingerprint alapján.
2. Fejezetenkénti magyar nyelvi és szemantikai audit a már meglévő fordításokon.
3. A helyi Chrome Translator támogatásával privát fordítás készítése azokhoz a művekhez, amelyeknek nincs magyar olvasópéldánya.
4. A teljes szövegek elkülönítése a publikus buildtől; bibliográfia és saját összefoglalás marad publikus.
