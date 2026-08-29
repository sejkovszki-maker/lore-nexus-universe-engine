import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const baseline = JSON.parse(await readFile('tests/regression/wiki-baseline.json', 'utf8'));
const source = `${await readFile('data.js', 'utf8')}\n;globalThis.__wiki=wikiArticles;globalThis.__timeline=timelineData;`;
const context = {};
vm.createContext(context);
vm.runInContext(source, context, { filename: 'data.js', timeout: 10_000 });

const ids = Object.keys(context.__wiki).sort();
const structuralRecords = ids.map((id) => ({
  id,
  title: context.__wiki[id].title,
  category: context.__wiki[id].category,
  relatedArticles: context.__wiki[id].relatedArticles ?? [],
}));
const actual = {
  articleCount: ids.length,
  timelineCount: context.__timeline.length,
  relationshipReferences: structuralRecords.reduce((sum, article) => sum + article.relatedArticles.length, 0),
  structuralSha256: createHash('sha256').update(JSON.stringify(structuralRecords)).digest('hex'),
};

assert.deepEqual(actual, baseline, 'Legacy wiki structure changed; update the baseline only after reviewed migration evidence.');
console.log('WIKI REGRESSION BASELINE PASSED');
