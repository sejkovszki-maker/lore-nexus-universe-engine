# Universe Engine – Master Development Status

Ez a fájl a hivatalos, 217 implementációs egységre bontott „200 pontos” Master Development Order végrehajtási állapotát követi.

## Állapotjelölések

- `TODO`: még nem kezdődött el
- `IN PROGRESS`: folyamatban van
- `BLOCKED`: dokumentált akadály miatt nem folytatható
- `DONE`: elkészült és ellenőrzött

## 0. szakasz – Biztonság, mentés, audit

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 1 | Jelenlegi projekt teljes mentése | DONE | `backups/diablo-project-20260828-*.zip`, külön SHA-256 fájl, beágyazott fájlmanifest és sikeres teljes hash-ellenőrzés. |
| 2 | Jelenlegi projekt teljes auditja | DONE | Lezárt alapállapot, architektúra- és adatleltár, 7 dokumentált kockázat: `docs/PROJECT_AUDIT_2026-08-28.md`. |
| 3 | Immutable Raw Source Store | DONE | 6 forrás / 4 715 514 bájt importálva; content-addressed, overwrite-ot tiltó objektumtár, append-only index, idempotens import, integritás- és rongálásérzékelő teszt. |
| 4 | Content Fingerprinting | DONE | Minden forrás stabil SHA-256 `sourceId`, objektumútvonal és visszaellenőrzött fingerprint alapján azonosított. |
| 5 | Source Versioning | DONE | Stabil logikai forrásazonosító, monoton verzió, előző verzióra mutató lánc; változtatási és idempotencia-teszttel igazolva. |
| 6 | Automated Backups | DONE | Ellenőrzött napi runner, 7 napi mentéses megőrzési policy; `UniverseEngine-DailyBackup` aktív, következő futás: 2026-08-29 03:00. |
| 7 | Backup Restore Tests | DONE | 126 fájl elkülönített ideiglenes helyreállítása, fájlonkénti hash és helyreállított Raw Store ellenőrzése sikeres. |
| 8 | Disaster Recovery | DONE | C: és D: külön fizikai NVMe; SHA-256-tal ellenőrzött replikáció és 126 fájlos teljes restore-próba a D: célról sikeres. |
| 9 | Point-in-Time Recovery | DONE | UTC manifest-időpont szerinti recovery-point választás; hash-ellenőrzött teljes PITR és Raw Store-validáció sikeres. |
| 10 | Audit Log | DONE | Strukturált append-only JSONL napló; a biztonsági alapműveletek 4 kezdeti eseménye rögzítve és ellenőrizve. |
| 11 | Tamper-evident Audit | DONE | Sorrend- és SHA-256 hash-lánc; módosított történeti eseményt elutasító automatikus teszt sikeres. |
| 12 | Zero Data Loss Gate | DONE | Egyesített kapu sikeres: 6 raw objektum, 4 eseményes auditlánc, 126 fájlos helyi/offsite mentésegyezés, külön fizikai lemezek és aktív napi ütemezés. |

## 1. szakasz – Fejlesztési szabályok és minőségi kapuk

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 13 | Mandatory Definition of Done | DONE | Kötelező 12 pontos DoD, tiltott rövidítések és átadási rekord: `docs/DEFINITION_OF_DONE.md`. |
| 14 | CI Pipeline | DONE | Windows/Node 24 GitHub Actions workflow, lockfile-alapú `npm ci`, teljes quality gate és SBOM artifact. |
| 15 | Mandatory Code Review Gate | IN PROGRESS | CODEOWNERS, PR-sablon és PR-alapú CI elkészült; tényleges branch protection repository-host nélkül még nem érvényesíthető. |
| 16 | Unit Test Coverage | DONE | Node unit suite; `appState.ts` 94,69% sor-, 81,82% ág- és 94,12% függvénylefedettség, 80%-os blokkoló minimum. |
| 17 | Integration Test Suite | DONE | Raw Source Store és tamper-evident audit teljes fájlrendszeri integrációs tesztek. |
| 18 | End-to-End Test Suite | DONE | Playwright + telepített Chrome: indulás, három nézetváltás és közvetlen hash routing, 2/2 sikeres. |
| 19 | Regression Testing | DONE | 168 cikk, 15 timeline elem és strukturális SHA-256 baseline blokkolja a nem review-zott adateltérést. |
| 20 | Security Regression Suite | DONE | Audit-manipuláció, raw objektumrongálás, secret scan és dependency audit egységes quality kapuban. |
| 21 | Property-based Testing | DONE | fast-check: 1000 generált eset Unicode keresésre és reader oldalszám invariánsra. |
| 22 | Fuzz Testing | DONE | 128 determinisztikus auditlog-mutációból 128 elutasítva. |
| 23 | Dependency Security | DONE | Vite/PWA sérülékeny ág frissítve; `npm audit` eredménye 0. |
| 24 | Software Bill of Materials | DONE | CycloneDX 1.6 JSON SBOM, 523 komponens; CI artifactként publikálva. |
| 25 | Supply-chain Security | DONE | Lockfile-os CI, minimális workflow jogosultság, pontos biztonsági tool verziók és dokumentált install-script policy. |
| 26 | Secrets Management | DONE | `.env` kizárás, környezeti változó policy és automatizált credential mintakereső sikeres. |

