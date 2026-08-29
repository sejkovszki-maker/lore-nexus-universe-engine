# Universe Engine – Disaster Recovery Runbook

## Célértékek

- RPO: legfeljebb 24 óra adatvesztési ablak.
- RTO: legfeljebb 4 óra a helyreállítás megkezdésétől az ellenőrzött projektállapotig.
- Legalább két független példány szükséges; azonos fizikai lemez nem számít függetlennek.

## Normál működés

1. A napi ütemezett feladat elkészíti és helyben ellenőrzi az archívumot.
2. A legfrissebb archívumot és SHA-256 fájlját az offsite replikáció független célra másolja.
3. A céloldali példány hashének egyeznie kell a helyi példánnyal.
4. Legalább 30 naponta teljes restore-próbát kell futtatni az offsite példányból.

## Célhely konfigurálása

Az `UNIVERSE_ENGINE_OFFSITE_BACKUP` környezeti változó egy fizikailag elkülönített meghajtóra vagy szinkronizált, verziózott felhőkönyvtárra mutasson. A replikáció futtatása:

```powershell
npm run backup:offsite
```

## Helyreállítás

1. Válaszd ki a legfrissebb olyan archívumot, amelynek SHA-256 fájlja is rendelkezésre áll.
2. Ellenőrizd az archívumot a `verify-project-backup.ps1` segítségével.
3. Futtasd a teljes `test-backup-restore.ps1` próbát.
4. Csak sikeres hash-, fájlszám- és Raw Source Store ellenőrzés után másold a helyreállított projektet az új munkakönyvtárba.
5. Dokumentáld az eseményt, a választott recovery pointot és az ellenőrzések eredményét.

## Nyitott kapu

A Disaster Recovery feladat csak akkor `DONE`, ha egy valóban független célhely konfigurálva van, oda sikeres replikáció történt, és onnan teljes restore-próba készült.
