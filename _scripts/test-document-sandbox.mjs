import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { processInSandbox } from './sandbox-document-processor.mjs';
const text = await readFile('raw_books/Demon tanfolyam.txt'); const result = await processInSandbox(text, 'text/plain');
assert.equal(result.metadata.sandboxed, true); assert.ok(result.pages[0].text.length > 100_000);
const hostile = await processInSandbox(Buffer.from('<script>steal()</script><h1>Safe title</h1>'), 'text/html');
assert.equal(hostile.pages[0].text, 'Safe title'); console.log('SANDBOX DOCUMENT PROCESSING PASSED');
