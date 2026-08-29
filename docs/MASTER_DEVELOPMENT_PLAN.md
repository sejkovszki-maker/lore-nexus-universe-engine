# Universe Engine – Master Development Plan

Ez a dokumentum az eredeti 217 technikai egységet és a Wiki UX/nyelvi minőségcsomagot egyetlen, duplikációmentes végrehajtási sorrendbe rendezi. Az aktuális készültséget a `MASTER_DEVELOPMENT_STATUS.md` tartalmazza.

## Végrehajtási elv

`védelem → architektúra → séma → forrásmodell → knowledge core → gráf → keresés → AI → Wiki → szerkesztés → automatizálás → production`

## A. Biztonságos fundamentum

1. Teljes mentés, audit, immutable raw source store, fingerprinting és source versioning.
2. Automatizált mentés, restore teszt, disaster recovery, PITR, audit log és zero-data-loss kapu.
3. Definition of Done, CI, review gate, unit/integration/E2E/regression/security/property/fuzz tesztek.
4. Dependency-, SBOM-, supply-chain- és secret-védelem.
5. Moduláris API-first architektúra, adatbázis-, plugin-, import-, export- és LLM-provider absztrakció.

## B. Adat- és tudásmag

6. Universe séma, schema registry, ontology engine/versioning, kompatibilitás és determinisztikus ID-k.
7. Migrációs és referenciális integritási rendszer.
8. Source/Document/Section/Chunk modell, lineage, validáció, sandbox, struktúrafelismerés, chunking, OCR és multimédia.
9. Entity, alias, identity history, többnyelvűség és fordítási réteg.
10. Claim, evidence, provenance, citation, uncertainty, negative knowledge, inference és csak validált Fact materializáció.
11. Relationship, Event, Temporal Knowledge Graph, timeline és historical state.
12. Canon, authority, branching, retcon, conflict taxonomy/review és knowledge quality score.
13. Entity resolution, duplicate detection, merge/split, AI-resolution és kiértékelés.

## C. Migráció, gráf és keresés

14. Legacy compatibility, dry run, non-destructive import, verification, rollback és integritástesztek.
15. Knowledge Graph, hybrid storage, graph search/integrity, multi-hop traversal és skálázási alapok.
16. Embedding registry, vector index/poisoning protection, semantic/hybrid search, ranking és meta/canon/time szűrők.
17. Strukturált, többlépcsős AI extraction, séma-validáció, confidence calibration és staging.
18. AI trust boundary, injection defense, least privilege, allowlist, approval gates, prompt/model provenance, sanitization és retrieval/hallucination kapuk.
19. Golden dataset, automatikus eval, citation completeness, confidence, red-team és fact-checker tesztek.
20. Hybrid Retrieval, GraphRAG, multi-hop evidence answers, explainability és fact checking.

## D. Wiki olvasási élmény és kereszthivatkozás

21. Central Wiki Link Engine strukturált `[[article-id|felirat]]` formátummal; nincs inline eseménykezelő.
22. Backlink index és kétirányú kapcsolati megjelenítés.
23. Szemantikus relation type-ok, automatikus kapcsolódó tartalom és kategorizált ajánlások.
24. Asztali hover- és mobil érintésbarát link preview.
25. Broken Link Detector build riporttal és publikálást blokkoló súlyossággal.
26. Orphan Article Detector és szerkesztői lista.
27. Automatikus cross-link javaslat, minden módosítás előtt emberi approve/reject.
28. Reszponzív cikkoldal, infobox registry, breadcrumbs, TOC és stabil `/wiki/slug` útvonal.
29. Olvasási pozíció visszaállítása, nem érzékeny helyi előzmények és legutóbbi cikkek.
30. Teljes szöveges kereső címre, alcímre, aliasra, kategóriára, tartalomra, infoboxra, kapcsolatra, entitásra, könyvre és eseményre.
31. Azonnali keresési javaslatok, elütéstűrés, később szemantikus rangsorolás.
32. Mobil alsó navigáció, megfelelő érintési célok, reszponzív infobox/TOC és offline PWA.
33. WCAG-fókusz, billentyűzet, szemantikus HTML, ARIA, kontraszt és reduced-motion támogatás.

## E. Magyar nyelvi minőség

34. Hungarian Language Quality Engine egységes diagnosztikai formátummal.
35. Verziózott Diablo Lore Dictionary és tulajdonnév-ellenőrzés.
36. Helyesírási, nyelvtani és terminológiai konzisztenciavizsgálat.
37. Nyelvi review queue, súlyossági szintek és indokolt javítási javaslatok.
38. Csak determinisztikus, jelentést nem módosító automatikus javítások.
39. Publikálás előtti language quality gate és mérhető Wiki Quality Score.

## F. Szerkesztés, multi-universe és automatizálás

40. Editorial Dashboard, review queue, approve/reject/modify, change history és human-in-the-loop workflow.
41. Universe Manager, teljes tenant-elkülönítés és univerzumonkénti canon/authority szabályok.
42. Universe AI Assistant, tool-based AI, research/fact-checker agent, model routing és local AI.
43. Event bus, background jobs, tranzakciók, checkpoint, retry, DLQ, circuit breaker, loop/budget/quota/rate guard.
44. Automatikus source import és incremental knowledge pipeline: `forrás → javaslat → ellenőrzés → Wiki`.
45. Knowledge-gap, kutatási ajánlás, contradiction discovery, approval-gated research loop és self-audit.

## G. Production és véglegesítés

46. Authentication, roles, permissions, monitoring, cost tracking, observability, tracing, data quality dashboard és SLO/SLA.
47. Cache, shardolás és large-universe scalability véglegesítése.
48. Knowledge versioning, snapshot, végleges Diablo migráció és teljes régi–új összehasonlítás.
49. Conflict és új-univerzum teljes teszt, production-ready gate és teljes dokumentáció.
50. Folyamatos GitHub Pages/Netlify kiadás, mobil smoke test és visszaállítható release-folyamat.

## Következő kritikus út

Az alapmotor feladatai elkészültek; a következő aktív sorozat a 21–39. pont: Central Wiki Link Engine, diagnosztika, cikkoldal/keresés/mobil akadálymentesség, majd a magyar nyelvi minőségkapu.
