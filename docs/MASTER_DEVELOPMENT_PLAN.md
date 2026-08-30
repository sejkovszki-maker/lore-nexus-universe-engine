# Lore Nexus – Master Development Plan v2

Állapotfelmérés: **2026. augusztus 30.**

Ellenőrzött verzió: **`228bba5`**

Ez a dokumentum az eredeti 217 implementációs egységet, a Wiki UX-tervet és a legfrissebb auditot egyetlen, duplikációmentes végrehajtási sorrendbe rendezi. A részletes 217 pontos műszaki nyilvántartást a `MASTER_DEVELOPMENT_STATUS.md` tartalmazza.

## Állapotjelölések

- **KÉSZ** – működő megvalósítás, automatizált ellenőrzés és hibakezelési út van.
- **RÉSZBEN KÉSZ** – használható alap vagy háttérmotor létezik, de a teljes publikus adatfolyam/UI-integráció hiányos.
- **NINCS KÉSZ** – korábban tervezett, de még nem teljes követelmény.
- **ÚJ FELADAT** – a mostani audit által hozzáadott, még el nem kezdett munka.

> Egy háttérmotor megléte önmagában nem jelenti azt, hogy a funkció a nyilvános Wikiben is kész. A v2 státuszai a teljes, felhasználó által elérhető adatfolyamot értékelik.

## Végrehajtási elv

`védelem → központi router → local/published adathatár → cikk UX → keresés és kapcsolatok → szerkesztői review → nyelvi minőség → Timeline/Wiki Health → tudásréteg-integráció → automatizálás → production`

## P0 – Biztonságos alap és egységes navigáció

| # | Feladat | Állapot | Bizonyíték / hiányzó rész |
|---:|---|---|---|
| 1 | Projektmentés, immutable raw store, fingerprint és source versioning | KÉSZ | Content-addressed Raw Store, SHA-256 és verziólánc működik. |
| 2 | Automatizált backup, restore, PITR és disaster recovery | KÉSZ | Helyi/offsite mentés, visszaállítási és PITR teszt készült. |
| 3 | Audit log, tamper-evidence és zero-data-loss gate | KÉSZ | Append-only hash-lánc és rongálásdetektálás tesztelt. |
| 4 | CI, Definition of Done és automatizált minőségi kapuk | KÉSZ | Unit, property, integration, regression, fuzz, security, build és E2E fut. |
| 5 | Kötelező branch protection és review enforcement | RÉSZBEN KÉSZ | CODEOWNERS és PR-folyamat van; repository-szintű kötelező védelem nincs teljesen igazolva. |
| 6 | Router 2.0 – egyetlen központi, típusos route parser/generator | KÉSZ | Típusos parser/generator és fail-closed validáció működik. |
| 7 | Stabil fő útvonalak: home, wiki, timeline, story, book, search | RÉSZBEN KÉSZ | Wiki, timeline, story, book, editor és conflicts kész; külön search oldal a keresőcsomag része. |
| 8 | Wiki-, Story-, Timeline- és könyv-deep-link | KÉSZ | Közvetlen betöltés és frissítés E2E-ben ellenőrzött. |
| 9 | Back/Forward history és új history-bejegyzések | KÉSZ | Hash history Back/Forward mátrix sikeres; cikk- és könyvváltás nem írja felül az előzményt. |
| 10 | Hibás route, 404 cikk és biztonságos fallback | KÉSZ | Hibás, hiányzó és más univerzumhoz tartozó cikk külön 404-et ad. |
| 11 | Scroll restoration útvonalanként | KÉSZ | Route-onként session storage pozíció és Back-visszaállítás működik. |
| 12 | Router regressziós és E2E mátrix | KÉSZ | Parser unit + deep-link/history/404/scroll E2E tesztek készültek. |
| 13 | Hibás `max-w` CSS javítása | KÉSZ | Szabványos `max-width: 900px`, mobil/desktop regresszióval. |
| 14 | LOCAL DRAFT és PUBLISHED KNOWLEDGE szétválasztása | RÉSZBEN KÉSZ | IndexedDB-s, tranzakciós helyi mentés működik, de nincs publikált központi réteg. |
| 15 | Helyi draft export/import és visszaállítható biztonsági mentés | ÚJ FELADAT | Webhelyadat törlésekor a helyi import elveszhet. |
| 16 | Tulajdonosi publikálási folyamat repositoryba vagy központi tárba | ÚJ FELADAT | PC-n importált könyv telefonon nem jelenik meg. |
| 17 | Draft/published jogosultság, provenance és rollback | RÉSZBEN KÉSZ | Az általános RBAC, provenance és versioning motor elkészült, de nincs a böngészős editorhoz kötve. |

