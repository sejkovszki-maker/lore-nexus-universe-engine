import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultLog = path.join(projectRoot, 'audit', 'events.jsonl');

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function hashEvent(eventWithoutHash) {
  return createHash('sha256').update(canonical(eventWithoutHash), 'utf8').digest('hex');
}

async function readEvents(logPath) {
  try {
    return (await readFile(logPath, 'utf8')).split(/\r?\n/).filter(Boolean).map((line, index) => {
      try { return JSON.parse(line); }
      catch (error) { throw new Error(`Audit JSON error at line ${index + 1}: ${error.message}`); }
    });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function verify(logPath) {
  const events = await readEvents(logPath);
  let previousHash = null;
  for (const [index, event] of events.entries()) {
    const { eventHash, ...unsigned } = event;
    if (event.sequence !== index + 1) throw new Error(`Invalid audit sequence at line ${index + 1}`);
    if (event.previousHash !== previousHash) throw new Error(`Broken audit chain at line ${index + 1}`);
    if (hashEvent(unsigned) !== eventHash) throw new Error(`Audit event hash mismatch at line ${index + 1}`);
    previousHash = eventHash;
  }
  console.log(JSON.stringify({ command: 'verify-audit', events: events.length, headHash: previousHash, logPath: path.resolve(logPath) }));
  return events;
}

async function record(logPath, action, subject, detailsJson = '{}') {
  const events = await verify(logPath);
  let details;
  try { details = JSON.parse(detailsJson); } catch { throw new Error('Audit details must be valid JSON.'); }
  const unsigned = {
    schemaVersion: 1,
    sequence: events.length + 1,
    timestampUtc: new Date().toISOString(),
    actor: process.env.USERNAME || process.env.USER || 'system',
    action,
    subject,
    details,
    previousHash: events.at(-1)?.eventHash ?? null,
  };
  const event = { ...unsigned, eventHash: hashEvent(unsigned) };
  await mkdir(path.dirname(logPath), { recursive: true });
  await appendFile(logPath, `${JSON.stringify(event)}\n`, { encoding: 'utf8', flag: 'a' });
  console.log(JSON.stringify({ command: 'record-audit', sequence: event.sequence, eventHash: event.eventHash }));
}

const [command, first, second, third, fourth] = process.argv.slice(2);
try {
  if (command === 'record' && first && second) await record(fourth ?? defaultLog, first, second, third ?? '{}');
  else if (command === 'verify') await verify(first ?? defaultLog);
  else {
    console.error('Usage: node _scripts/audit-log.mjs record <action> <subject> [details-json] [log-path]');
    console.error('       node _scripts/audit-log.mjs verify [log-path]');
    process.exitCode = 2;
  }
} catch (error) {
  console.error(error.stack ?? error.message);
  process.exitCode = 1;
}
