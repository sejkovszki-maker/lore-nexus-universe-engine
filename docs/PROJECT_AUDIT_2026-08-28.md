# Diablo Lore Portal – kezdeti projektaudit

Audit dátuma: 2026-08-28

Állapot: lezárva. Ez a dokumentum a Raw Source Store bevezetése előtti műszaki alapállapotot rögzíti.

## Vezetői összefoglaló

A projekt hibrid állapotban van: a gyökérkönyvtár Vanilla JavaScript alkalmazása az aktív rendszer, a `src/` alatt pedig egy befejezetlen Vite/TypeScript/Lit modernizáció található. A lore jelentős része egy 3,68 MB-os futtatható JavaScript adatfájlban él. A nyers források külön fájlokban rendelkezésre állnak, de még nincs immutable source store, verziózás vagy bizonyított helyreállítási folyamat.

## Bizonyított alapállapot

- A projektkönyvtár az audit kezdetén nem Git repository.
- A `node_modules` nélkül vizsgált állomány 109 fájl és körülbelül 15,1 MB.
- A `raw_books/` könyvtár hat forrásfájlt tartalmaz, köztük TXT, PDF és OPF formátumokat.
- A jelenlegi `data.js` validátor 168 wiki rekordot talál.
- Az ID-, alapszerkezet- és kapcsolati ellenőrzés a jelenlegi validátor szerint sikeres.
- A production build az audit kezdetén sikertelen.

## Kritikus megállapítások

### A-001 – Nincs verziókezelési és visszaállítási alap

Súlyosság: kritikus.

A könyvtár nem Git repository, és nem található bizonyított, teljes projekt-visszaállítási folyamat. A meglévő `_scripts/restore.ps1` kizárólag a `data.js` egy konkrét injektált szakaszát próbálja eltávolítani, abszolút gépspecifikus elérési úttal; ez nem projektmentés és nem általános restore.

### A-002 – A modern build nem reprodukálható

Súlyosság: magas.

Az `npm run build` hibával leáll. A TypeScript konfiguráció SolidJS JSX runtime-ot vár, miközben a `solid-js` nincs deklarálva; az `src/App.tsx` több nem létező, eltérő névkonvenciójú komponenst importál; továbbá `src/components/lore-network.ts` implicit `any` hibát tartalmaz.

### A-003 – Az encoding ellenőrzés téves pozitív eredményeket ad

Súlyosság: közepes.

A `_scripts/validate-data.js` az érvényes magyar `í` karaktert hibás kódolási mintának tekinti. Emiatt 168 rekordból 160-ra figyelmeztet, ami elfedi a valódi kódolási hibákat és használhatatlanná teszi ezt a jelzést minőségi kapuként.

### A-004 – A tudásadat futtatható kódba van ágyazva

Súlyosság: magas.

A teljes lore jelentős része a `data.js` globális JavaScript objektumaiban található. Ez összekeveri az adatot és a futtatható kódot, nehezíti a sémaellenőrzést, a forráskövetést, a verziózást és a biztonságos migrációt.

### A-005 – Két párhuzamos alkalmazásarchitektúra él egymás mellett

Súlyosság: magas.

A gyökérben lévő aktív Vanilla alkalmazás és a `src/` alatti Lit/TypeScript rendszer között nincs dokumentált átállási kapu vagy egyetlen hiteles belépési pont. Emiatt nem egyértelmű, hogy egy változtatást melyik rétegben kell végrehajtani és tesztelni.

### A-006 – Nincs automatizált teszt- vagy CI-kapu

Súlyosság: magas.

A kezdeti `package.json` kizárólag fejlesztési szervert, buildet és preview szervert definiált. Nem volt unit, integrációs vagy end-to-end teszt, és nem található CI-konfiguráció.

### A-007 – Külső futásidejű CDN-függőségek

Súlyosság: közepes.

Az `index.html` Google Fonts, Cloudflare Font Awesome és jsDelivr `idb` erőforrásokat tölt be. Az alkalmazás működése és reprodukálhatósága részben külső szolgáltatások elérhetőségétől függ; az `idb` scripthez nincs Subresource Integrity érték.

## Architektúra- és adatleltár

- Hiteles böngészős belépési pont: `index.html` → `src/main.ts` → Lit webkomponensek.
- Elhagyott vagy félbemaradt alternatív út: `src/main.tsx`, `src/App.tsx`, `src/App.jsx` → nem deklarált SolidJS és nem létező PascalCase komponensek.
- Tartós kliensadat: IndexedDB, Dexie, OPFS és több legacy `localStorage` kulcs.
- Elsődleges lore-adat: `data.js`, továbbá egy külön, nagy `src/data/wikiArticles.ts` másolat/variáns.
- Nyers forrás: `raw_books/`, összesen 6 fájl és 4 715 514 bájt.
- Titokminták első statikus keresése nem talált beégetett API-kulcsot, jelszót vagy tokent.
- A telepített direkt függőségek feloldhatók; több Vite csomag opcionális függősége hiányzik, de nem ezek okozzák a bizonyított buildhibát.

## Első intézkedések

1. Teljes, SHA-256 manifesttel ellátott projektarchívum létrehozása.
2. Az archívum kibontása és minden fájl hash-alapú ellenőrzése.
3. A nyers források külön leltára és fingerprintje.
4. A build és az adatvalidátor hibáinak külön javítási munkacsomagba rendezése.
5. Az aktív és a modernizált alkalmazás határának Architecture Decision Recordban való rögzítése.

## Auditkorlátok és későbbi kapuk

Az audit nem tekinti elvégzettnek a későbbi, önálló backlogpontokat: böngészős E2E teszt, teljes dependency vulnerability audit, SBOM, adatduplikáció-elemzés és katasztrófa-helyreállítás. Ezek saját minőségi kapuval készülnek el a Master Development Order megfelelő szakaszában.
