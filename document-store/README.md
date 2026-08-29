# Document Store

A nyers Source objektumokból determinisztikusan származtatott, idempotens dokumentumtár. Minden dokumentum külön, csak olvasható `text.txt`, `sections.json` és `chunks.json` objektumot kap; az `index.jsonl` a dokumentum metaadatait, a `lineage.jsonl` a Source → Document transzformációt rögzíti.

```powershell
npm run document:ingest
npm run document:verify
```
