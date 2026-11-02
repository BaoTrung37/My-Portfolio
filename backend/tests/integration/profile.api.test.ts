import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../../src/app.js';

describe('Profile API Integration Tests (GET /api/profile)', () => {
  test('returns HTTP 200 with profile details and social links in standard envelope', async () => {
    const app = createApp();

    const res = await request(app).get('/api/profile').expect(200);

    assert.strictEqual(res.body.success, true);
    const profile = res.body.data;
    assert.ok(profile);
    assert.strictEqual(profile.id, 'prof_default');
    assert.strictEqual(profile.fullName, 'Alex Rivera');
    assert.strictEqual(profile.title, 'Senior Fullstack Engineer & Cloud Architect');
    assert.ok(profile.bio.length > 20);
    assert.strictEqual(profile.location, 'San Francisco, CA (Remote)');
    assert.strictEqual(profile.availableForHire, true);
    assert.ok(profile.socialLinks);
    assert.ok(profile.socialLinks.github);
    assert.ok(profile.socialLinks.linkedin);
    assert.ok(res.body.meta.timestamp);
  });

  test('includes CORS headers on profile response', async () => {
    const app = createApp();

    const res = await request(app)
      .get('/api/profile')
      .set('Origin', 'http://localhost:3000')
      .expect(200);

    assert.strictEqual(res.headers['access-control-allow-origin'], 'http://localhost:3000');
  });
});
