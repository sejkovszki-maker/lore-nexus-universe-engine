import { createHash } from 'node:crypto';
import { appendFile, chmod, copyFile, mkdir, open, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const PROJECT_ROOT = path.resolve(path.dirname(SCRIPT_PATH), '..');
const DEFAULT_STORE = path.join(PROJECT_ROOT, 'raw-source-store');
const INDEX_FILE = 'index.jsonl';

const MIME_TYPES = new Map([
  ['.txt', 'text/plain'],
  ['.pdf', 'application/pdf'],
  ['.opf', 'application/oebps-package+xml'],
  ['.epub', 'application/epub+zip'],
  ['.html', 'text/html'],
  ['.md', 'text/markdown'],
  ['.json', 'application/json'],
]);

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function logicalSourceId(sourcePath) {
  return `logical_sha256_${sha256(Buffer.from(sourcePath.normalize('NFC').toLowerCase(), 'utf8'))}`;
}

function objectPath(storeRoot, hash) {
  return path.join(storeRoot, 'objects', 'sha256', hash.slice(0, 2), hash);
}

async function listFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(fullPath));
    if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

async function readIndex(storeRoot) {
  try {
    const content = await readFile(path.join(storeRoot, INDEX_FILE), 'utf8');
    return content.split(/\r?\n/).filter(Boolean).map((line, lineIndex) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`Invalid JSON in ${INDEX_FILE} at line ${lineIndex + 1}: ${error.message}`);
      }
    });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeObjectOnce(target, source, expectedHash) {
  await mkdir(path.dirname(target), { recursive: true });
  try {
    const handle = await open(target, 'wx');
    await handle.close();
    await copyFile(source, target);
    const copiedHash = sha256(await readFile(target));
    if (copiedHash !== expectedHash) {
      throw new Error(`Hash mismatch after copying ${source}`);
    }
    await chmod(target, 0o444);
    return 'created';
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const existingHash = sha256(await readFile(target));
    if (existingHash !== expectedHash) {
      throw new Error(`Content-address collision or corrupted object: ${target}`);
    }
    return 'existing';
  }
}

async function importDirectory(sourceRoot, storeRoot) {
  const resolvedSource = path.resolve(sourceRoot);
  const resolvedStore = path.resolve(storeRoot);
  await mkdir(resolvedStore, { recursive: true });
  const existingEntries = await readIndex(resolvedStore);
  const knownImports = new Set(existingEntries.map((entry) => `${entry.sha256}\0${entry.sourcePath}`));
  const versionsByPath = new Map();
  for (const entry of existingEntries) {
    const history = versionsByPath.get(entry.sourcePath) ?? [];
    history.push(entry);
    versionsByPath.set(entry.sourcePath, history);
  }
  const files = await listFiles(resolvedSource);
  let imported = 0;
  let skipped = 0;

  for (const file of files) {
    const content = await readFile(file);
    const hash = sha256(content);
    const relativeToProject = path.relative(PROJECT_ROOT, file).split(path.sep).join('/');
    const sourcePath = relativeToProject.startsWith('../')
      ? path.relative(resolvedSource, file).split(path.sep).join('/')
      : relativeToProject;
    const importKey = `${hash}\0${sourcePath}`;
    await writeObjectOnce(objectPath(resolvedStore, hash), file, hash);

    if (knownImports.has(importKey)) {
      skipped += 1;
      continue;
    }

    const details = await stat(file);
    const sourceHistory = versionsByPath.get(sourcePath) ?? [];
    const previousVersion = sourceHistory.at(-1);
    const version = sourceHistory.length + 1;
    const record = {
      schemaVersion: 2,
      sourceId: `src_sha256_${hash}`,
      logicalSourceId: logicalSourceId(sourcePath),
      version,
      previousVersionSourceId: previousVersion ? previousVersion.sourceId : null,
      sha256: hash,
      byteLength: content.length,
      mediaType: MIME_TYPES.get(path.extname(file).toLowerCase()) ?? 'application/octet-stream',
      originalName: path.basename(file),
      sourcePath,
      originalModifiedAtUtc: details.mtime.toISOString(),
      importedAtUtc: new Date().toISOString(),
      objectPath: `objects/sha256/${hash.slice(0, 2)}/${hash}`,
    };
    await appendFile(path.join(resolvedStore, INDEX_FILE), `${JSON.stringify(record)}\n`, { encoding: 'utf8', flag: 'a' });
    knownImports.add(importKey);
    sourceHistory.push(record);
    versionsByPath.set(sourcePath, sourceHistory);
    imported += 1;
  }

  console.log(JSON.stringify({ command: 'import', sourceRoot: resolvedSource, storeRoot: resolvedStore, scanned: files.length, imported, skipped }));
}

