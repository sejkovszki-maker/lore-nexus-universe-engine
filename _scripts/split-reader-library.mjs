import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { booksArticles } from '../src/data/articles/books.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const readerPath = resolve(root, 'public/reader-library/articles.json');
let previousReaderArticles = [];
try { previousReaderArticles = JSON.parse(await readFile(readerPath, 'utf8')).articles ?? []; } catch { /* első felosztás */ }
const sourceArticles = { ...booksArticles, ...Object.fromEntries(previousReaderArticles.map(article => [article.id, article])) };
const readerId = /^(?:sin-war-(?:birthright|scales|prophet)|demonsbane)-ch\d+$/u;
const supersededPrivateChapter = /^kingdom-of-shadow-ch\d+$/u;
const readerEntries = Object.entries(sourceArticles).filter(([id]) => readerId.test(id));
const coreEntries = Object.entries(sourceArticles).filter(([id]) => !readerId.test(id) && !supersededPrivateChapter.test(id));

if (readerEntries.length < 50 || coreEntries.length < 10) {
  throw new Error(`Váratlan felosztás: ${coreEntries.length} alapcikk, ${readerEntries.length} olvasói fejezet.`);
}

const corePath = resolve(root, 'src/data/articles/books.ts');
await mkdir(dirname(readerPath), { recursive: true });

const header = `/**
 * Diablo Lore Portal – könyvadatlapok és rövid könyves cikkek.
 * A hosszú olvasói fejezetek a public/reader-library/articles.json fájlban vannak,
 * és csak a Könyvtár vagy a Folyamatos történet megnyitásakor töltődnek be.
 * Generálás: npm run reader:split
 */

import type { WikiArticle } from '../../types';

export const booksArticles: Record<string, WikiArticle> = `;

await writeFile(corePath, `${header}${JSON.stringify(Object.fromEntries(coreEntries), null, 2)};\n`, 'utf8');
await writeFile(readerPath, `${JSON.stringify({ format: 'lore-nexus-reader-library', schemaVersion: 1, articles: readerEntries.map(([, article]) => article) })}\n`, 'utf8');
console.log(JSON.stringify({ coreArticles: coreEntries.length, lazyReaderArticles: readerEntries.length }));