### P0 kész feltétele

Minden route központi parseren halad át; direct load, refresh, Back, Forward, 404 és scroll tesztelt. A draft eszközvesztés ellen exportálható, a publikálás pedig tulajdonosi, auditált és visszaállítható.

## P1 – Cikkoldal és olvasási élmény

| # | Feladat | Állapot | Bizonyíték / hiányzó rész |
|---:|---|---|---|
| 18 | Strukturált Wiki Link Engine és biztonságos renderer | KÉSZ | `[[id|label|relation]]`, DOMPurify, broken-link jelzés és inline handler nélküli navigáció működik. |
| 19 | Backlink index és kapcsolódó cikkek | KÉSZ | Determinisztikus backlink index és kapcsolódó lista megjelenik. |
| 20 | Breadcrumb cikkhez, könyvhöz és fejezethez | ÚJ FELADAT | Nincs valódi útvonaljelzés. |
| 21 | Automatikus tartalomjegyzék stabil heading ID-kkel | ÚJ FELADAT | A renderer felismeri a headingeket, TOC még nincs. |
| 22 | Háromrészes tudásoldal reszponzív elrendezéssel | RÉSZBEN KÉSZ | Cikk, infobox, kapcsolatok és backlinkek vannak; TOC és alsó tudáspanelek hiányoznak. |
| 23 | Verziózott infobox registry és kattintható entitásértékek | RÉSZBEN KÉSZ | Szabad kulcs/érték infobox megjelenik, de nincs publikus típusos registry-integráció. |
| 24 | Kapcsolódó szócikkek kategorizálása | ÚJ FELADAT | Egyetlen közös kapcsolati lista van. |
| 25 | Szemantikus kapcsolatok bekötése a cikkoldalba | RÉSZBEN KÉSZ | Typed Relationship és Knowledge Graph motor kész; a statikus Wiki-adatokhoz nincs teljes adapter. |
| 26 | Wiki-link preview asztali hoverrel és mobil érintéssel | ÚJ FELADAT | Nincs preview komponens. |
| 27 | Kapcsolati háló eltávolítása a fő navigációból | KÉSZ | A külön „Hálózat” lap nincs a program fő navigációjában. |
| 28 | Források és evidence megjelenítése a publikus cikkoldalon | RÉSZBEN KÉSZ | A WikiEngine page modell képes rá, a jelenlegi article view nem használja. |
| 29 | Olvasási pozíció és könyvek opcionális történeti beillesztése | KÉSZ | Pozíciómentés, könyvkapcsoló és teljes könyv átugrása működik. |
| 30 | Story Map – korszak/fa nézet az aktuális pozícióval | ÚJ FELADAT | Jelenleg lapos fejezetválasztó van. |
| 31 | Story-, könyv- és fejezetroute összekötése | NINCS KÉSZ | A Story Reader saját hash-t ír, de a központi állapot nem értelmezi. |

### P1 cikk UX kész feltétele

Breadcrumb + mobil TOC + cikk + infobox + kategorizált szemantikus kapcsolatok + események + könyvek + források + backlinkek egységes, billentyűzettel is kezelhető oldalon működik.

## P1 – Keresés és felfedezés

