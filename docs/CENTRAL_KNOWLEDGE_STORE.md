# Lore Nexus központi Knowledge Store

A böngésző helyi IndexedDB-je gyorsítótár és offline munkatér. A Work és a Wiki közös, központi rétege a hitelesített Netlify Function mögötti site-wide Blob store.

## Biztonsági modell

- Írás és teljes dokumentumolvasás: Netlify Identity `admin` szerepkör vagy szerveroldali `LORE_NEXUS_WORK_TOKEN`.
- Nyilvános olvasás: kizárólag a dokumentumok szöveg nélküli metaadat-indexe.
- A GitHub Pages kliensbe és a repositoryba nem kerül írási token.
- Egy kérés legfeljebb 4,5 MB lehet; nagy dokumentumot a következő csomagban szegmensenként kell feltölteni.
- Minden változás `ImportRun`, `ChangeSet`, dokumentum-fingerprint és központi revision azonosítót kap.

## Netlify beállítás

1. A repositoryt a `dbefee59-087d-4a25-8e17-a98b58569a88` Netlify projekthez kell kapcsolni.
2. Netlify Identity legyen bekapcsolva, invite-only regisztrációval.
3. A tulajdonosi felhasználó kapjon `admin` szerepkört.
4. A Work hozzáféréséhez a Netlify környezeti változói között és a helyi Work környezetében ugyanaz a hosszú, véletlen `LORE_NEXUS_WORK_TOKEN` legyen beállítva.
5. A Wiki központi írása a Netlify-kiadáson, bejelentkezett tulajdonosként működik. A GitHub Pages kiadás helyi/offline módban marad, hacsak `VITE_KNOWLEDGE_API_URL` nincs külön megadva.

## Work használat

`npm run knowledge:pull` letölti a központi indexet a `knowledge/central-cache` könyvtárba. Hitelesített tokennel a teljes strukturált dokumentumrekordokat is letölti. A könyvtár nincs verziókezelésben.

`npm run knowledge:push -- <changeset.json>` hitelesítve visszaküld egy ellenőrzött központi Knowledge Sync envelope-ot. A Wiki és a Work így ugyanazt a központi réteget használhatja.
