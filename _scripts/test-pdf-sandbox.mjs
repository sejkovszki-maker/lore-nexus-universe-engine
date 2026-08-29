import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { processPdfInSandbox } from './pdf-sandbox-processor.mjs';
const bytes = await readFile('raw_books/document_compress.pdf');
const result = await processPdfInSandbox(bytes, { maxPages: 3 });
assert.equal(result.metadata.pageCount, 430); assert.equal(result.pages.length, 3);
assert.ok(result.pages.reduce((sum, page) => sum + page.text.length, 0) > 3000);
console.log('PDF SANDBOX PROCESSING PASSED');