## 2. szakasz – Univerzális architektúra

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 27 | Technology Architecture | DONE | Rétegek, határok, adapterelv és átmeneti állapot: `docs/ARCHITECTURE.md`, ADR-0001. |
| 28 | Universe Engine Architecture | DONE | Explicit `UniverseContext`, univerzumfüggetlen domain/application/port szerződések. |
| 29 | Modular Architecture | DONE | Core contracts külön modulokban; UI, storage, LLM és plugin határok szétválasztva. |
| 30 | API First Architecture | DONE | Verziózható Command, Query, Result és Page szerződések. |
| 31 | Database Abstraction Layer | DONE | Tranzakció-, repository-, health-check- és migrációs `DatabaseAdapter` port. |
| 32 | Plugin Architecture | DONE | API-verziózott lifecycle registry, capability lookup és duplikációvédelem; 2 unit teszt. |
| 33 | LLM Provider Abstraction | DONE | Providerfüggetlen üzenet-, schema-, capability-, usage- és health szerződés. |
| 34 | Import Plugin API | DONE | Media-type felismerés, immutable byte payload, UniverseContext és validált receipt. |
| 35 | Export API | DONE | JSON/JSON-LD/Markdown/CSV export, evidence/provenance kapcsolók és artifact fingerprint. |

## 3. szakasz – Séma, ontológia és azonosítók

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 36 | Universe adatmodell | DONE | Univerzumfüggetlen TS modell és strict Draft 2020-12 JSON Schema, locale/status/metadata korlátokkal. |
| 37 | Schema Registry | DONE | Ajv 2020 strict registry, név+verzió címzés, duplikációvédelem, strukturált hibalista. |
| 38 | Ontology Engine | DONE | Entity/relationship/event/claim típusok, property- és parent-integritás. |
| 39 | Ontology Versioning | DONE | Monoton verzió, previous-version lánc és immutable clone-alapú registry. |
| 40 | Backward Compatibility Tests | DONE | Típuseltávolítást és required-property inkompatibilitást blokkoló kompatibilitási tesztek. |
| 41 | Deterministic Entity ID System | DONE | Unicode-normalizált, universe/type/identity alapú SHA-256 ID; ekvivalencia és universe isolation teszt. |
| 42 | Referential Integrity Engine | DONE | Kötelező/opcionális dangling reference és tiltott self-reference strukturált detektálása. |
| 43 | Database Migration System | DONE | Gap-ellenőrzött forward/rollback plan és per-verzió állapotot tartósító executor, oda-vissza teszttel. |

