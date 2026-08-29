# Netlify feltöltési és kiadási út

## Ellenőrzött projektbeállítás

- Build parancs: `npm run build`
- Publikálandó könyvtár: `dist`
- Node futtatókörnyezet: 24
- SPA fallback: minden alkalmazásútvonal az `index.html` fájlra kerül
- PWA: manifest és service worker a build része
- Biztonság: CSP, clickjacking-, MIME-, referrer- és Permissions Policy fejlécek
- Cache: a fingerprintelt assetek egy évig immutable-ek; az HTML és service worker nem ragad be

Az ellenőrzés parancsa: `npm run build && npm run netlify:check`.

## Feltöltési lehetőségek

1. Repository-alapú folyamatos kiadás: a projektet Git szolgáltatóhoz kell kapcsolni, majd a `netlify.toml` automatikusan vezérli a buildet. Ez a production ajánlott út, mert minden kiadás visszakövethető.
2. Netlify CLI: bejelentkezés és a site összekapcsolása után preview kiadás, majd ellenőrzés után production kiadás készíthető a `dist` könyvtárból.
3. Kézi drag-and-drop: a helyben elkészített `dist` könyvtár feltölthető, de ez nem ad reprodukálható CI/CD történetet, ezért csak bemutató vagy vészhelyzeti kiadáshoz javasolt.

## Még szükséges külső adat

A tényleges online kiadáshoz Netlify-fiók és cél-site szükséges. Hozzáférési tokent nem szabad a repositoryba írni; azt a Netlify vagy a CI titokkezelőjében kell tárolni. A jelen projektben nincs backend secret, ezért a statikus kiadás biztonságosan elkészíthető.
