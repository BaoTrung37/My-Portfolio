import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../../src/app.js';

describe('Projects API Integration Tests (GET /api/projects)', () => {
  test('returns HTTP 200 with list of projects in standard envelope', async () => {
    const app = createApp();

    const res = await request(app).get('/api/projects').expect(200);

    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 3);
    assert.strictEqual(res.body.meta.total, res.body.data.length);
    assert.ok(res.body.meta.timestamp);

    const first = res.body.data[0];
    assert.ok(first.id);
    assert.ok(first.title);
    assert.ok(first.slug);
    assert.ok(first.description);
    assert.ok(Array.isArray(first.technologies));
    assert.ok(first.technologies.length > 0);
    assert.ok(first.demoUrl);
    assert.ok(first.repoUrl);
  });

  test('filters projects by featured status (?featured=true)', async () => {
    const app = createApp();

    const res = await request(app).get('/api/projects?featured=true').expect(200);

    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0);
    for (const project of res.body.data) {
      assert.strictEqual(project.featured, true);
    }
  });

  test('filters projects by non-featured status (?featured=false)', async () => {
    const app = createApp();

    const res = await request(app).get('/api/projects?featured=false').expect(200);

    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0);
    for (const project of res.body.data) {
      assert.strictEqual(project.featured, false);
    }
  });
});