| # | Feladat | Állapot | Bizonyíték / hiányzó rész |
|---:|---|---|---|
| 32 | Cím- és tartalomkeresés a jelenlegi Wiki-adatokon | RÉSZBEN KÉSZ | A cikklista keres, az univerzális WikiEngine interfész létezik. |
| 33 | Többmezős keresési index | NINCS KÉSZ | Nincs teljes Title/Subtitle/Alias/Entity/Content/Infobox/Relationship/Event/Book/Source/Timeline index a publikus UI mögött. |
| 34 | Súlyozott lexikai rangsorolás | RÉSZBEN KÉSZ | A háttérben hybrid ranking motor van, a Wiki keresőbe nincs teljesen bekötve. |
| 35 | Elütéstűrés és „Ezt kerested?” | RÉSZBEN KÉSZ | Damerau–Levenshtein az entity resolutionben használatos, keresőjavaslatként nincs integrálva. |
| 36 | Keresési facetek és filterek | RÉSZBEN KÉSZ | Metadata/canon/time szűrő motor létezik, publikus kereső UI nincs. |
| 37 | Szemantikus és hybrid keresés publikus integrációja | RÉSZBEN KÉSZ | Embedding registry, vector index és hybrid engine unit tesztelt háttérmodul. |

### P1 kereső kész feltétele

Az egységes `#/search` oldal minden felsorolt mezőt súlyozva keres, elütést javít, faceteket URL-ben megőriz és megmagyarázza a találati rangsorolást.

## P1 – Könyvimport és szerkesztői workflow

| # | Feladat | Állapot | Bizonyíték / hiányzó rész |
|---:|---|---|---|
| 38 | Fájlvalidáció és böngészős PDF/DOCX/TXT/MD/HTML szövegkinyerés | KÉSZ | Típus-allowlist, hibás input elutasítása és erőforrás-takarítás tesztelt. |
| 39 | OCR képalapú PDF-ekhez a böngészős importban | RÉSZBEN KÉSZ | A szerver/CLI OCR pipeline elkészült, a böngészős importerben nincs teljes OCR fallback. |
| 40 | Helyi automatikus nyelvfelismerés és magyar fordítás | RÉSZBEN KÉSZ | Browser Translation API adapter működik támogatott böngészőben; nem univerzálisan elérhető. |
| 41 | Struktúra-, fejezet- és entity-felismerés | RÉSZBEN KÉSZ | Fejezetdetektálás és egyszerű osztályozás van; a teljes structured extraction nincs az editorhoz kötve. |
| 42 | Duplikáció- és cross-link javaslat | RÉSZBEN KÉSZ | Cím/tartalom duplikáció és létező kapcsolatok feloldása részben működik. |
| 43 | Lore consistency, canon és conflict előellenőrzés | RÉSZBEN KÉSZ | Canon/conflict motor és dashboard van, az import Review lépésébe nincs teljesen bekötve. |
| 44 | Import Review képernyő | NINCS KÉSZ | Elemzési előnézet van, de nincs teljes mezőnkénti approve/reject/modify workflow. |
| 45 | SAVE DRAFT lifecycle | RÉSZBEN KÉSZ | IndexedDB mentés működik, de nincs explicit draft státusz és változattörténet a UI-ban. |
| 46 | PUBLISH lifecycle | ÚJ FELADAT | Nincs tulajdonosi, központi publikálás. |
| 47 | Editorial Dashboard és Review Queue publikus editor-integrációja | RÉSZBEN KÉSZ | A review háttérmotor elkészült, a jelenlegi editor közvetlenül ment helyileg. |

### P1 import kész feltétele

`VALIDATE → EXTRACT → DETECT → TRANSLATE → STRUCTURE → ENTITY → DUPLICATE → LINKS → CANON → LANGUAGE → REVIEW → SAVE DRAFT → PUBLISH`, minden lépés provenance-szel, megszakítással és rollbackkel.

## P2 – Nyelvi minőség, Timeline és Wiki Health

