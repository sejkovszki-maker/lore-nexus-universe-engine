import '../style.css';
import { hydrateUserArticles } from './wiki/user-article-store.ts';
import { hydratePrivateLibrary } from './wiki/private-library-loader.ts';

try {
  await hydratePrivateLibrary();
} catch (error) {
  console.error('A privát könyvtár betöltése nem sikerült.', error);
}

try {
  await hydrateUserArticles();
} catch (error) {
  console.error('A helyi wikiadatok betöltése nem sikerült.', error);
}

await import('./components/diablo-navigation');
await import('./components/diablo-app');
