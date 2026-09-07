import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { wikiArticles } from '../src/data/wikiArticles.ts';
import { diabloTimelineEvents } from '../src/data/diabloChronology.ts';

const baseline = JSON.parse(await readFile('tests/regression/wiki-baseline.json', 'utf8'));
const ids = Object.keys(wikiArticles).sort();
const structuralRecords = ids.map((id) => ({
  id,
  title: wikiArticles[id].title,
  category: wikiArticles[id].category,
  relatedArticles: wikiArticles[id].relatedArticles ?? [],
}));
const actual = {
  articleCount: ids.length,
  timelineCount: diabloTimelineEvents.length,
  relationshipReferences: structuralRecords.reduce((sum, article) => sum + article.relatedArticles.length, 0),
  structuralSha256: createHash('sha256').update(JSON.stringify(structuralRecords)).digest('hex'),
};

assert.deepEqual(actual, baseline, 'Wiki structure changed; update the baseline only after reviewed migration evidence.');
console.log('WIKI REGRESSION BASELINE PASSED');