## 4. szakasz – Forrás- és dokumentummodell

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 44 | Source adatmodell | DONE | Strict v1 Source schema: universe, logikai/verzióazonosító, SHA-256, immutable objektumút és metadata. |
| 45 | Document adatmodell | DONE | Document/Section/Chunk TS modellek és strict v1 Document schema, processor provenance mezőkkel. |
| 46 | Complete Data Lineage | DONE | Source→Document lineage 6/6 forráshoz; bejárható lineage graph és visszaellenőrzött edge-integritás. |
| 47 | Universal Document Ingestion | DONE | Idempotens pipeline TXT/PDF/OPF mintákon: 6 dokumentum, második futás 0 import/6 skip. |
| 48 | File Validation | DONE | Magic-byte, MIME, méret, üres fájl, fájlnév és fatal UTF-8 ellenőrzés. |
| 49 | Sandboxed Document Processing | DONE | Permission-limited Node worker; izolált Python PDF subprocess, timeout/output limit és temp cleanup; valós tesztek. |
| 50 | Document Structure Detection | DONE | Markdown, magyar/angol chapter és római számos heading detektálás; 92 szekció a valós corpusban. |
| 51 | Chunking Engine | DONE | Determinisztikus, átfedéses, mondat/bekezdés határos chunking; 1129 fingerprintelt chunk ellenőrizve. |
| 52 | OCR Pipeline | DONE | Native-text threshold + RapidOCR fallback; valós PDF oldalon 16 sor, 0,944 átlagbizalom. |
| 53 | Multimedia Sources | DONE | Image/audio/video MIME támogatás, PNG dimenzió és WAV csatorna/sample-rate/duration metadata tesztekkel. |

## 5. szakasz – Knowledge Core

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 54 | ENTITY rendszer | DONE | Strict Entity schema és universe/type/status/localized-property domain modell. |
| 55 | Alias Engine | DONE | Unicode-normalizált, locale- és universe-szigetelt alias feloldás, cross-universe védelemmel. |
| 56 | Entity Identity History | DONE | Created/rename/merge/split/retype/deprecate eseménymodell, referencia- és duplikációellenőrzéssel. |
| 57 | Multilingual Universe Engine | DONE | Locale-first label és explicit fallback lánc, universe-szigetelt translation registry. |
| 58 | Translation-aware Knowledge | DONE | Concept-azonosítóhoz kötött machine/reviewed/canonical fordítás, source locale/text és evidence mezőkkel. |
| 59 | Semantic Translation Layer | DONE | A nyelvi szöveg helyett stabil conceptId azonosítja a szemantikai fogalmat; fallback teszttel. |
| 60 | FACT rendszer | DONE | Fact kizárólag accepted claimből, támogató evidence-szel és validator provenance-szel materializálható. |
| 61 | Claim Model | DONE | Subject/predicate/typed object, polarity, modality, temporal scope, uncertainty, evidence és lifecycle. |
| 62 | Negative Knowledge | DONE | Explicit negative polarity; az ambiguous `negative + unknown` állapot blokkolva és tesztelve. |
| 63 | Uncertainty Model | DONE | Confidence + alsó/felső korlát + basis + reasons; [0,1] és interval invariánsok. |
| 64 | Inference Tracking | DONE | Premise claim lánc, verziózott rule, conclusion, confidence method és validation status. |
| 65 | Evidence Store | DONE | Precíz locator, idézet SHA-256, stance/strength/reliability, hiányzó evidence blokkolás. |
| 66 | Provenance | DONE | Human/system/AI actor, input/output, software/model/prompt verzió, paraméterhash és futási státusz. |
| 67 | Citation Engine | DONE | Evidence-ből pontos page/section/offset/timestamp citation és completeness ellenőrzés. |

## 6. szakasz – Kapcsolatok és események

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 68 | RELATIONSHIP rendszer | DONE | Direction, typed endpoints, temporal validity, attributes, claim/evidence és lifecycle; strict v1 schema. |
| 69 | EVENT rendszer | DONE | Többnyelvű név, bizonytalan idő, helyszínek, role+certainty résztvevők, parent event és evidence; strict schema. |
| 70 | Referential relation validation | DONE | Hiányzó entity, cross-universe referencia, tiltott self-edge, participant/location és parent event validáció. |
| 71 | Temporal Knowledge Graph | DONE | Universe-szigetelt entity/relationship/event/fact gráf, uncertainty-aware interval lekérdezéssel. |
| 72 | Timeline Engine | DONE | Bizonytalan tartománnyal átfedő range query és determinisztikus kronológiai rendezés. |
| 73 | Időbeli bizonytalanság kezelése | DONE | asserted/earliest/latest, precision, confidence, calendar és szöveges forrás; interval invariánsok. |
| 74 | Historical State | DONE | Időpillanat szerinti definite/possible relationship és fact snapshot, valamint addig biztosan lezajlott eventek. |

