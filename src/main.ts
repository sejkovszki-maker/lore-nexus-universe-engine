import '../style.css';
import { hydrateUserArticles } from './wiki/user-article-store.ts';

if (/^#\/(?:u\/[^/]+\/)?(?:book\/|story(?:\/|$))/u.test(window.location.hash)) {
  try {
    const { ensurePrivateLibrary } = await import('./wiki/private-library-loader.ts');
    await ensurePrivateLibrary();
  } catch (error) {
    console.error('A közvetlen könyvhivatkozáshoz szükséges helyi könyvtár nem tölthető be.', error);
  }
}

try {
  await hydrateUserArticles();
} catch (error) {
  console.error('A helyi wikiadatok betöltése nem sikerült.', error);
}

await import('./components/diablo-navigation');
await import('./components/diablo-app');
