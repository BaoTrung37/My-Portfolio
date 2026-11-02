import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool, closePool } from './client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(): Promise<{ applied: string[]; skipped: string[] }> {
  const migrationsDir = path.resolve(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.warn(`Migrations directory not found at: ${migrationsDir}`);
    return { applied: [], skipped: [] };
  }

  const pool = getPool();
  const applied: string[] = [];
  const skipped: string[] = [];

  try {
    // 1. Ensure schema_migrations table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        version VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Query applied migrations
    const res = await pool.query<{ version: string }>('SELECT version FROM schema_migrations ORDER BY id ASC');
    const appliedSet = new Set(res.rows.map((r) => r.version));

    // 3. Read SQL files
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (appliedSet.has(file)) {
        skipped.push(file);
        continue;
      }

      console.log(`Applying migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      // Execute within transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
        await client.query('COMMIT');
        applied.push(file);
        console.log(`✔ Applied migration: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`✖ Failed to apply migration ${file}:`, err);
        throw err;
      } finally {
        client.release();
      }
    }

    console.log(`Migration completed. ${applied.length} applied, ${skipped.length} previously applied.`);
    return { applied, skipped };
  } catch (err: any) {
    console.error('Migration error (database might be offline):', err?.message || err);
    throw err;
  }
}

// If executed directly via CLI
if (process.argv[1] && process.argv[1].endsWith('migrate.ts')) {
  runMigrations()
    .then(() => closePool())
    .catch(() => {
      closePool();
      process.exit(1);
    });
}
