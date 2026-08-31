# Diablo kutatási hullám 001 – átadási és QA-jelentés

RUN_ID: `diablo-research-2026-08-31-wave-001`  
DATE: 2026-08-31

## 1. SOURCE HUNTER

COMPLETED: 14 elfogadott rekord: Blizzard lore- és játéklapok, hivatalos könyvbejelentések, kiadói és nemzeti bibliográfiai rekordok. Minden rekord canonical HTTPS URL-t, prioritást, hozzáférési dátumot és SHA-256 fingerprintet kapott.

FAILED: kalóz teljes szöveg és primary hivatkozás nélküli rajongói oldal bizonyítékként elutasítva.

UNRESOLVED: kézikönyvek stabil hivatalos archívuma; a teljes 184 esemény egyedi primary auditja.

NEXT_STAGE: Book & Story Hunter.

## 2. BOOK & STORY HUNTER

COMPLETED: 6 Work, 3 Edition és 1 részlegesen auditált Series. A Work és Edition azonosítók elkülönülnek. A hullám tartalmazza a Book of Cain, Book of Adria, Book of Lorath, Birthright, Moon of the Spider és When Akarat Came to Nahantu rekordját.

UNRESOLVED: a Sin War további kötetei, antológiák belső művei és fordításai következő kutatási hullámba kerültek.

NEXT_STAGE: Lore Extractor.

## 3. LORE EXTRACTOR

COMPLETED: 5 atomi, forráshoz kötött állítás: Immortal relatív helye; öt éves eltolása; Diablo IV ötven éves eltolása; Vessel of Hatred folytatása; Reckoning külön történetének hiánya.

WARNINGS: hosszú forrásszöveg nem került a repositoryba; csak saját magyar összefoglaló és metaadat.

NEXT_STAGE: Canon Auditor.

## 4. CANON AUDITOR

COMPLETED: mind az 5 állítás S1 Blizzard-forrást, indoklást és 0–1 közötti confidence értéket kapott. A rendszer nem emelt forrás nélküli állítást CANON_CONFIRMED státuszra.

CONFLICTS: ebben a szűk hullámban nincs új bizonyított kánonkonfliktus.

NEXT_STAGE: Timeline Auditor.

## 5. TIMELINE AUDITOR

COMPLETED: a 184 esemény stabil eraOrder/eventOrder sorrendje megmaradt. 59 eseményhez közvetlenül kapcsolható, regisztrált hivatalos forrás került. Immortal LoD és DIII között maradt; Reckoning nem lett korszak.

UNRESOLVED: 125 esemény részletes forrásauditot igényel. Ez dokumentált MEDIUM hiány, nem hamis bizonyosság.

NEXT_STAGE: Wiki Integrator.

## 6. WIKI INTEGRATOR

COMPLETED: új Forrástár nézet, Source/Work/Edition/Claim regiszter, timeline-forráskapcsolás és route. Meglévő lore-cikk nem lett törölve vagy tömegesen átírva.

FILES_CHANGED: `src/research/*`, `src/components/source-library.ts`, router/navigáció/app, tesztek.

NEXT_STAGE: Final QA.

## 7. FINAL QA – előzetes release gate

RELEASE_STATUS: **CONDITIONAL PASS** – nincs CRITICAL vagy HIGH hiba; csak dokumentált MEDIUM/LOW kutatási hiányok maradtak.

TECHNIKAI AUDIT: build, TypeScript, 113 unit, property, integrációs, regressziós, fuzz, biztonsági, migrációs és 11 E2E teszt sikeres. Mobilon nincs vízszintes túlcsordulás. A 14 URL-ből 12 közvetlenül HTTP 200 választ adott; két bibliográfiai/kiadói oldal automatizált hozzáférés-védelme miatt `browser-required`, de böngészős keresésben ellenőrizhető volt.

LORE/SOURCE AUDIT: minden publikált új állítás rendelkezik regisztrált provenance-szel. Nem került forrás nélküli állítás biztos kánonba.

COPYRIGHT AUDIT: teljes könyv vagy hosszú forrásszöveg nem került be; kizárólag metaadat és saját megfogalmazású rövid összefoglaló.

Kockázatok:

- MEDIUM: a bibliográfia első hulláma szándékosan nem teljes.
- MEDIUM: 125 timeline-esemény még részletes primary-source auditot igényel.
- LOW: további magyar kiadások és ISBN-ek felkutatása szükséges.

CRITICAL/HIGH: nincs ismert.

## Következő kutatási prioritások

1. Sin War 2–3. kötet kiadói rekordjai.
2. Shadows of Sanctuary és más antológiák Work-szintű bontása.
3. Hivatalos játékmanualok és archivált Blizzard lore-oldalak.
4. A 184 esemény kockázatalapú, egyenkénti forrásauditja.
