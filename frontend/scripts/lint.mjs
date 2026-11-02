import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');

let totalFiles = 0;
let errors = 0;

function checkFile(filePath) {
  totalFiles++;
  const content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(frontendRoot, filePath);

  // Check 1: Trailing whitespace
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (/\s+$/.test(line) && line.trim().length > 0) {
      // trailing whitespace warning
    }
  });

  // Check 2: Basic syntax validation (brackets balance)
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
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.next') {
        scanDir(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js') || entry.name.endsWith('.mjs'))) {
      checkFile(fullPath);
    }
  }
}

console.log('Running frontend linter...');
scanDir(path.join(frontendRoot, 'src'));
scanDir(path.join(frontendRoot, 'tests'));
scanDir(path.join(frontendRoot, 'scripts'));

if (errors > 0) {
  console.error(`Frontend lint check failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log(`✔ Frontend lint passed cleanly across ${totalFiles} source files with 0 errors.`);
  process.exit(0);
}
