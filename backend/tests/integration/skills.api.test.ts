import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../../src/app.js';

describe('Skills API Integration Tests (GET /api/skills)', () => {
  test('returns HTTP 200 with full list of skills in standard envelope', async () => {
    const app = createApp();

    const res = await request(app).get('/api/skills').expect(200);

    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 6);
    assert.strictEqual(res.body.meta.total, res.body.data.length);
    assert.ok(res.body.meta.timestamp);

    const first = res.body.data[0];
    assert.ok(first.id);
    assert.ok(first.name);
    assert.ok(first.category);
    assert.ok(typeof first.proficiency === 'number');
    assert.ok(typeof first.featured === 'boolean');
  });

  test('filters skills by category (?category=frontend)', async () => {
    const app = createApp();

    const res = await request(app).get('/api/skills?category=frontend').expect(200);

    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0);
    for (const skill of res.body.data) {
      assert.strictEqual(skill.category.toLowerCase(), 'frontend');
    }
  });

  test('filters skills by category (?category=backend)', async () => {
    const app = createApp();

    const res = await request(app).get('/api/skills?category=backend').expect(200);

    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0);
    for (const skill of res.body.data) {
      assert.strictEqual(skill.category.toLowerCase(), 'backend');
    }
  });

  test('filters skills by featured status (?featured=true)', async () => {
    const app = createApp();

    const res = await request(app).get('/api/skills?featured=true').expect(200);

    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0);
    for (const skill of res.body.data) {
      assert.strictEqual(skill.featured, true);
    }
  });

  test('returns empty array with HTTP 200 for non-matching category', async () => {
    const app = createApp();

    const res = await request(app).get('/api/skills?category=nonexistent_cat').expect(200);

    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.length, 0);
    assert.strictEqual(res.body.meta.total, 0);
  });
});