## 7. szakasz – Kánon és lore-kezelés

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 75 | Canon Engine | DONE | Claim registration, canonical/contested/non-canonical/deprecated assignment és universe izoláció. |
| 76 | Source Authority Model | DONE | Branch-, source-kind-, priority- és időfüggő primary/secondary/licensed/community authority scoring. |
| 77 | Canon Branching | DONE | Parent-child öröklés, child override, cross-universe védelem és main/alternate izolációs teszt. |
| 78 | Retcon Engine | DONE | Superseded claim deprecáció, replacement canonical assignment, evidence/reason/decision lineage. |
| 79 | Conflict Detection | DONE | Azonos subject/predicate párok objektum-, polaritás-, temporal-, authority-, uncertainty- és branch-elemzése. |
| 80 | Contradiction Taxonomy | DONE | 9 típusos taxonomy és low/medium/high/critical determinisztikus severity. |
| 81 | Konfliktuskezelő felület | DONE | Új, navigációból elérhető kánonkonfliktus dashboard reviewer/reason és négy resolution action támogatással. |
| 82 | Knowledge Quality Score | DONE | 100 pontos evidence/reliability/citation/authority/confidence/review score, conflict penalty és production blockers. |

## 8. szakasz – Entity Resolution

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 83 | Entity Resolution Engine | DONE | Univerzum- és típuskorlátozott, Unicode-normalizált, determinisztikus jelöltpontozás exact alias/name, locale, típus és context alapján. |
| 84 | Existing Entity Detection | DONE | 0,85-ös elfogadási küszöb és 0,08-as ambiguity gap; exact alias felismerés és cross-universe kizárás tesztelve. |
| 85 | Duplicate Detection | DONE | Damerau–Levenshtein névhasonlóság, alias-átfedés és típus/universe szűrés; elgépeléses duplikáció teszttel. |
| 86 | Entity Merge System | DONE | Nem destruktív merge: forrásentitások `merged` állapotban megmaradnak, redirect és lekérdezhető identity history keletkezik. |
| 87 | Entity Split System | DONE | Az eredeti identitás `split` állapotban megőrződik, legalább két új identitás és teljes split lineage jön létre. |
| 88 | AI Entity Resolution | DONE | Providerfüggetlen, strukturált és csak staging állapotú AI-javaslat; ismeretlen jelöltazonosító és közvetlen production írás tiltva. |
| 89 | Entity Resolution evaluation | DONE | Precision, recall, F1, top-1 accuracy, false-merge rate és ambiguity rate metrikák; determinisztikus golden esetben 1,0 precision/recall/F1/top-1. |

## 9. szakasz – Jelenlegi Diablo-adatok próbamigrációja

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 90 | Legacy Compatibility Layer | DONE | Univerzumfüggetlen adapter őrzi az eredeti azonosítót, teljes payloadot, típust és SHA-256 ujjlenyomatot. |
| 91 | Migration Dry Run | DONE | Ismételhető `migration:dry-run`; kizárólag `staged` rekordok és fingerprintelt JSON bizonyíték készül. |
| 92 | Jelenlegi cikkek importálása | DONE | Az autoritatív `data.js` mind a 168 cikke stagingbe került; regressziós baseline-nal egyező darabszám. |
| 93 | Jelenlegi könyvek importálása | DONE | Mind a 6 feldolgozott dokumentum stagingbe került, immutable Source/Document azonosítóval. |
| 94 | Meglévő entitások felismerése | DONE | Normalizált cím/név illesztés 24 staging rekordhoz rendelt meglévő entitásjelöltet. |
| 95 | Duplikációk keresése | DONE | Legacy ID-, fingerprint- és normalizált címvizsgálat; 1 valódi könyvcím-duplikáció-jelölt riportálva, automatikus merge nélkül. |
| 96 | Non-destructive Migration | DONE | Elkülönített staging és snapshot-alapú commit; a régi `data.js`, Raw Store és Document Store érintetlen. |
| 97 | Migration Verification | DONE | `migration:verify`: 168 cikk + 15 timeline + 6 könyv = 189 egyedi staging rekord, érvényes fingerprinttel. |
| 98 | Migration Rollback | DONE | Commit előtti pontos snapshot-visszaállítás automatikus teszttel igazolva. |
| 99 | Adatintegritás-teszt | DONE | Darabszám-, universe-, egyedi ID-, SHA-256-, státusz- és regressziós baseline ellenőrzés; 0 integritási hiba. |
| 100 | Duplikációs teszt | DONE | Normalizált címütközés automatikus tesztben és a valós corpuson is detektálva. |

