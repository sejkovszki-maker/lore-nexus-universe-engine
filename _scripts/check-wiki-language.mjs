import { readFile } from 'node:fs/promises';

const file = new URL('../src/data/wikiArticles.ts', import.meta.url);
const text = await readFile(file, 'utf8');
const rules = [
  ['mojibake', /(?:�|Ã|Â|â€|Ä|Ĺ|đź|í[\u0080-\u009f])/gu],
  ['control-character', /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/gu],
  ['inline-handler', /\bon(?:click|mouseover|mouseout)\s*=/giu],
  ['legacy-wiki-call', /openWikiArticle\s*\(/gu],
  ['replacement-marker', /\?\?\s+(?:ez|az|volt|lett|van)\b/giu],
];

const diagnostics = rules.flatMap(([code, pattern]) => [...text.matchAll(pattern)].map(match => ({
  code,
  offset: match.index,
  sample: text.slice(Math.max(0, (match.index || 0) - 30), (match.index || 0) + 50).replace(/\s+/g, ' '),
})));

if (diagnostics.length) {
  console.error(JSON.stringify({ status: 'failed', diagnostics: diagnostics.slice(0, 50), total: diagnostics.length }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ status: 'passed', file: 'src/data/wikiArticles.ts', rules: rules.map(([code]) => code) }));
