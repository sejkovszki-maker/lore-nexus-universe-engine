import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { LegacyCompatibilityLayer, type LegacyBookDocument } from '../src/migration/legacy-migration.ts';

const root = resolve(import.meta.dirname, '..');
const legacySource = `${await readFile(resolve(root, 'data.js'), 'utf8')}\n;globalThis.__wiki=wikiArticles;globalThis.__timeline=timelineData;`;
const legacyContext: Record<string, unknown> = {}; vm.createContext(legacyContext); vm.runInContext(legacySource, legacyContext, { filename: 'data.js', timeout: 10_000 });
const wikiArticles = legacyContext.__wiki as Record<string, import('../src/migration/legacy-migration.ts').LegacyArticle>;
const timelineData = legacyContext.__timeline as import('../src/migration/legacy-migration.ts').LegacyTimelineItem[];
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