async function verifyStore(storeRoot) {
  const resolvedStore = path.resolve(storeRoot);
  const entries = await readIndex(resolvedStore);
  const verifiedObjects = new Set();
  const errors = [];
  const histories = new Map();

  for (const [index, entry] of entries.entries()) {
    if (!/^[a-f0-9]{64}$/.test(entry.sha256 ?? '')) {
      errors.push(`index line ${index + 1}: invalid sha256`);
      continue;
    }
    const expectedRelativePath = `objects/sha256/${entry.sha256.slice(0, 2)}/${entry.sha256}`;
    if (entry.objectPath !== expectedRelativePath) errors.push(`index line ${index + 1}: invalid objectPath`);
    const target = objectPath(resolvedStore, entry.sha256);
    try {
      const content = await readFile(target);
      if (content.length !== entry.byteLength) errors.push(`${entry.sha256}: byte length mismatch`);
      if (sha256(content) !== entry.sha256) errors.push(`${entry.sha256}: content hash mismatch`);
      verifiedObjects.add(entry.sha256);
    } catch (error) {
      errors.push(`${entry.sha256}: ${error.code === 'ENOENT' ? 'missing object' : error.message}`);
    }

    const history = histories.get(entry.sourcePath) ?? [];
    const effectiveVersion = entry.version ?? history.length + 1;
    const effectiveLogicalId = entry.logicalSourceId ?? logicalSourceId(entry.sourcePath);
    const previousEntry = history.at(-1);
    if (effectiveVersion !== history.length + 1) errors.push(`${entry.sourcePath}: non-contiguous version ${effectiveVersion}`);
    if (effectiveLogicalId !== logicalSourceId(entry.sourcePath)) errors.push(`${entry.sourcePath}: invalid logicalSourceId`);
    if (entry.schemaVersion >= 2) {
      const expectedPrevious = previousEntry?.sourceId ?? null;
      if (entry.previousVersionSourceId !== expectedPrevious) errors.push(`${entry.sourcePath}: invalid previousVersionSourceId`);
    }
    history.push(entry);
    histories.set(entry.sourcePath, history);
  }

  if (errors.length) throw new Error(`Raw Source Store verification failed:\n- ${errors.join('\n- ')}`);
  console.log(JSON.stringify({ command: 'verify', storeRoot: resolvedStore, indexEntries: entries.length, verifiedObjects: verifiedObjects.size, logicalSources: histories.size }));
}

function usage() {
  console.error('Usage: node _scripts/raw-source-store.mjs import <source-directory> [store-directory]');
  console.error('       node _scripts/raw-source-store.mjs verify [store-directory]');
}

const [command, firstArgument, secondArgument] = process.argv.slice(2);
try {
  if (command === 'import' && firstArgument) {
    await importDirectory(firstArgument, secondArgument ?? DEFAULT_STORE);
  } else if (command === 'verify') {
    await verifyStore(firstArgument ?? DEFAULT_STORE);
  } else {
    usage();
    process.exitCode = 2;
  }
} catch (error) {
  console.error(error.stack ?? error.message);
  process.exitCode = 1;
}
