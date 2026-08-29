# Secrets Management

- Valódi titok nem kerülhet forráskódba, `.env.example` fájlba, tesztfixture-be, logba vagy audit-details mezőbe.
- Helyi fejlesztéskor a titkok folyamat-környezeti változóként adhatók át; `.env` és `.env.*` Gitből kizárt.
- CI-ben kizárólag a repository titoktára használható, minimális jogosultsággal és környezetenként elkülönítve.
- Productionben a szolgáltató secret managerét kell használni, rotációval és hozzáférési audittal.
- A `npm run security:secrets` minden változtatásnál kötelező kapu.
- Naplózás előtt minden credential-, authorization- és tokenmezőt maszkolni kell.
