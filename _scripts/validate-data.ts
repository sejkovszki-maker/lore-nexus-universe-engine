import { wikiArticles } from '../src/data/wikiArticles.ts';

const ids = Object.keys(wikiArticles);
const errors: string[] = [];
const warnings: string[] = [];

console.log(`Wiki-rekordok: ${ids.length}`);

for (const [id, article] of Object.entries(wikiArticles)) {
  if (!article || typeof article !== 'object') {
    errors.push(`${id}: a rekord nem objektum`);
    continue;
  }
  if (article.id !== id) errors.push(`${id}: az article.id eltér a kulcstól (${article.id ?? 'hiányzik'})`);
  if (typeof article.title !== 'string' || !article.title.trim()) errors.push(`${id}: hiányzó cím`);
  if (typeof article.category !== 'string' || !article.category.trim()) warnings.push(`${id}: hiányzó kategória`);
  if (typeof article.content !== 'string' || !article.content.trim()) warnings.push(`${id}: hiányzó tartalom`);
  if (article.relatedArticles !== undefined && !Array.isArray(article.relatedArticles)) {
    errors.push(`${id}: a relatedArticles nem tömb`);
  }
}

for (const [id, article] of Object.entries(wikiArticles)) {
  if (!Array.isArray(article.relatedArticles)) continue;
  for (const relatedId of article.relatedArticles) {
    if (!wikiArticles[relatedId]) errors.push(`${id} → hiányzó kapcsolat: ${relatedId}`);
  }
}

if (warnings.length) console.warn(`Figyelmeztetések: ${warnings.length}\n${warnings.slice(0, 30).join('\n')}`);
if (errors.length) {
  console.error(`Validációs hibák: ${errors.length}\n${errors.join('\n')}`);
  process.exit(1);
}

console.log('WIKI DATA VALIDATION PASSED');