## 10. szakasz – Knowledge Graph

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 101 | Knowledge Graph | DONE | Univerzum-szigetelt, típusos node/edge tár entity/fact/claim/event/document/chunk/source támogatással. |
| 102 | Hybrid Data Architecture | DONE | A gráf teljes payload másolása helyett kötelező `storageRef` hivatkozással kapcsolja a strukturált adat- és dokumentumtárat. |
| 103 | Graph Search | DONE | Unicode-token index, kind index, universe filter, szomszéd- és él-típus lekérdezés. |
| 104 | Graph Integrity Checks | DONE | Dangling endpoint, cross-universe, self-edge, hibás súly és duplikáció blokkolása; a batch művelet atomi. |
| 105 | Multi-hop graph traversal | DONE | Ciklusbiztos BFS, 1–12 hop, él-típus szűrés és konfigurálható visited erőforráskorlát. |
| 106 | Large Universe Scalability alapjai | DONE | Indexelt lookup, legfeljebb 500-as cursor pagination; 1200 node-os többoldalas teszt sikeres. |

## 11. szakasz – Vector és szemantikus réteg

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 107 | Semantic Search | DONE | Koszinusz-hasonlóság alapú, universe-izolált szemantikus keresés stabil top-k rendezéssel. |
| 108 | Embedding Version Registry | DONE | Provider/model/dimenzió/normalizálás/modell-fingerprint immutable registry és explicit deprecáció. |
| 109 | Vector Index | DONE | Verziózott vector record, content fingerprint, storageRef és metadata alapú index. |
| 110 | Vector Poisoning Protection | DONE | Dimenzió-, finite-, komponens-, nullvektor-, provenance- és konfliktáló embedding ellenőrzés. |
| 111 | Hybrid Search Engine | DONE | Szemantikus, lexikai és gráfjelek súlyozott, universe-izolált összefésülése. |
| 112 | Search Ranking | DONE | Validált, 1-re összegző súlyok, normalizált semantic score és determinisztikus tie-break. |
| 113 | Metadata Filtering | DONE | Kind, locale és tetszőleges egzakt metadata szűrés a rangsorolás előtt. |
| 114 | Canon Filter | DONE | canonical/contested/non-canonical/deprecated többértékű szűrés. |
| 115 | Temporal Filter | DONE | validFrom/validTo intervallum szerinti időpillanat-szűrés nyitott határokkal. |

## 12. szakasz – AI strukturált feldolgozás

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 116 | Structured AI Extraction | DONE | Providerfüggetlen response schema, provenance és kizárólag `staged` kimenet. |
| 117 | AI Schema Validation | DONE | Strict root, kötelező mezők, típusok, confidence, chunk evidence és lokális referencia ellenőrzés. |
| 118 | Multi-pass AI Extraction | DONE | Három determinisztikus passz: entity, relationship/event, majd reconcile. |
| 119 | Entity Extraction | DONE | Típusos lokális ID, név, alias, confidence és pontos chunk-idézet. |
| 120 | Relationship Extraction | DONE | Típusos endpointok csak az adott futás validált entity localId-jaira mutathatnak. |
| 121 | Event Extraction | DONE | Név, típus, résztvevők, opcionális időszöveg, confidence és evidence. |
| 122 | AI Confidence Calibration | DONE | Mintaszámos, nem átfedő kalibrációs bin registry és tartományellenőrzés. |
| 123 | Confidence rendszer | DONE | Modell-, evidence- és passz-agreement jel súlyozott, reprodukálható kombinációja. |

