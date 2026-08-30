import type { WikiArticle, WikiArticles } from '../types.ts';

export interface ArticleUniverse { id: string; label: string }

const KNOWN = [
  { id: 'diablo', label: 'Diablo', terms: ['diablo', 'sanctuary', 'menedék', 'tyrael', 'lilith', 'inarius', 'mephisto', 'horadrim', 'tristram', 'nephalem'] },
  { id: 'witcher', label: 'The Witcher', terms: ['witcher', 'vaják', 'geralt', 'yennefer', 'ciri', 'nilfgaard'] },
  { id: 'warcraft', label: 'Warcraft', terms: ['warcraft', 'azeroth', 'arthas', 'thrall', 'stormwind', 'horde'] },
  { id: 'lord-of-the-rings', label: 'A Gyűrűk Ura', terms: ['middle-earth', 'középfölde', 'gandalf', 'frodo', 'sauron', 'mordor'] },
] as const;
const registered = new Map<string, string>([['diablo', 'Diablo']]);

export function registerUniverse(universe: ArticleUniverse): void { registered.set(universe.id, universe.label); }

function slug(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'masik-univerzum';
}

export function detectArticleUniverse(title: string, content: string, currentUniverse = 'diablo'): { universe: ArticleUniverse; confidence: number; reason: string } {
  const sample = `${title} ${content.slice(0, 20000)}`.toLocaleLowerCase('hu-HU');
  const scores = KNOWN.map(universe => ({ universe, score: universe.terms.reduce((sum, term) => sum + (sample.includes(term) ? 1 : 0), 0) })).sort((a, b) => b.score - a.score);
  if (scores[0].score >= 2 && scores[0].score > scores[1].score) return { universe: { id: scores[0].universe.id, label: scores[0].universe.label }, confidence: Math.min(.99, .6 + scores[0].score * .08), reason: `${scores[0].score} univerzumjelző kifejezés` };
  if (scores[0].score === 1 && scores[0].universe.id === currentUniverse) return { universe: { id: currentUniverse, label: KNOWN.find(item => item.id === currentUniverse)?.label ?? currentUniverse }, confidence: .55, reason: 'gyenge, de a kiválasztott univerzummal egyező jel' };
  const generated = slug(title.split(/[:–—-]/)[0]);
  return { universe: { id: generated, label: title.split(/[:–—-]/)[0].trim().slice(0, 60) || 'Másik univerzum' }, confidence: .25, reason: 'nem találtunk elegendő Diablo-jelölőt; elkülönített univerzum-javaslat' };
}

export function articleUniverseId(article: WikiArticle): string { return article.universeId || 'diablo'; }

export function availableUniverses(articles: WikiArticles): ArticleUniverse[] {
  const found = new Map(registered);
  for (const article of Object.values(articles)) {
    const id = articleUniverseId(article);
    const known = KNOWN.find(item => item.id === id);
    found.set(id, known?.label ?? String(article.universeLabel || id));
  }
  return [...found].map(([id, label]) => ({ id, label })).sort((a, b) => a.id === 'diablo' ? -1 : b.id === 'diablo' ? 1 : a.label.localeCompare(b.label, 'hu'));
}
