import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../../src/app.js';

describe('Health API Integration Tests (GET /api/health)', () => {
  test('returns HTTP 200 with status UP and database CONNECTED when healthy', async () => {
    const app = createApp({
      dbCheckFn: async () => true
    });

    const res = await request(app).get('/api/health').expect(200);

    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.status, 'UP');
    assert.strictEqual(res.body.data.database, 'CONNECTED');
    assert.ok(typeof res.body.data.uptimeSeconds === 'number');
    assert.strictEqual(res.body.data.version, '1.0.0');
    assert.ok(res.body.meta.timestamp);
  });

  test('returns HTTP 503 with DATABASE_DISCONNECTED when database check fails', async () => {
    const app = createApp({
      dbCheckFn: async () => false
    });

    const res = await request(app).get('/api/health').expect(503);

    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'DATABASE_DISCONNECTED');
    assert.ok(res.body.error.message);
    assert.ok(res.body.meta.timestamp);
  });
});
