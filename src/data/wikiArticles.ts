/**
 * Diablo Lore Portal – Cikk-adatbázis index
 * Moduláris index – a cikkeket a src/data/articles/<modul>.ts
 * fájlokban kell szerkeszteni.
 * Az aktív rekordok száma automatikusan az egyes modulok tartalmából adódik.
 */

import { booksArticles } from './articles/books.ts';
import { loreCoreArticles } from './articles/lore-core.ts';
import { eventsArticles } from './articles/events.ts';
import { charactersArticles } from './articles/characters.ts';
import { locationsArticles } from './articles/locations.ts';
import { gamesArticles } from './articles/games.ts';
import { miscArticles } from './articles/misc.ts';
import { witcherArticles } from './articles/witcher.ts';
import { lostHoradrimArticles } from './articles/lost-horadrim.ts';

const allWikiArticles: Record<string, any> = {
  ...booksArticles,
  ...loreCoreArticles,
  ...eventsArticles,
  ...charactersArticles,
  ...locationsArticles,
  ...gamesArticles,
  ...miscArticles,
  ...witcherArticles,
  ...lostHoradrimArticles
};

// Védelmi szűrő: egy későbbi hibás import se tehessen közzé teljes könyvfejezeteket.
export const wikiArticles: Record<string, any> = Object.fromEntries(
  Object.entries(allWikiArticles).filter(([id]) => !/^(?:black-road-ch\d+|book-gonosz-osvenye-ch\d+|black-road-epilogue)$/.test(id)),
);