## 13. szakasz – AI biztonsági határ

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 124 | AI Trust Boundary Architecture | DONE | Untrusted retrieval tartalom explicit XML-szerű határolással különül el a vezérlő prompttól. |
| 125 | Prompt Injection Defense Layer | DONE | Instruction override, role forgery, secret exfiltration, tool coercion és delimiter escape detektor. |
| 126 | Least Privilege Agent System | DONE | Agentenként universe-, clearance- és tool-capability minimum jogosultság. |
| 127 | Tool Allowlist | DONE | Nem regisztrált vagy agenthez nem rendelt tool futtatása blokkolt. |
| 128 | AI Action Approval Gates | DONE | Write/destructive művelethez inputhoz kötött, lejáró, egyszer használható emberi approval szükséges. |
| 129 | Prompt Registry | DONE | Validált azonosítójú, változólistás immutable prompttár. |
| 130 | Prompt Versioning | DONE | Folytonos, monoton verziózás és exact-version render. |
| 131 | Model Version Provenance | DONE | Provider, modell és modellverzió minden AI-run provenance része. |
| 132 | Reproducible AI Runs | DONE | Input-, paraméter- és output SHA-256 fingerprint prompt- és modellverzióval. |
| 133 | Output Sanitization | DONE | Vezérlőkarakter, script blokk és `javascript:` séma eltávolítás. |
| 134 | Retrieval Authorization | DONE | Universe és public/internal/restricted clearance kötelező szűrése. |
| 135 | Retrieval Quality Gate | DONE | Minimum quality, citation completeness és injection-mentesség a contextbe engedés feltétele. |
| 136 | Hallucination Guard | DONE | Minden állításnak engedélyezett evidence ID és [0,1] confidence kell; strukturált hibalista. |

## 14. szakasz – AI értékelés

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 137 | Golden Dataset | DONE | Verziózott magyar Diablo kérdés/evidence/expected-term fixture Tyrael és Lilith esettel. |
| 138 | Automated AI Evaluation | DONE | `ai:evaluate` reprodukálható artifactot készít és minőségi küszöbnél blokkol. |
| 139 | AI Quality Metrics | DONE | Term recall, citation completeness/precision, grounded claim rate, Brier score és pass rate. |
| 140 | Citation Completeness Test | DONE | Golden baseline 1,0 completeness és 1,0 citation precision. |
| 141 | Answer Confidence | DONE | Állításonkénti confidence és támogatottsághoz mért Brier score: 0,01. |
| 142 | AI Red Team Test Suite | DONE | Öt injection támadásos corpus mindegyike detektálva. |
| 143 | Fact Checker Agent alaptesztje | DONE | Evidence-term átfedéses baseline checker supported/unsupported verdicttel. |

## 15. szakasz – RAG és GraphRAG

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 144 | Hybrid Retrieval | DONE | Szemantikus/lexikai/gráf hit lista egységes evidence storageRef betöltéssel. |
| 145 | GraphRAG Engine | DONE | Retrieval rootokból gráfkontextust és evidence csomagot építő orchestrator. |
| 146 | Multi-hop Retrieval | DONE | Legfeljebb 5 root, konfigurálható hop, 2000 visited és 100 path felső korlát. |
| 147 | Evidence-based Answers | DONE | Válaszon belüli állítások csak betöltött, universe-azonos evidence ID-ra hivatkozhatnak. |
| 148 | Explainability Layer | DONE | Retrieval score/signals, graph path, source/locator/quality és minden ellenőrzési verdict visszaadva. |
| 149 | Fact Checker Agent | DONE | Citation guard + evidence-term checker; hibás válasz `rejected`, confidence legfeljebb 0,49. |

## 16. szakasz – Wiki Engine

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 150 | Dinamikus Wiki-oldalak | DONE | Repository-portokból universe-izolált entity/fact/evidence/relation/event oldalmodell. |
| 151 | Források megjelenítése | DONE | Egyedi evidence lista source title, pontos locator, quote és reliability szerint rendezve. |
| 152 | Kapcsolatok megjelenítése | DONE | Irányfüggetlen counterpart feloldás, cross-universe rekordok kizárásával. |
| 153 | Timeline nézet | DONE | Bizonytalan earliest alapján determinisztikusan rendezett kapcsolódó események. |
| 154 | Relationship Graph nézet | DONE | Entity és szomszéd node/edge view model interaktív renderer számára. |
| 155 | Univerzális kereső | DONE | Universe, locale, limit és determinisztikus score rendezés. |
| 156 | Intelligens keresés | DONE | Search provider szerződés szemantikus/hibrid magyarázó jelekhez. |

