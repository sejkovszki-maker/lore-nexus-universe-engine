# Universe Engine – üzemeltetési és fejlesztői kézikönyv

## Állapot

A Master Development Order 1–217. pontjának helyben megvalósítható része elkészült. A rendszer a régi Diablo portált változatlanul megőrzi, miközben a forrásokat, dokumentumokat és az új tudásréteget verziózott, visszaellenőrizhető folyamatba helyezi.

Az egyetlen külső aktiválási pont a repository-host branch protection/code-review szabálya. A szükséges CI, CODEOWNERS és pull request sablon elkészült, de a szabályt a majdani GitHub/GitLab/egyéb repository adminisztrációjában kell bekapcsolni.

## Adatbiztonsági modell

1. A nyers forrás byte-jai content-addressed, felül nem írható Raw Source Store-ba kerülnek.
2. A Document Store csak ellenőrzött Raw Source objektumból épül, teljes lineage-dzsel.
3. AI-kimenet kizárólag staging és szerkesztői review után válhat elfogadott tudássá.
4. A végleges Diablo migráció nem törli a régi adatot. A 189 rekord külön committed artifactban van.
5. A helyi mentés SHA-256-tal ellenőrzött és külön fizikai D: lemezre replikált.

## Fő adatfolyam

```text
RAW SOURCE → DOCUMENT → CHUNK → AI EXTRACTION (staged)
     → ENTITY RESOLUTION → HUMAN REVIEW → CLAIM/EVIDENCE/FACT
     → KNOWLEDGE GRAPH + VECTOR INDEX → GRAPHRAG → VERIFIED ANSWER
     → DYNAMIC WIKI
```

## Kötelező ellenőrzések

- Teljes kapu: `npm run quality`
- Production build: `npm run build`
- AI golden evaluation: `npm run ai:evaluate`
- Raw Store: `npm run raw:verify`
- Document Store: `npm run document:verify`
- Migráció: `npm run migration:verify`
- Production readiness: `npm run production:verify`
- Netlify csomag: `npm run netlify:check`
- Mentés: `npm run backup`
- Zero-data-loss: `npm run gate:zero-data-loss`

## Fő artifactok

- `artifacts/migration/diablo-legacy-dry-run-v1.json`: dry-run, 189 staging rekord.
- `artifacts/migration/diablo-final-v1.json`: committed végleges migráció és universe snapshot.
- `artifacts/ai-evaluation/baseline.json`: golden AI minőségi mérőszámok.
- `artifacts/sbom.cdx.json`: CycloneDX komponensleltár.
- `audit/events.jsonl`: tamper-evident műveleti lánc.

## Migrációs eredmény

- 168 régi wiki-cikk
- 15 timeline esemény
- 6 könyvdokumentum
- 189 committed rekord
- 0 hiányzó legacy rekord
- 0 megváltozott payload-fingerprint
- 1 nem destruktív duplikáció-jelölt: azonos című OPF/TXT könyv; mindkét rekord megmaradt szerkesztői döntésre

## AI és agent biztonság

- Universe- és clearance-alapú retrieval authorization
- Prompt injection detektálás és untrusted context izoláció
- Agent/tool allowlist és least privilege
- Write/destructive művelethez lejáró, egyszer használható approval
- Modell-, prompt-, input-, paraméter- és output provenance
- Költség-, quota-, rate-, step- és loop guard
- Evidence, citation és fact-check nélkül nincs verified válasz

## Több univerzum

Minden univerzum külön namespace-t, locale-listát, canon branch szabályt és source authority policy-t kap. A Witcher tesztuniverzum igazolja, hogy azonos local ID-k nem ütköznek a Diablo azonosítóival, és a hozzáférés nem lépheti át az univerzumhatárt.

## Monitoring és SLO

Az observability port egységes metric és distributed trace adatot fogad. Production környezetben ezt OpenTelemetry-kompatibilis adapterhez kell kötni. Az SLO-k gte/lte célt, mérési ablakot és error budgetet tartalmaznak. Az AI-költség universe/provider/model bontásban mérhető.

## Netlify

A `netlify.toml` a `dist` könyvtárat publikálja, SPA fallbacket, PWA-kompatibilis cache szabályokat és biztonsági fejléceket ad. A teljes kiadási út a `NETLIFY_DEPLOYMENT.md` fájlban található. Online publikálás előtt Netlify site-ot kell választani és a hozzáférést a szolgáltatás titokkezelőjében kell megadni.

## Visszaállítás

A végleges migráció artifact-alapú és a legacy adat érintetlen, ezért a visszaállítás az új committed artifact kikapcsolásával azonnali. Teljes rendszerhelyreállításhoz a backup/PITR scriptek kiválasztják és hash-ellenőrzés után elkülönített célba állítják vissza a kívánt recovery pointot.
