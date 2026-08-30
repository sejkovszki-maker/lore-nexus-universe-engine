import '../style.css';
import { hydrateUserArticles } from './wiki/user-article-store.ts';

try {
  await hydrateUserArticles();
} catch (error) {
  console.error('A helyi wikiadatok betöltése nem sikerült.', error);
}

await import('./components/diablo-navigation');
await import('./components/diablo-app');
