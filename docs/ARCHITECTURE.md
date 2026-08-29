# Universe Engine Architecture

## Irányelvek

Az engine univerzumfüggetlen magból és adapterekből áll. A mag nem importálhat Diablo-adatot, böngészős tárolót, konkrét LLM SDK-t vagy konkrét adatbázis-klienst. Ezek kizárólag portokon és pluginokon keresztül kapcsolódhatnak.

## Rétegek

1. **Domain core** – Universe, Source, Document, Entity, Claim, Evidence, Fact, Relationship és Event szabályok.
2. **Application** – command/query use case-ek, tranzakcióhatárok és approval workflow.
3. **Ports** – adatbázis, keresés, import/export, LLM és event bus szerződések.
4. **Adapters** – Dexie/OPFS, későbbi SQL/graph/vector, dokumentumformátumok és LLM szolgáltatók.
5. **Delivery** – API és Wiki UI.

## Kötelező határok

- Minden kérés `UniverseContext`-et hordoz; implicit globális univerzum tilos.
- Domain-azonosító nem származhat megjelenítési névből.
- Plugin inicializálása előtt API-verzió és egyedi ID ellenőrzés történik.
- LLM-válasz nem domain objektum; validáció és staging nélkül nem írható adatbázisba.
- Export alapértelmezetten provenance- és evidence-megőrző.
- Tárolócsere nem változtathatja meg a domain use case-eket.

## Jelenlegi átmeneti állapot

A Lit frontend a delivery adapter. A legacy `data.js` migrációs forrás, nem a jövőbeli domain modell. A Dexie/OPFS kód adapterként kerül megtartásra, és a `DatabaseAdapter` port mögé kerül a tárolási szakaszban.
