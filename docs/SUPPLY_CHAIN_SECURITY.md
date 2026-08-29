# Supply-chain Security

- A CI kizárólag `npm ci` segítségével, a committed lockfile alapján telepít.
- A közvetlen fejlesztői függőségek pontos verzióra vannak rögzítve.
- Magas vagy kritikus npm audit találat blokkolja a quality gate-et.
- Minden kiadáshoz CycloneDX JSON SBOM készül.
- CI workflow minimális `contents: read` jogosultságot kap.
- Harmadik fél GitHub Action csak teljes major taggel és dokumentált forrással használható; production hardening során commit SHA-ra kell rögzíteni.
- Install scriptet igénylő új csomag külön review nélkül nem engedélyezhető.
