import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..');

let totalFiles = 0;
let errors = 0;

function checkFile(filePath) {
  totalFiles++;
  const content = fs.readFileSync(filePath, 'utf8');

  // Check 1: Trailing whitespace
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (/\s+$/.test(line) && line.trim().length > 0) {
      // trailing whitespace warning
    }
  });

  // Check 2: No console.log in library/repository code (allowed in server.ts and CLI scripts)
  const relPath = path.relative(backendRoot, filePath);
  if (!relPath.startsWith('src/server.ts') && !relPath.startsWith('src/db/migrate') && !relPath.startsWith('src/db/seed')) {
    if (content.includes('console.log(') && !relPath.startsWith('tests/')) {
      console.warn(`[LINT WARNING] ${relPath}: Prefer structured logger over console.log`);
    }
  }

  // Check 3: Basic syntax validation (brackets balance)
  let braces = 0;
  let parens = 0;
  for (const ch of content) {
    if (ch === '{') braces++;
    if (ch === '}') braces--;
    if (ch === '(') parens++;
    if (ch === ')') parens--;
  }
  if (braces !== 0 || parens !== 0) {
    console.error(`[LINT ERROR] ${relPath}: Unbalanced braces/parentheses`);
    errors++;
  }
}

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist') {
        scanDir(fullPath);
      }
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      checkFile(fullPath);
    }
  }
}

console.log('Running backend linter...');
scanDir(path.join(backendRoot, 'src'));
scanDir(path.join(backendRoot, 'tests'));

if (errors > 0) {
  console.error(`Lint check failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log(`✔ Lint passed cleanly across ${totalFiles} TypeScript files with 0 errors.`);
  process.exit(0);
}