| # | Feladat | Állapot | Bizonyíték / hiányzó rész |
|---:|---|---|---|
| 48 | Lore Nexus Language Quality Engine | ÚJ FELADAT | Jelenleg csak mojibake/control karakter és szerkezeti szabályok ellenőrzöttek. |
| 49 | Verziózott Diablo Lore Dictionary | ÚJ FELADAT | Nincs külön terminológiai adatbázis. |
| 50 | Terminológiai és fordítási konzisztencia | NINCS KÉSZ | A fordítás nem fut lore-szótáras ellenőrzésen. |
| 51 | Nyelvi Review Queue és quality gate | NINCS KÉSZ | Nincs súlyossági szintű nyelvi jóváhagyási folyamat. |
| 52 | Timeline 2.0 Knowledge Graph adapter | RÉSZBEN KÉSZ | Timeline és temporal graph motor külön létezik; a publikus timeline statikus adatokra épül. |
| 53 | Timeline facetek | NINCS KÉSZ | Korszak, játék, könyv, karakter, helyszín, frakció, canon és forrás együtt nem szűrhető. |
| 54 | Megosztható eseményoldal és timeline deep-link | ÚJ FELADAT | Nincs stabil eseményroute. |
| 55 | Lore Nexus Health belső oldal | ÚJ FELADAT | Háttér self-audit és quality metrikák vannak, egységes felület nincs. |
| 56 | Article Quality Score | RÉSZBEN KÉSZ | Knowledge Quality Score motor létezik, statikus Wiki-cikkekhez nincs adapter és UI. |
| 57 | Accessibility audit és WCAG regressziós kapu | RÉSZBEN KÉSZ | Több ARIA/fókusz javítás és mobil E2E van, teljes automatikus WCAG audit nincs. |
| 58 | Mobil UI újratervezés | RÉSZBEN KÉSZ | Alsó navigáció és reszponzív alap működik; az új P1 folyamatok még nincsenek validálva. |
| 59 | Teljesítmény és bundle-optimalizálás | RÉSZBEN KÉSZ | Lazy PDF/DOCX betöltés és story-cache van; a Wiki-adat chunk kb. 3,7 MB. |

### P2 kész feltétele

Strukturált nyelvi diagnosztika és lore-szótár védi a publikálást; Timeline 2.0 gráfadatot használ; Wiki Health mérhető broken/orphan/source/duplicate/language/conflict és coverage mutatókat ad.

## P3 – Universe Engine tudásrétegének teljes integrációja

| # | Feladat | Állapot | Bizonyíték / hiányzó rész |
|---:|---|---|---|
| 60 | Source → Document → Claim → Evidence → Fact domain lánc | KÉSZ | Strict modellek, lineage, evidence és Fact materializáció tesztelt. |
| 61 | Entity, alias, identity history és entity resolution | KÉSZ | Universe-izolált registry, alias, merge/split és értékelés készült. |
| 62 | Relationship, Event és Temporal Knowledge Graph | KÉSZ | Típusos, időbeli és referenciális gráfmotor tesztelt. |
| 63 | Canon, authority, retcon és conflict engine | KÉSZ | Branch, authority, retcon, taxonomy, review és quality motor van. |
| 64 | Knowledge Graph és multi-hop traversal | KÉSZ | Universe-izolált gráf, integritás, keresés és erőforráskorlát készült. |
| 65 | Wiki mint generált megjelenítési réteg | RÉSZBEN KÉSZ | `WikiEngine` page modellt ad; a jelenlegi UI továbbra is `wikiArticles` rekordot renderel. |
| 66 | Legacy Wiki → Knowledge Layer teljes adapter | RÉSZBEN KÉSZ | Non-destructive migrációs artifact megvan, a publikus runtime nincs rá átállítva. |
| 67 | GraphRAG, evidence answer és Fact Checker motor | KÉSZ | Retrieval, citation guard, explainability és ellenőrzött válasz háttérmodul elkészült. |
| 68 | AI Research/Fact Checker publikus workflow | RÉSZBEN KÉSZ | Agent- és security-alapok megvannak; teljes UI és production provider nincs. |
| 69 | Automatikusan generált Wiki-oldalak | RÉSZBEN KÉSZ | Approval-gated pipeline létezik, nincs a GitHub Pages kiadáshoz kötve. |

## P3 – Automatizálás és production

