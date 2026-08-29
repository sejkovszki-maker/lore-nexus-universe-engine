# Diablo Lore Portal - Projekt Architektúra és Struktúra

Ez a dokumentum a Diablo Lore Portal jelenlegi felépítését, adatfolyamát és működését írja le. Ezt a fájlt (vagy annak tartalmát) bármikor bemásolhatod a ChatGPT-nek (vagy bármelyik másik AI-nak), hogy pontosan értse a projektet, és könnyen tudjon segíteni a módosításokban.

---

## 1. Jelenlegi Architektúra (Hibrid Állapot)

A projekt jelenleg egy **átmeneti fázisban** van egy klasszikus "Vanilla JavaScript" (tiszta JS) alkalmazás és egy modern, komponens-alapú (Lit, Vite, Tailwind) architektúra között.

*   **Éles/Aktív rendszer:** Az alkalmazás jelenleg a főkönyvtárban lévő hagyományos fájlokat használja (`index.html`, `app.js`, `data.js`, `style.css`).
*   **Fejlesztés alatti/Modernizált rendszer:** A `src/` mappában található egy Vite alapú, TypeScript-et és Lit webkomponenseket használó struktúra, ami az alkalmazás jövőbeli verzióját készíti elő.

---

## 2. Kulcsfontosságú Fájlok és Szerepük

### A Gyökérkönyvtár (Aktív Fájlok)
*   **`index.html`**: Az alkalmazás belépési pontja. Betölti a stíluslapot, az IndexedDB könyvtárat, a DOM struktúrát (Navigáció, Kereső, Nézetek), majd a szkripteket. Nem használ ES6 modulokat a belépéshez, hanem hagyományos `<script>` tageket.
*   **`data.js`**: A projekt "Adatbázisa" (közel 3.7 MB). Ez tartalmazza a teljes Diablo lore-t, formázott HTML/Markdown szövegekkel, `wikiArticles` és `timelineData` JavaScript objektumokban tárolva.
*   **`app.js`**: A központi vezérlő logika (közel 100 KB). Felelős a következőkért:
    *   DOM manipuláció és eseménykezelők (gombnyomások, keresés).
    *   Hash-alapú routing (pl. `#tab/timeline` vagy `#article/tyrael`).
    *   Az IndexedDB kezelése (`idb` könyvtár) a cikkek olvasottságának mentéséhez.
    *   Egyedi Markdown/HTML formázó motor, ami a lore szavakat (pl. Worldstone) automatikusan linkesíti.
*   **`style.css`**: A Vanilla CSS fájl, ami az aktuális "gótikus" dizájnt adja.
*   **`config.js` / `extra.js`**: Kiegészítő konfigurációk és másodlagos logikák.

### A `src/` Mappa (Modernizáció)
*   **`package.json` & `vite.config.ts`**: A modern build rendszer (Vite) és a függőségek (Lit, Tailwind, Sigma.js, DOMPurify) konfigurációja.
*   **`src/components/`**: Lit Webkomponensek (`.ts`), amik a jövőben az `app.js` monolitikus kódját hivatottak kiváltani (pl. `diablo-app.ts`, `wiki-article-grid.ts`).
*   **`src/store/` & `src/db/`**: Tervezett új állapotkezelés és OPFS (Origin Private File System) / IndexedDB adatbázis logika.

---

## 3. Hogyan Kérdezd a ChatGPT-t? (Prompt Sablonok)

Ha módosítani szeretnél a kódon az én (Antigravity) segítségem nélkül, másold be a ChatGPT-nek az alábbi promptok valamelyikét attól függően, mit szeretnél csinálni.

### Sablon 1: Új funkció vagy UI módosítás (Vanilla JS)
Másold be ezt, ha az `app.js`-t, `style.css`-t vagy `index.html`-t akarod módosítani:

> **Prompt:**
> "Egy Diablo Lore Portal nevű webes enciklopédiát fejlesztek. A projekt jelenleg tiszta Vanilla JavaScriptet, HTML-t és CSS-t használ a főkönyvtárban. A DOM manipuláció, a hash-alapú routing (pl. \`#article/nev\`) és az IndexedDB-s adattárolás az \`app.js\`-ben van. Az adatok (cikkek) a \`data.js\`-ben vannak egy globális \`wikiArticles\` objektumban. A dizájn a \`style.css\`-ben található. A belépési pont az \`index.html\`.
> 
> **A feladatom a következő:** [Írd ide, mit szeretnél, pl. 'Szeretnék egy új gombot a navigációba, ami megnyit egy modalt', vagy 'Szeretném megváltoztatni a kereső működését, hogy alcímekben is keressen'].
> 
> Kérlek, írd meg az ehhez szükséges módosításokat a megfelelő fájlokhoz (HTML, JS, CSS)!"

### Sablon 2: Új cikk hozzáadása vagy adatmódosítás
Másold be ezt, ha a `data.js`-be akarsz új tartalmat betenni:

> **Prompt:**
> "Egy Diablo Lore Portal nevű projekt \`data.js\` fájljába szeretnék egy új cikket hozzáadni. A fájl egy globális \`wikiArticles\` objektumot tartalmaz. Az objektum kulcsai az ID-k (pl. \`sanctuary-relics\`), az értékek pedig így néznek ki:
> { id: '...', category: '...', title: '...', subtitle: '...', infobox: { ... }, content: '\<html és markdown tartalom>' }
> 
> **Kérlek, hozz létre egy új, jól formázott objektumot a következő témáról:** [Írd ide a témát, pl. 'A Horadric Cube története']. 
> Az alcímeket \`<h2>\` vagy \`<h3>\` tagekkel jelöld, a fontos kifejezéseket tedd vastaggá \`<strong>\` vagy \`**\` segítségével. A szöveg legyen magyar nyelvű és illeszkedjen a Diablo lore-ba."

### Sablon 3: Modernizáció (Lit, Vite, TypeScript) folytatása
Másold be ezt, ha a `src/` mappában lévő új architektúrán akarsz dolgozni:

> **Prompt:**
> "Egy meglévő Vanilla JS projektet migráltam egy Vite + Lit Web Components + TypeScript alapú architektúrába. A fájlok a \`src/\` mappában vannak. A komponensek \`lit\`-et használnak (pl. \`@customElement\`).
> 
> **A feladatom a következő:** [Írd ide, mit szeretnél, pl. 'Készíts egy új Lit komponenst a src/components mappába, ami megjelenít egy egyedi karakter profil kártyát, és fogad egy name és egy role property-t'].
> 
> Kérlek, írd meg a TypeScript kódot a Lit komponenshez, tartva a modern ES6+ és Lit standardokat."

---

## 4. Legfontosabb Technikai Részletek a ChatGPT számára
*Ha a ChatGPT elakadna, ezt a blokkot is bemásolhatod neki kontextusként:*

*   **Automatikusan linkelő motor:** Az `app.js` tartalmaz egy `linkifyLoreTerms` és egy `formatMarkdownContent` függvényt, ami a `data.js`-ből jövő szövegben megkeresi a kulcsszavakat (pl. "Worldstone", "Tyrael"), és automatikusan kattintható `#article/...` linkekké alakítja őket. A biztonság érdekében a projekt használja a DOMPurify-t!
*   **IndexedDB olvasáskövető:** Az `idb` könyvtárat használja a projekt. A megnyitott cikkek ID-jét a helyi adatbázis menti el, így a rendszer tud ajánlani "következő olvasmányt" a felhasználónak a kronológiai sorrend (GLOBAL_CATEGORY_ORDER) alapján.
*   **Hálózat/Vis.js:** A "Hálózat" fül (Lore Map) interaktív vizualizációját vis.js (vagy az új rendszerben sigma.js) kezeli.
*   **Stílus:** A UI "sötét, gótikus" (Dark Gothic) témájú, arany/sötétvörös (#0a0809, accent-gold) színeket, és Cinzel / Outfit Google betűtípusokat használ.
