import dotenv from 'dotenv';
import path from 'path';

// Load .env file from backend root if present
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const isTest = nodeEnv === 'test';

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv,
  // During tests, disable external databaseUrl unless specifically configured for live DB testing
  databaseUrl: isTest ? (process.env.TEST_DATABASE_URL || '') : (process.env.DATABASE_URL || ''),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  isTest,
  isProduction: nodeEnv === 'production'
};
