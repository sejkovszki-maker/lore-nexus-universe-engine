# Kutatási hullám 010 – snapshot és primary timeline audit

RUN_ID: `DIABLO-WAVE-010-2026-09-01`

- UNIVERSE: `diablo`
- SOURCES_DISCOVERED: 4
- SOURCES_ACCEPTED: 2
- SOURCES_REJECTED: 0
- SOURCES_QUEUED: 2
- WORKS_DISCOVERED: 0
- FACTS_EXTRACTED: 5
- FACTS_VERIFIED: 5
- ENTITIES_CREATED: 0
- ENTITIES_UPDATED: 0
- RELATIONS_CREATED: 5 Verified Claim
- EVENTS_CREATED: 0
- EVENTS_UPDATED: 5
- ARTICLES_CREATED: 0
- ARTICLES_UPDATED: 0
- CANON_CONFLICTS: 0
- RETCONS: 0
- TIMELINE_CHANGES: 5 esemény primary Blizzard-forrásauditja, sorrendváltoztatás nélkül
- REVIEW_REQUIRED: 6 fennmaradó kánon- és bibliográfiai tétel
- FAILED_ITEMS: 0
- QUALITY_BEFORE: 70 Source, 30 Verified Claim, 0 teljes Source Registry-kapcsolattal primary-auditált esemény
- QUALITY_AFTER: 72 Source, 35 Verified Claim, 5 teljes Source Registry-kapcsolattal primary-auditált esemény
- QUALITY_DELTA: +2 Source, +5 provenance-os Claim, +5 eseményszintű audit; 0 timeline-átrendezés

## Elfogadott források

- Blizzard: Tyrael Hero Spotlight (S1)
- Blizzard: Malthael Enters the Nexus! (S1)

Mindkét forrás saját magyar összefoglalás és atomikus tények alapja; teljes szerzői jogvédett szöveg nem került a repositoryba.

## Queue

- A Diablo I és Diablo II hivatalos manualok pontos oldal- és fejezetlokátorainak feldolgozása.
- Az Anu–Tathamet kozmogónia Book of Cain/Book of Tyrael lokátora.

## Következő kutatási célok

1. Diablo I manual: Dark Exile, Horadrim, Soulstone és Tristram eseménycsomag.
2. Diablo II manual: Sanctuary térkép, a Három érkezése és a Worldstone utáni fő történeti pontok.
3. A legacy cikkek Claim/Source kapcsolati rétegének kialakítása.

Állapot: `CURRENT COVERAGE IN PROGRESS`. Az internet teljességére vonatkozó állítás nem történt.

## Kritikus utóellenőrzés

A korábbi timeline-auditor általános forrásoldalakat teljes eseménytartományokra örökített. Ez 62 eseményt mutatott auditáltnak, miközben csak 5 esemény rendelkezett teljes, stabil Source Registry-kapcsolattal. Az automatikus tartományöröklés eltávolításra került; a checkpoint és a backlog a konzervatív, bizonyítható 5/184 értéket használja. További 11 legacy esemény official URL-jét külön lineage-feladatként kell registry-rekordhoz kötni.
