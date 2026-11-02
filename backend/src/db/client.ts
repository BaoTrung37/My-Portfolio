import { Pool, QueryResult } from 'pg';
import { config } from '../config/env.js';

let poolInstance: Pool | null = null;

export function getPool(): Pool {
  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString: config.databaseUrl || 'postgresql://portfolio_user:portfolio_pass@localhost:5432/personal_portfolio',
      connectionTimeoutMillis: 2000
    });

    poolInstance.on('error', (err: any) => {
      // Prevent unhandled errors from terminating process
      console.warn('PostgreSQL Pool background notice/warning:', err?.message || err);
    });
  }
  return poolInstance;
}

export const pool = getPool();

export async function query<R = any>(text: string, params?: any[]): Promise<QueryResult<R>> {
  return getPool().query<R>(text, params);
}

export async function checkDatabaseConnection(): Promise<boolean> {
  if (!config.databaseUrl && config.isTest) {
    return true; // Test mode mock is healthy
  }
  try {
    const res = await query('SELECT 1 AS alive');
    return Boolean(res && res.rows && res.rows.length > 0);
  } catch {
    return false;
  }
}

export async function closePool(): Promise<void> {
  if (poolInstance) {
    try {
      await poolInstance.end();
    } catch {}
    poolInstance = null;
  }
}