## 17. szakasz – Universe Explorer

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 157 | Interactive Universe Map | DONE | Normalizált koordináta, parent edge, entity/event kapcsolat és universe-szigetelt map view model. |
| 158 | Character Explorer | DONE | Fact-, relation-, event- és story-összekapcsolt karaktermodell. |
| 159 | Story Explorer | DONE | Időrend és canon branch szerint szűrhető story arc rendszer. |
| 160 | Map Understanding | DONE | Vision+structured-output adapter, koordinátás label és allowlistes entity-javaslat, kizárólag stagingben. |
| 161 | Image Understanding | DONE | Azonos validált vizuális pipeline általános képekre, ismeretlen entity ID tiltással. |

## 18. szakasz – Szerkesztői rendszer

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 162 | Editorial Dashboard | DONE | Universe-onként total/pending/in-review/approved/rejected/AI/high-priority mérőszámok. |
| 163 | Review Queue | DONE | Priority+creation rendezés, status/assignee szűrés és 500-as lekérdezési korlát. |
| 164 | Approve / Reject / Modify | DONE | Claim, payload-módosítás és indoklással kötelező terminális döntés. |
| 165 | Change History | DONE | Append-only submitted/claimed/modified/approved/rejected history actorral és verzióátmenettel. |
| 166 | Human-in-the-loop workflow | DONE | AI-origin item csak emberi tulajdonba vétel után dönthető el; optimistic concurrency védi. |

## 19. szakasz – Több univerzum

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 167 | Universe Manager | DONE | Validált create/get/list, egyedi slug/namespace és lifecycle státusz. |
| 168 | Univerzumok teljes elkülönítése | DONE | Namespace-alapú scoped ID és explicit cross-universe hozzáférés-blokkolás. |
| 169 | Új univerzum teszt | DONE | Witcher tesztuniverzum létrehozva a Diablo mellett, azonos localId ütközés nélkül. |
| 170 | Canon szabályok univerzumonként | DONE | Külön default branch, alternate-branch és evidence-required policy. |
| 171 | Source Authority szabályok univerzumonként | DONE | Univerzumonként eltérő source kind/tier/priority lista; Diablo game és Witcher novel primary teszt. |

## 20. szakasz – AI-asszisztens és agentek

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 172 | Universe AI Assistant | DONE | Universe-szigetelt GraphRAG válaszadapter, csak verified kimenet átadásával. |
| 173 | Tool-based AI | DONE | LeastPrivilegeToolRunneren keresztüli allowlistes tool használat. |
| 174 | Research Agent | DONE | Kizárólag hozzárendelt universe-ben és read toolon futó kutatási agent. |
| 175 | Fact Checker Agent véglegesítése | DONE | GraphRAG terminális citation+grounding gate-be kötve; unsupported válasz automatikusan rejected. |
| 176 | Model Routing | DONE | Capability, privacy, quality, költség és context limit szerinti determinisztikus modellválasztás. |
| 177 | Local AI Support | DONE | Loopback-only Ollama-kompatibilis provider health/generate és token usage támogatással. |

## 21. szakasz – Event-driven automatizálás

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 178 | Event Bus | DONE | Típusos domain event, correlation/causation és async exact/wildcard subscriber. |
| 179 | Background Jobs | DONE | Universe-, attempt-, availableAt- és correlation-aware queue. |
| 180 | Transactional Processing | DONE | Clone-on-write tranzakció: hiba esetén az eredeti állapot változatlan. |
| 181 | Pipeline Checkpointing | DONE | Pipeline ID szerinti monoton step+data checkpoint. |
| 182 | Retry Policy | DONE | Exponenciális backoff és maxAttempts. |
| 183 | Dead Letter Queue | DONE | Elfogyott próbálkozás után job+hiba elkülönített DLQ-ba kerül. |
| 184 | Circuit Breaker | DONE | Failure threshold, open state és reset utáni half-open próba. |
| 185 | Agent Loop Detection | DONE | Ismételt signature és abszolút step limit. |
| 186 | AI Budget Guard | DONE | Scope-onként atomi költségelszámolás és hard limit. |
| 187 | Resource Quotas | DONE | Egész units consume/release és maximum blokk. |
| 188 | Rate Limiting | DONE | Kulcsonkénti sliding-window limiter determinisztikus időteszttel. |

