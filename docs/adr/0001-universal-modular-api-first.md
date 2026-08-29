# ADR-0001: Univerzális, moduláris és API-first mag

Állapot: elfogadva – 2026-08-28.

## Döntés

A Universe Engine domain magja TypeScript szerződéseken keresztül működik, konkrét UI-, adatbázis-, LLM- és univerzumfüggőség nélkül. Minden application művelet explicit `UniverseContext` és verziózott plugin/API szerződés alapján fut.

## Következmények

- A Diablo csak egy universe dataset és szabálykészlet.
- Új tároló vagy modell adapterrel cserélhető.
- Import és export első osztályú, ellenőrizhető határ.
- A kezdeti fejlesztés több interfészt igényel, de megakadályozza a későbbi vendor- és lore-lock-int.
