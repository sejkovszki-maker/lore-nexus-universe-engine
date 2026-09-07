/**
 * Diablo Lore Portal – Cikk-adatbázis index
 * Moduláris index – a cikkeket a src/data/articles/<modul>.ts
 * fájlokban kell szerkeszteni.
 * Összes cikk: 205
 */

import { booksArticles } from './articles/books.ts';
import { loreCoreArticles } from './articles/lore-core.ts';
import { eventsArticles } from './articles/events.ts';
import { charactersArticles } from './articles/characters.ts';
import { locationsArticles } from './articles/locations.ts';
import { gamesArticles } from './articles/games.ts';
import { miscArticles } from './articles/misc.ts';

export const wikiArticles: Record<string, any> = {
  ...booksArticles,
  ...loreCoreArticles,
  ...eventsArticles,
  ...charactersArticles,
  ...locationsArticles,
  ...gamesArticles,
  ...miscArticles
};