## 22. szakasz – Automatikus tudásfeldolgozás

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 189 | Automatikus Source Import | DONE | Immutable source fingerprintből automatikus ingest és source.ingested event. |
| 190 | Autonomous Knowledge Pipeline | DONE | ingest→extract→review→approved wiki update checkpointelt orchestrator. |
| 191 | Automatikus Wiki-frissítés | DONE | Csak review-ban jóváhagyott, ismert proposal ID-k frissíthetnek oldalt. |
| 192 | Import Report | DONE | Minden futás státusz-, dokumentum-, proposal-, review-, page- és checkpoint listát ad. |
| 193 | Incremental Processing | DONE | Változatlan source fingerprint újrafeldolgozása kihagyva; approval esetén checkpointból folytatódik. |

## 23. szakasz – Tudásintelligencia

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 194 | Automatic Knowledge Gap Detection | DONE | Entity-típus required fact/relation, evidence/citation és quality hiánydetektor. |
| 195 | Research Recommendation | DONE | Gapből prioritásos query és preferált source kind, kötelező human approval flaggel. |
| 196 | Contradiction Discovery | DONE | Azonos subject/predicate eltérő object vagy polarity összevetés, confidence-alapú severity. |
| 197 | Autonomous Research Loop | DONE | Self-audit gapekből 1–100 közé korlátozott, approval-gated ajánlási ciklus. |
| 198 | Universe Self-Audit | DONE | Universe-szigetelt entity/claim/gap/conflict/average-quality egészségjelentés. |

## 24. szakasz – Production hardening

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 199 | Authentication | DONE | Trusted issuer/audience/signature verifier, expiry, future-issued és nonce replay védelem. |
| 200 | Role System | DONE | Immutable permission-listás szerepkör és principal assignment. |
| 201 | Permission System | DONE | Session-expiry, role permission és universe scope együttes RBAC kapu. |
| 202 | System Monitoring | DONE | Validált labeles metric pontok és lekérdezhető idősor. |
| 203 | AI Cost Tracking | DONE | Universe/provider/model szerinti input/output tokenár elszámolás. |
| 204 | Observability Standardization | DONE | Egységes metric/span szerződés, attribútum és státuszvalidáció. |
| 205 | Distributed Tracing | DONE | traceId/spanId/parentSpanId hierarchia és rendezett trace lekérdezés. |
| 206 | Data Quality Dashboard | DONE | Universe rekordszám, átlagminőség, citation completeness és konfliktusszám. |
| 207 | SLO/SLA Targets | DONE | gte/lte target, window, teljesülés és fennmaradó error-budget számítás. |
| 208 | Caching Layer | DONE | Verziózott, namespace-izolált, TTL-es LRU és namespace invalidálás. |
| 209 | Large Universe Scalability véglegesítése | DONE | Stabil universe+record FNV shard routing, korábbi cursor/index/resource-limit alapokra építve. |

## 25. szakasz – Knowledge Versioning és végleges migráció

| # | Feladat | Állapot | Bizonyíték / megjegyzés |
|---:|---|---|---|
| 210 | Knowledge Versioning | DONE | Universe-onként monoton commit, parent chain, schema map és SHA-256 commit fingerprint. |
| 211 | Universe Snapshot | DONE | Rendezett ID/fingerprint/storageRef rekordlista, commit-hivatkozás és snapshot fingerprint. |
| 212 | Végleges Diablo migráció | DONE | 189 rekord committed artifactba került; a legacy rendszer változatlan és visszaállítható maradt. |
| 213 | Teljes régi–új összehasonlítás | DONE | 168 cikk + 15 timeline + 6 könyv; 0 hiány és 0 megváltozott payload-fingerprint. |
| 214 | Conflict Test | DONE | 1 könyvcím-duplikáció megőrizve `preserved-for-editorial-review` állapotban; destruktív automerge nincs. |
| 215 | Új univerzum teljes teszt | DONE | Witcher létrehozás, policy, scope és azonos localId izoláció sikeres. |
| 216 | Production-ready Universe Engine | DONE | `production:verify`: 189 rekord, 0 adatvesztés, build/PWA/AI-eval/Netlify artifact ellenőrzött. |
| 217 | Teljes dokumentáció | DONE | Architektúra, DoD, audit, security, secrets, migráció, Netlify és teljes üzemeltetési kézikönyv. |

## Minőségi kapu

Egy feladat csak akkor kaphat `DONE` állapotot, ha a megvalósítás, az automatizált ellenőrzés és a visszaállítási vagy hibakezelési út is dokumentált.
