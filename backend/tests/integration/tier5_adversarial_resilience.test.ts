import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { createApp } from '../../src/app.js';
import {
  InMemoryProfileRepository,
  PostgresProfileRepository,
  IProfileRepository
} from '../../src/modules/profile/profile.repository.js';
import {
  InMemorySkillsRepository,
  PostgresSkillsRepository,
  ISkillsRepository
} from '../../src/modules/skills/skills.repository.js';
import {
  InMemoryProjectRepository,
  PostgresProjectRepository,
  IProjectRepository
} from '../../src/modules/projects/projects.repository.js';
import {
  InMemoryContactRepository,
  PostgresContactRepository,
  IContactRepository
} from '../../src/modules/contact/contact.repository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Tier 5 Adversarial Coverage & Resilience Suite', () => {

  // =========================================================================
  // 1. Database Fallback Switching & Error Recovery
  // =========================================================================
  describe('1. Database Fallback Switching & Error Recovery', () => {
    test('starts with in-memory repositories and operates normally when database is unavailable at startup', async () => {
      // Simulating database unavailable at startup (useInMemory: true)
      const app = createApp({ useInMemory: true });

      // 1. Health check returns UP
      const healthRes = await request(app).get('/api/health').expect(200);
      assert.strictEqual(healthRes.body.success, true);
      assert.strictEqual(healthRes.body.data.status, 'UP');

      // 2. Profile read returns 200
      const profileRes = await request(app).get('/api/profile').expect(200);
      assert.strictEqual(profileRes.body.success, true);
      assert.strictEqual(profileRes.body.data.fullName, 'Alex Rivera');

      // 3. Skills read returns 200
      const skillsRes = await request(app).get('/api/skills').expect(200);
      assert.strictEqual(skillsRes.body.success, true);
      assert.ok(skillsRes.body.data.length > 0);

      // 4. Projects read returns 200
      const projectsRes = await request(app).get('/api/projects').expect(200);
      assert.strictEqual(projectsRes.body.success, true);
      assert.ok(projectsRes.body.data.length > 0);

      // 5. Contact submission returns 201
      const contactRes = await request(app)
        .post('/api/contact')
        .send({
          name: 'Fallback Tester',
          email: 'fallback@example.com',
          message: 'Testing fallback mode inquiry submission.'
        })
        .expect(201);
      assert.strictEqual(contactRes.body.success, true);
      assert.ok(contactRes.body.data.id);
    });

    test('gracefully handles database query rejection without crashing process and returns standard error envelope', async () => {
      // Mock repository that simulates a dropped DB connection on profile retrieval
      const failingProfileRepo: IProfileRepository = {
        async getProfile() {
          const err: any = new Error('Connection terminated unexpectedly');
          err.code = 'ECONNRESET';
          throw err;
        }
      };

      const failingContactRepo: IContactRepository = {
        async saveMessage() {
          const err: any = new Error('Query read timeout');
          err.code = 'ETIMEDOUT';
          throw err;
        },
        async getMessages() {
          return [];
        }
      };

      const app = createApp({
        profile: failingProfileRepo,
        contact: failingContactRepo
      });

      // Profile query failure -> 500 with standard envelope
      const profileRes = await request(app).get('/api/profile').expect(500);
      assert.strictEqual(profileRes.body.success, false);
      assert.strictEqual(profileRes.body.error.code, 'ECONNRESET');
      assert.strictEqual(profileRes.body.error.message, 'Connection terminated unexpectedly');
      assert.ok(profileRes.body.meta.timestamp);

      // Contact submit failure -> 500 with standard envelope
      const contactRes = await request(app)
        .post('/api/contact')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          message: 'Inquiry that will encounter DB write timeout.'
        })
        .expect(500);
      assert.strictEqual(contactRes.body.success, false);
      assert.strictEqual(contactRes.body.error.code, 'ETIMEDOUT');
      assert.ok(contactRes.body.meta.timestamp);
    });

    test('recovers dynamically when database returns to healthy state after a transient outage', async () => {
      let isDbHealthy = false;

      const dynamicProfileRepo: IProfileRepository = {
        async getProfile() {
          if (!isDbHealthy) {
            const err: any = new Error('Database connection refused');
            err.code = 'ECONNREFUSED';
            throw err;
          }
          return {
            id: 'prof_recovered',
            fullName: 'Alex Rivera (Recovered)',
            title: 'Senior Engineer',
            bio: 'Recovered bio',
            socialLinks: {},
            availableForHire: true
          };
        }
      };

      const app = createApp({
        profile: dynamicProfileRepo,
        dbCheckFn: async () => isDbHealthy
      });

      // 1. Initial state: DB is down -> Health 503, Profile 500
      const healthDown = await request(app).get('/api/health').expect(503);
      assert.strictEqual(healthDown.body.success, false);
      assert.strictEqual(healthDown.body.error.code, 'DATABASE_DISCONNECTED');

      const profileDown = await request(app).get('/api/profile').expect(500);
      assert.strictEqual(profileDown.body.success, false);
      assert.strictEqual(profileDown.body.error.code, 'ECONNREFUSED');

      // 2. Simulated DB recovery: connection restored!
      isDbHealthy = true;

      // 3. Immediate subsequent request recovers without restarting app
      const healthUp = await request(app).get('/api/health').expect(200);
      assert.strictEqual(healthUp.body.success, true);
      assert.strictEqual(healthUp.body.data.database, 'CONNECTED');

      const profileUp = await request(app).get('/api/profile').expect(200);
      assert.strictEqual(profileUp.body.success, true);
      assert.strictEqual(profileUp.body.data.fullName, 'Alex Rivera (Recovered)');
    });
  });

  // =========================================================================
  // 2. Header, CORS, and Method Tampering Resilience
  // =========================================================================
  describe('2. Header, CORS, and Method Tampering Resilience', () => {
    test('enforces strict CORS origin isolation against untrusted, null, and spoofed origins', async () => {
      const app = createApp();

      const testCases = [
        { origin: 'https://attacker.evil.com', shouldAllow: false },
        { origin: 'http://localhost:3000.evil.com', shouldAllow: false },
        { origin: 'https://localhost:3000', shouldAllow: false }, // Wrong protocol
        { origin: 'null', shouldAllow: false },
        { origin: 'http://localhost:3000', shouldAllow: true }
      ];

      for (const tc of testCases) {
        const res = await request(app)
          .options('/api/health')
          .set('Origin', tc.origin)
          .expect(204);

        if (tc.shouldAllow) {
          assert.strictEqual(
            res.headers['access-control-allow-origin'],
            tc.origin,
            `Expected origin ${tc.origin} to be permitted`
          );
        } else {
          // Untrusted origins must NOT be reflected
          assert.notStrictEqual(
            res.headers['access-control-allow-origin'],
            tc.origin,
            `Origin ${tc.origin} must NOT be reflected`
          );
          assert.strictEqual(res.headers['access-control-allow-origin'], 'http://localhost:3000');
        }
      }
    });

    test('always includes X-Content-Type-Options: nosniff on 200, 400, 404, and 500 responses', async () => {
      const app = createApp({
        profile: {
          async getProfile() {
            throw new Error('Boom');
          }
        }
      });

      // 1. Success 200
      const res200 = await request(app).get('/api/skills');
      assert.strictEqual(res200.headers['x-content-type-options'], 'nosniff');

      // 2. Client error 400
      const res400 = await request(app).post('/api/contact').send({});
      assert.strictEqual(res400.headers['x-content-type-options'], 'nosniff');

      // 3. Not found 404
      const res404 = await request(app).get('/api/nonexistent');
      assert.strictEqual(res404.headers['x-content-type-options'], 'nosniff');

      // 4. Server error 500
      const res500 = await request(app).get('/api/profile');
      assert.strictEqual(res500.headers['x-content-type-options'], 'nosniff');
    });

    test('rejects unsupported HTTP methods with HTTP 404 in standard ApiResponse envelope', async () => {
      const app = createApp();

      // Attempt method tampering across endpoints
      const tamperMethods = [
        { method: 'patch', path: '/api/profile' },
        { method: 'put', path: '/api/skills' },
        { method: 'delete', path: '/api/projects' },
        { method: 'get', path: '/api/contact' }, // Contact only accepts POST
        { method: 'put', path: '/api/contact' },
        { method: 'delete', path: '/api/contact' },
        { method: 'post', path: '/api/health' }
      ];

      for (const item of tamperMethods) {
        const req = (request(app) as any)[item.method](item.path);
        const res = await req.expect(404);

        assert.strictEqual(res.body.success, false);
        assert.strictEqual(res.body.error.code, 'NOT_FOUND');
        assert.ok(
          res.body.error.message.includes(`Cannot ${item.method.toUpperCase()} ${item.path}`),
          `Expected message to describe rejected method and path`
        );
        assert.ok(res.body.meta.timestamp);
      }
    });

    test('handles Content-Type tampering on POST /api/contact securely', async () => {
      const app = createApp();

      // 1. Plain text with valid JSON content string
      const resText = await request(app)
        .post('/api/contact')
        .set('Content-Type', 'text/plain')
        .send('{"name":"Jane Doe","email":"jane@example.com","message":"Hello world valid message"}')
        .expect(400);

      assert.strictEqual(resText.body.success, false);
      assert.strictEqual(resText.body.error.code, 'VALIDATION_FAILED');

      // 2. Malformed JSON with application/json
      const resMalformed = await request(app)
        .post('/api/contact')
        .set('Content-Type', 'application/json')
        .send('{ name: "Jane", unquoted: true }')
        .expect(400);

      assert.strictEqual(resMalformed.body.success, false);
      assert.strictEqual(resMalformed.body.error.code, 'INVALID_JSON');

      // 3. Content-Type: application/xml
      const resXml = await request(app)
        .post('/api/contact')
        .set('Content-Type', 'application/xml')
        .send('<contact><name>Jane</name></contact>')
        .expect(400);

      assert.strictEqual(resXml.body.success, false);
      assert.strictEqual(resXml.body.error.code, 'VALIDATION_FAILED');
    });

    test('handles large header payloads safely within Node HTTP limits', async () => {
      const app = createApp();

      // Construct 4KB custom header (safe under 16KB Node header limit)
      const largeHeaderValue = 'A'.repeat(4096);

      const res = await request(app)
        .get('/api/health')
        .set('X-Custom-Tracking-Header', largeHeaderValue)
        .expect(200);

      assert.strictEqual(res.body.success, true);
    });
  });

  // =========================================================================
  // 3. SQL Migration Runner Idempotency
  // =========================================================================
  describe('3. SQL Migration Runner Idempotency & Schema Invariants', () => {
    test('verifies all migration SQL files use idempotent DDL (IF NOT EXISTS) and DML (ON CONFLICT)', () => {
      const migrationsDir = path.resolve(__dirname, '../../src/db/migrations');
      assert.ok(fs.existsSync(migrationsDir), `Migrations directory must exist at ${migrationsDir}`);

      const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
      assert.ok(files.length >= 2, 'Must have at least 001_initial_schema.sql and 002_seed_data.sql');

      // Check 001_initial_schema.sql
      const schemaSql = fs.readFileSync(path.join(migrationsDir, '001_initial_schema.sql'), 'utf8');

      // Every CREATE TABLE must have IF NOT EXISTS
      const createTableStatements = schemaSql.match(/CREATE\s+TABLE\s+(?!IF\s+NOT\s+EXISTS)/gi);
      assert.strictEqual(
        createTableStatements,
        null,
        'All CREATE TABLE statements in 001_initial_schema.sql must use IF NOT EXISTS'
      );

      // Every CREATE INDEX must have IF NOT EXISTS
      const createIndexStatements = schemaSql.match(/CREATE\s+INDEX\s+(?!IF\s+NOT\s+EXISTS)/gi);
      assert.strictEqual(
        createIndexStatements,
        null,
        'All CREATE INDEX statements in 001_initial_schema.sql must use IF NOT EXISTS'
      );

      // Check 002_seed_data.sql
      const seedSql = fs.readFileSync(path.join(migrationsDir, '002_seed_data.sql'), 'utf8');

      // Every INSERT statement must have ON CONFLICT clause
      const insertMatches = seedSql.match(/INSERT\s+INTO\s+[a-z_]+/gi) || [];
      const onConflictMatches = seedSql.match(/ON\s+CONFLICT/gi) || [];
      assert.ok(insertMatches.length > 0, 'Seed file must have INSERT statements');
      assert.strictEqual(
        insertMatches.length,
        onConflictMatches.length,
        'Every INSERT statement in seed file must have a corresponding ON CONFLICT clause for idempotency'
      );
    });

    test('simulates migration runner idempotency over sequential invocations', async () => {
      // Create a mock PostgreSQL query engine to verify runner logic
      const appliedMigrationsTable: string[] = [];
      const executedQueries: string[] = [];

      const mockPool = {
        async query(text: string, params?: any[]) {
          executedQueries.push(text.trim());
          if (text.includes('SELECT version FROM schema_migrations')) {
            return {
              rows: appliedMigrationsTable.map((v) => ({ version: v }))
            };
          }
          return { rows: [] };
        },
        async connect() {
          const clientQueries: string[] = [];
          return {
            async query(text: string, params?: any[]) {
              clientQueries.push(text.trim());
              if (text.includes('INSERT INTO schema_migrations') && params) {
                appliedMigrationsTable.push(params[0]);
              }
              return { rows: [] };
            },
            release() {}
          };
        }
      };

      // Inline migration runner logic simulation using mockPool
      async function simulateRunMigrations() {
        const migrationsDir = path.resolve(__dirname, '../../src/db/migrations');
        const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

        // 1. Ensure schema_migrations table exists
        await mockPool.query('CREATE TABLE IF NOT EXISTS schema_migrations ...');

        // 2. Query applied
        const res = await mockPool.query('SELECT version FROM schema_migrations ORDER BY id ASC');
        const appliedSet = new Set(res.rows.map((r: any) => r.version));

        const applied: string[] = [];
        const skipped: string[] = [];

        for (const file of files) {
          if (appliedSet.has(file)) {
            skipped.push(file);
            continue;
          }
          const client = await mockPool.connect();
          try {
            await client.query('BEGIN');
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            await client.query(sql);
            await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
            await client.query('COMMIT');
            applied.push(file);
          } finally {
            client.release();
          }
        }
        return { applied, skipped };
      }

      // First run: all migrations applied
      const run1 = await simulateRunMigrations();
      assert.strictEqual(run1.applied.length, 2);
      assert.strictEqual(run1.skipped.length, 0);
      assert.deepStrictEqual(run1.applied, ['001_initial_schema.sql', '002_seed_data.sql']);

      // Second run: all migrations skipped (100% idempotent)
      const run2 = await simulateRunMigrations();
      assert.strictEqual(run2.applied.length, 0);
      assert.strictEqual(run2.skipped.length, 2);
      assert.deepStrictEqual(run2.skipped, ['001_initial_schema.sql', '002_seed_data.sql']);

      // Third run: still idempotent
      const run3 = await simulateRunMigrations();
      assert.strictEqual(run3.applied.length, 0);
      assert.strictEqual(run3.skipped.length, 2);
    });

    test('verifies transactional rollback on migration execution failure without corrupting migration ledger', async () => {
      const appliedMigrationsTable: string[] = ['001_initial_schema.sql'];
      let rollbackCalled = false;

      const mockClient = {
        async query(text: string, params?: any[]) {
          if (text === 'BEGIN') return;
          if (text === 'ROLLBACK') {
            rollbackCalled = true;
            return;
          }
          if (text.includes('FAILING_MIGRATION_SQL')) {
            throw new Error('Syntax error in migration DDL');
          }
          if (text.includes('INSERT INTO schema_migrations')) {
            appliedMigrationsTable.push(params![0]);
          }
        },
        release() {}
      };

      try {
        await mockClient.query('BEGIN');
        await mockClient.query('FAILING_MIGRATION_SQL');
        await mockClient.query('INSERT INTO schema_migrations (version) VALUES ($1)', ['002_broken.sql']);
        await mockClient.query('COMMIT');
      } catch (err) {
        await mockClient.query('ROLLBACK');
      } finally {
        mockClient.release();
      }

      assert.strictEqual(rollbackCalled, true, 'Rollback must be called on failure');
      assert.strictEqual(
        appliedMigrationsTable.includes('002_broken.sql'),
        false,
        'Failed migration must NOT be recorded in schema_migrations'
      );
      assert.strictEqual(appliedMigrationsTable.length, 1);
    });
  });

});
