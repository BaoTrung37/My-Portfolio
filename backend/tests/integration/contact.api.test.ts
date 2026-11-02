import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { InMemoryContactRepository } from '../../src/modules/contact/contact.repository.js';

describe('Contact API Integration Tests (POST /api/contact)', () => {
  test('successfully submits valid inquiry and returns HTTP 201 Created with persisted message', async () => {
    const contactRepo = new InMemoryContactRepository();
    const app = createApp({ contact: contactRepo });

    const payload = {
      name: 'Ada Lovelace',
      email: 'ada.lovelace@analytical.org',
      subject: 'Algorithm Collaboration',
      message: 'Greetings Alex, I reviewed your distributed tracing project and found it fascinating.'
    };

    const res = await request(app)
      .post('/api/contact')
      .send(payload)
      .expect(201);

    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data);
    assert.ok(res.body.data.id);
    assert.ok(res.body.data.submittedAt);
    assert.strictEqual(
      res.body.data.message,
      'Thank you for reaching out! Your message has been received.'
    );
    assert.ok(res.body.meta.timestamp);

    // Verify persisted into repository
    const messages = await contactRepo.getMessages();
    assert.strictEqual(messages.length, 1);
    assert.strictEqual(messages[0].name, 'Ada Lovelace');
    assert.strictEqual(messages[0].email, 'ada.lovelace@analytical.org');
    assert.strictEqual(messages[0].subject, 'Algorithm Collaboration');
    assert.strictEqual(messages[0].status, 'unread');
  });

  test('successfully submits inquiry without optional subject', async () => {
    const contactRepo = new InMemoryContactRepository();
    const app = createApp({ contact: contactRepo });

    const payload = {
      name: 'Alan Turing',
      email: 'alan.turing@bletchley.ac.uk',
      message: 'Can we schedule a discussion regarding cloud architecture next week?'
    };

    const res = await request(app)
      .post('/api/contact')
      .send(payload)
      .expect(201);

    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.id);
  });

  test('returns HTTP 400 Bad Request with VALIDATION_FAILED when name is missing', async () => {
    const app = createApp();

    const payload = {
      email: 'test@example.com',
      message: 'Valid length message without a name.'
    };

    const res = await request(app)
      .post('/api/contact')
      .send(payload)
      .expect(400);

    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'VALIDATION_FAILED');
    assert.ok(Array.isArray(res.body.error.details));
    const nameIssue = res.body.error.details.find((d: any) => d.field === 'name');
    assert.ok(nameIssue);
  });

  test('returns HTTP 400 Bad Request when email format is invalid', async () => {
    const app = createApp();

    const payload = {
      name: 'Valid Name',
      email: 'not-an-email-address',
      message: 'Valid length message for testing invalid email.'
    };

    const res = await request(app)
      .post('/api/contact')
      .send(payload)
      .expect(400);

    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'VALIDATION_FAILED');
    const emailIssue = res.body.error.details.find((d: any) => d.field === 'email');
    assert.ok(emailIssue);
    assert.strictEqual(emailIssue.issue, 'A valid email address is required');
  });

  test('returns HTTP 400 Bad Request when message is too short (< 10 chars)', async () => {
    const app = createApp();

    const payload = {
      name: 'Valid Name',
      email: 'valid@example.com',
      message: 'Hi!'
    };

    const res = await request(app)
      .post('/api/contact')
      .send(payload)
      .expect(400);

    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'VALIDATION_FAILED');
    const msgIssue = res.body.error.details.find((d: any) => d.field === 'message');
    assert.ok(msgIssue);
    assert.strictEqual(msgIssue.issue, 'Message must be at least 10 characters');
  });

  test('returns HTTP 400 Bad Request when message is too long (> 2000 chars)', async () => {
    const app = createApp();

    const payload = {
      name: 'Valid Name',
      email: 'valid@example.com',
      message: 'X'.repeat(2001)
    };

    const res = await request(app)
      .post('/api/contact')
      .send(payload)
      .expect(400);

    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'VALIDATION_FAILED');
    const msgIssue = res.body.error.details.find((d: any) => d.field === 'message');
    assert.ok(msgIssue);
  });

  test('returns HTTP 413 or 400 when request body exceeds 64KB payload limit', async () => {
    const app = createApp();

    const hugePayload = {
      name: 'Spammer',
      email: 'spam@example.com',
      message: 'A'.repeat(70000) // 70KB
    };

    const res = await request(app)
      .post('/api/contact')
      .send(hugePayload);

    // Express body-parser with limit 64kb returns 413 Payload Too Large
    assert.strictEqual(res.status, 413);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'PAYLOAD_TOO_LARGE');
  });

  test('responds to OPTIONS preflight with HTTP 204 and CORS headers', async () => {
    const app = createApp();

    const res = await request(app)
      .options('/api/contact')
      .set('Origin', 'http://localhost:3000')
      .expect(204);

    assert.strictEqual(res.headers['access-control-allow-origin'], 'http://localhost:3000');
    assert.ok(res.headers['access-control-allow-methods']);
    assert.ok(res.headers['access-control-allow-headers']);
  });
});
