import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateContactSubmission } from '../../src/modules/contact/contact.dto.js';

describe('Contact DTO Validation', () => {
  test('passes validation for complete valid contact submission', () => {
    const input = {
      name: 'Sarah Connor',
      email: 'sarah.connor@example.com',
      subject: 'Consulting Opportunity',
      message: 'Hello Alex, I would love to discuss a potential fullstack consulting role.'
    };

    const result = validateContactSubmission(input);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.issues.length, 0);
    assert.deepStrictEqual(result.data, {
      name: 'Sarah Connor',
      email: 'sarah.connor@example.com',
      subject: 'Consulting Opportunity',
      message: 'Hello Alex, I would love to discuss a potential fullstack consulting role.'
    });
  });

  test('passes validation without optional subject', () => {
    const input = {
      name: 'Jane Doe',
      email: 'jane.doe@example.org',
      message: 'This is a message without any subject line specified.'
    };

    const result = validateContactSubmission(input);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.issues.length, 0);
    assert.strictEqual(result.data?.subject, undefined);
  });

  test('fails when body is not an object', () => {
    const r1 = validateContactSubmission(null);
    assert.strictEqual(r1.valid, false);
    assert.ok(r1.issues.some((i) => i.field === 'body'));

    const r2 = validateContactSubmission('not an object');
    assert.strictEqual(r2.valid, false);
    assert.ok(r2.issues.some((i) => i.field === 'body'));
  });

  test('fails when name is missing or too short', () => {
    const r1 = validateContactSubmission({
      email: 'alex@example.com',
      message: 'Valid length message here'
    });
    assert.strictEqual(r1.valid, false);
    assert.ok(r1.issues.some((i) => i.field === 'name'));

    const r2 = validateContactSubmission({
      name: 'A',
      email: 'alex@example.com',
      message: 'Valid length message here'
    });
    assert.strictEqual(r2.valid, false);
    assert.ok(r2.issues.some((i) => i.field === 'name'));
  });

  test('fails when name exceeds maximum length (120 chars)', () => {
    const r = validateContactSubmission({
      name: 'A'.repeat(121),
      email: 'alex@example.com',
      message: 'Valid length message here'
    });
    assert.strictEqual(r.valid, false);
    assert.ok(r.issues.some((i) => i.field === 'name'));
  });

  test('fails for invalid email formats', () => {
    const invalidEmails = [
      '',
      'plainaddress',
      '#@%^%#$@#$@#.com',
      '@example.com',
      'Joe Smith <email@example.com>',
      'email.example.com',
      'email@example@example.com',
      'email@example'
    ];

    for (const email of invalidEmails) {
      const r = validateContactSubmission({
        name: 'Valid Name',
        email,
        message: 'Valid length message here'
      });
      assert.strictEqual(r.valid, false, `Expected email "${email}" to fail validation`);
      assert.ok(r.issues.some((i) => i.field === 'email'));
    }
  });

  test('fails when email exceeds maximum length (255 chars)', () => {
    const r = validateContactSubmission({
      name: 'Valid Name',
      email: 'a'.repeat(250) + '@example.com',
      message: 'Valid length message here'
    });
    assert.strictEqual(r.valid, false);
    assert.ok(r.issues.some((i) => i.field === 'email'));
  });

  test('fails when message is missing or too short (< 10 chars)', () => {
    const r1 = validateContactSubmission({
      name: 'Valid Name',
      email: 'alex@example.com'
    });
    assert.strictEqual(r1.valid, false);
    assert.ok(r1.issues.some((i) => i.field === 'message'));

    const r2 = validateContactSubmission({
      name: 'Valid Name',
      email: 'alex@example.com',
      message: 'Short'
    });
    assert.strictEqual(r2.valid, false);
    assert.ok(r2.issues.some((i) => i.field === 'message'));
  });

  test('fails when message exceeds maximum length (> 2000 chars)', () => {
    const r = validateContactSubmission({
      name: 'Valid Name',
      email: 'alex@example.com',
      message: 'M'.repeat(2001)
    });
    assert.strictEqual(r.valid, false);
    assert.ok(r.issues.some((i) => i.field === 'message'));
  });

  test('fails when subject exceeds maximum length (> 200 chars)', () => {
    const r = validateContactSubmission({
      name: 'Valid Name',
      email: 'alex@example.com',
      subject: 'S'.repeat(201),
      message: 'Valid length message here'
    });
    assert.strictEqual(r.valid, false);
    assert.ok(r.issues.some((i) => i.field === 'subject'));
  });
});
