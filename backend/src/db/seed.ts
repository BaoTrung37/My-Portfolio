import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool, closePool } from './client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runSeed(): Promise<void> {
  const seedFile = path.resolve(__dirname, 'migrations', '002_seed_data.sql');
  if (!fs.existsSync(seedFile)) {
    console.warn(`Seed file not found at: ${seedFile}`);
    return;
  }

  const pool = getPool();
  console.log('Applying seed data...');
  const sql = fs.readFileSync(seedFile, 'utf8');

  try {
    await pool.query(sql);
    console.log('✔ Database seeded successfully with baseline profile, skills, and projects.');
  } catch (err: any) {
    console.error('Seed execution error:', err?.message || err);
    throw err;
  }
}

// If executed directly via CLI
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  runSeed()
    .then(() => closePool())
    .catch(() => {
      closePool();
      process.exit(1);
    });
}
