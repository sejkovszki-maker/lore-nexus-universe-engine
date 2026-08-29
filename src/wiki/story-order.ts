import { wikiArticles } from '../data/wikiArticles.ts';
import type { WikiArticle } from '../types.ts';

// Curated canonical reading path. Reference pages and full novel transcriptions
// stay searchable, but do not interrupt the main historical narrative.
export const canonicalStoryIds = [
  'kozmogonia',
  'sanctuary-origin',
  'prime-lesser-evils',
  'sin-war-lore',
  'lore-uldyssian',
  'lore-mendeln',
  'lore-tragoul',
  'mage-clan-wars',
  'dark-exile',
  'horadrim-order',
  'akarat-nahantu',
  'diablo-1-story',
  'diablo-1-hellfire',
  'diablo-2-story',
  'diablo-2-lod',
  'diablo-immortal',
  'diablo-3-story',
  'diablo-3-ros',
  'diablo-4-story',
  'diablo-4-voh',
  'neyrelle-tribute',
  'skovos',
  'diablo-4-loh',
] as const;

export function canonicalStory(): WikiArticle[] {
  return canonicalStoryIds.map(id => wikiArticles[id]).filter((article): article is WikiArticle => Boolean(article));
}
