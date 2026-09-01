# Source Coverage Report

## Állapot

- 72 elfogadott Source rekord stabil `sourceId`, canonical URL és SHA-256 URL-fingerprint mezővel.
- Az audit után 5 idővonalesemény rendelkezik stabil `sourceId`-vel a Source Registryhez kötött S1 forrással.
- További 11 legacy esemény official URL-t tartalmaz, de stabil `sourceId` nélkül nem tekinthető teljes provenance-auditnak.
- 179 eseményhez szükséges még lezárt, registry-szintű primary audit.
- A régi wiki-cikkek saját `sources` tömbje jelenleg nincs egységesen feltöltve; a források a Source Registryben, Verified Claim rekordokban és az idővonalban élnek. Ez magas prioritású lineage-integrációs hiány, nem bizonyíték arra, hogy minden cikk forrás nélküli.

## Következő cél

Az eseményeket forráscsaládonként kell auditálni: Diablo I manual, Diablo II manual, hivatalos Blizzard történeti összefoglalók, majd játék- és könyvforrások. Összetett esemény csak akkor zárható le, ha a forrás a teljes állítást támogatja.
