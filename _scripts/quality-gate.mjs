import { spawnSync } from 'node:child_process';
import process from 'node:process';

const commands = [
  ['node', ['_scripts/validate-data.js'], 'legacy data validation'],
  ['npm', ['run', 'test:unit'], 'unit tests and coverage'],
  ['npm', ['run', 'ai:evaluate'], 'AI golden dataset evaluation'],
  ['npm', ['run', 'test:property'], 'property-based tests'],
  ['npm', ['run', 'test:integration'], 'integration tests'],
  ['npm', ['run', 'test:regression'], 'regression baseline'],
  ['npm', ['run', 'test:fuzz'], 'fuzz tests'],
  ['npm', ['run', 'security:secrets'], 'secret scanning'],
  ['npm', ['run', 'security:audit'], 'dependency security'],
  ['node', ['_scripts/raw-source-store.mjs', 'verify', 'raw-source-store'], 'raw source integrity'],
  ['node', ['_scripts/audit-log.mjs', 'verify'], 'audit chain integrity'],
  ['npm', ['run', 'document:verify'], 'document store integrity'],
  ['npm', ['run', 'migration:dry-run'], 'non-destructive legacy migration dry-run'],
  ['npm', ['run', 'migration:verify'], 'legacy migration integrity and duplicate verification'],
  ['npm', ['run', 'test:document-sandbox'], 'sandboxed document processing'],
  ['npm', ['run', 'test:ocr'], 'local OCR pipeline'],
  ['npm', ['run', 'build'], 'production build'],
  ['npm', ['run', 'typecheck:netlify'], 'central Knowledge API type check'],
  ['npm', ['run', 'netlify:check'], 'Netlify deployment readiness'],
  ['npm', ['run', 'production:verify'], 'production readiness and final migration'],
  ['npm', ['run', 'test:e2e'], 'browser end-to-end tests'],
];

for (const [command, args, label] of commands) {
  console.log(`\n[quality-gate] ${label}`);
  const isNpm = command === 'npm';
  const executable = isNpm ? process.execPath : command;
  const executableArgs = isNpm ? [process.env.npm_execpath, ...args] : args;
  const result = spawnSync(executable, executableArgs, { stdio: 'inherit' });
  if (result.status !== 0) {
    if (result.error) console.error(result.error);
    console.error(`[quality-gate] FAILED: ${label}`);
    process.exit(result.status ?? 1);
  }
}

console.log('\nQUALITY GATE PASSED');
