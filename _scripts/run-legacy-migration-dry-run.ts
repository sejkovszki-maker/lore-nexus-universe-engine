import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { LegacyCompatibilityLayer, type LegacyArticle, type LegacyBookDocument, type LegacyTimelineItem } from '../src/migration/legacy-migration.ts';
import { wikiArticles as currentWikiArticles } from '../src/data/wikiArticles.ts';
import { diabloTimelineEvents } from '../src/data/diabloChronology.ts';

const root = resolve(import.meta.dirname, '..');
const wikiArticles = currentWikiArticles as Record<string, LegacyArticle>;
const timelineData: LegacyTimelineItem[] = diabloTimelineEvents.map((event) => ({
  ...event,
  date: event.dateDisplay,
}));
const books = (await readFile(resolve(root, 'document-store/index.jsonl'), 'utf8')).trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as LegacyBookDocument);
const identities = [
  { id: 'legacy:tyrael', names: ['Tyrael'] }, { id: 'legacy:lilith', names: ['Lilith'] }, { id: 'legacy:diablo', names: ['Diablo'] },
  { id: 'legacy:inarius', names: ['Inarius'] }, { id: 'legacy:mephisto', names: ['Mephisto'] }, { id: 'legacy:baal', names: ['Baal'] },
];
const migrationId = 'diablo-legacy-dry-run-v1';
const layer = new LegacyCompatibilityLayer('uni_28d4f26505646895777a86ad5de9e2ac', identities);
const staged = await layer.stage(migrationId, wikiArticles, timelineData, books);
const report = await layer.report(migrationId, staged, { articles: Object.keys(wikiArticles).length, timelineItems: timelineData.length, books: books.length });
await mkdir(resolve(root, 'artifacts/migration'), { recursive: true });
await writeFile(resolve(root, 'artifacts/migration/diablo-legacy-dry-run-v1.json'), `${JSON.stringify({ report, records: staged }, null, 2)}\n`, { flag: 'w' });
console.log(JSON.stringify(report));
if (report.integrityErrors.length) process.exitCode = 1;