| # | Feladat | Állapot | Bizonyíték / hiányzó rész |
|---:|---|---|---|
| 70 | Event bus, background jobs, retry, DLQ és checkpoint | KÉSZ | Tranzakciós runtime és erőforrásvédelmek unit teszteltek. |
| 71 | Automatikus source import és incremental processing | RÉSZBEN KÉSZ | Pipeline-motor elkészült; a böngészős feltöltés és központi queue nincs összekötve. |
| 72 | Knowledge gap, contradiction discovery és self-audit | KÉSZ | Universe-szigetelt háttérmotor és metrikák vannak. |
| 73 | Authentication, role és permission production bekötése | RÉSZBEN KÉSZ | RBAC motor tesztelt; a statikus GitHub Pages editor nem szerveroldali admin felület. |
| 74 | Monitoring, tracing, AI-költség, quality dashboard és SLO | RÉSZBEN KÉSZ | Szerződések és in-memory motorok vannak; nincs éles telemetry backend. |
| 75 | Cache, shardolás és large-universe skálázás | RÉSZBEN KÉSZ | Algoritmikus alap van; valós nagy corpus terhelési mérés nincs. |
| 76 | Knowledge versioning, snapshot és végleges migrációs artifact | KÉSZ | 189 rekordos snapshot, fingerprint összevetés és rollback bizonyíték elkészült. |
| 77 | GitHub Pages kiadás és mobil smoke test | KÉSZ | Automatikus Pages workflow, publikus URL és E2E smoke működik. |
| 78 | Netlify kiadási lehetőség | RÉSZBEN KÉSZ | Konfiguráció/readiness dokumentált; az elsődleges oldal GitHub Pages. |
| 79 | Production-ready teljes kapu v2 | NINCS KÉSZ | A router elkészült; published storage, review/publish és publikus Knowledge Layer-integráció még hiányzik. |

## Aktuális multi-universe és könyvolvasási kiegészítés

| # | Feladat | Állapot | Bizonyíték / hiányzó rész |
|---:|---|---|---|
| 80 | Automatikus univerzumfelismerés importkor | KÉSZ | Diablo/Witcher/Warcraft/Gyűrűk Ura jelzőszótár, confidence és indoklás; ismeretlen tartalom nem szennyezi a Diablót. |
| 81 | Dinamikus univerzumválasztó és teljes tartalom-elkülönítés | KÉSZ | Az új univerzum külön választási lehetőséget, route-prefixet, cikk-, timeline-, story- és könyvteret kap. |
| 82 | Külön könyvtár és fejezetes könyvolvasó | KÉSZ | Könyvlista, stabil könyv/fejezet deep-link, előző/következő lapozás és reload működik. |
| 83 | Cikkek és könyvek közös történeti útvonala | KÉSZ | Diablo kurált kronológiája és idegen univerzumok elkülönített cikk/könyv útvonala működik. |
| 84 | Könyv történeti beszúrási pontja | KÉSZ | Importkor kiválasztható, melyik történeti cikk után következzen; a külön könyvtárban is látható. |

## Kritikus végrehajtási sorrend

```text
[KÉSZ] Router 2.0
  → [KÉSZ] deep-link + Back/Forward + 404 + scroll restoration
  → [KÉSZ] CSS-javítás és router E2E
  → LOCAL DRAFT / PUBLISHED KNOWLEDGE határ
  → draft export/import + tulajdonosi publish
  → breadcrumb + TOC + háromrészes cikkoldal
  → szemantikus, kategorizált kapcsolatok + preview
  → többmezős keresés + alias + typo tolerance
  → Story Map + stabil story/book/chapter route
  → import Review Queue + Save Draft + Publish
  → Language Quality Engine + Diablo Dictionary
  → Timeline 2.0 + Wiki Health + Article Quality
  → publikus Knowledge Layer adapter
  → automatizált, evidence-alapú Wiki
  → GraphRAG/Research UI
  → production hardening és v2 release gate
```

## Következő kiadható fejlesztési csomag

1. Helyi draft export/import és ellenőrzött visszaállítás.
2. LOCAL DRAFT / PUBLISHED KNOWLEDGE explicit lifecycle.
3. Tulajdonosi, auditált publikálás repositoryba vagy központi tárba.
4. Publikált tudás szinkronizálása más eszközökre.
5. Review/approve/rollback összekötése a böngészős editorral.

Ezt a csomagot kell lezárni a breadcrumb, TOC, teljes kereső és további AI-funkciók előtt.
