# Universe Engine – Mandatory Definition of Done

Egy implementációs feladat kizárólag akkor jelölhető `DONE` állapotúnak, ha az összes alkalmazható követelmény teljesül.

## Kötelező kapuk

1. A követelmény és elfogadási feltételek dokumentáltak.
2. A megoldás nem vezet be indokolatlan Diablo-specifikus modellt vagy kódutat.
3. A production build sikeres.
4. Az érintett unit, integrációs, regressziós és biztonsági tesztek sikeresek.
5. Adatmódosításnál a migráció nem destruktív, ellenőrizhető és visszaállítható.
6. Új adat vagy AI-kimenet sémaellenőrzés nélkül nem kerül production állapotba.
7. A forrás, evidence, lineage és audit követelmények alkalmazása ellenőrzött.
8. Új külső függőséghez verziórögzítés, licenc- és sérülékenységvizsgálat tartozik.
9. Titok, token vagy személyes adat nem kerül a repositoryba, logba vagy tesztfixture-be.
10. A dokumentáció, státusztábla és szükséges runbook frissült.
11. A változtatást második fél review-ja jóváhagyta, ha a repository együttműködési környezetben fut.
12. A bizonyíték megismételhető parancsból vagy automatizált teszteredményből áll.

## Tiltott rövidítések

- Kézi kipróbálás önmagában nem tesztbizonyíték.
- Sikeres fordítás önmagában nem jelenti a funkció elkészültét.
- Dokumentált terv implementáció nélkül nem `DONE`.
- LLM által generált tartalom validálás nélkül nem tény.
- Ugyanazon fizikai lemezen lévő másolat nem disaster recovery.

## Kötelező átadási rekord

Minden lezárt feladat státuszbejegyzése tartalmazza: az elkészült artefaktumot, az ellenőrzés módját, az eredményt és az ismert korlátokat.
