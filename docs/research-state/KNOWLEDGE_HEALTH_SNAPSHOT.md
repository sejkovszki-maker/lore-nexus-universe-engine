# Diablo Knowledge Health Snapshot

Run ID: `DIABLO-WAVE-010-2026-09-01`

| Terület | Aktuális állapot | Minősítés |
|---|---:|---|
| Publikus enciklopédiai cikk | 177 | részben örökölt |
| Idővonalesemény | 184 / 20 korszak | teljes szerkezeti lefedés |
| Teljes Source Registry-kapcsolattal primary-auditált esemény | 5 | 2,7% |
| További registry-szintű primary auditot igénylő esemény | 179 | magas prioritás |
| Elfogadott Source | 72 | registry-valid |
| Creative Work | 79 | registry-valid |
| Edition | 33 | registry-valid |
| Ellenőrzött atomikus Claim | 35 | mind provenance-szal |
| Registry-integritási hiba | 0 | PASS |
| Törött timeline→cikk kapcsolat | 0 | PASS |
| Nyitott, pontosan nem elhelyezett mű/történet | 8 | review szükséges |

## Minőségi értelmezés

- Source Coverage: `IN PROGRESS`. A forrástár erős bibliográfiai alap, de az eseményszintű S0/S1 lefedés még nem teljes.
- Citation Completeness: az új Verified Claim rétegben teljes; az örökölt cikkekben nincs még egységes inline Claim/Source kapcsolat.
- Timeline Coverage: szerkezetileg 184/184; teljes `sourceId` kapcsolattal lezárt elsődleges forrásaudit szerint 5/184. További 11 legacy esemény official URL-t tartalmaz, de registry-kapcsolata még hiányos, ezért nem számít lezártnak.
- Canon Confidence: az új claim-eknél explicit; a legacy cikkek egy részénél még implicit.
- CreativeWork Coverage: 79 Work és 33 Edition, ismert gyűjtemény/kiadás eltérések review queue-ban.
- Graph Connectivity: a timeline minden eseménye létező cikkre mutat; az örökölt article→entity/fact/evidence normalizáció még hiányos.

Release decision: `CONDITIONAL_PASS`. Nincs ismert kritikus vagy magas súlyosságú regresszió, de a tudáslefedettség befejezetlen.
