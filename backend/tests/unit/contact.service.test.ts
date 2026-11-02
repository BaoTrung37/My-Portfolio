import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { ContactService } from '../../src/modules/contact/contact.service.js';
import { InMemoryContactRepository } from '../../src/modules/contact/contact.repository.js';

describe('ContactService Unit Tests', () => {
  test('persists contact message and returns submission confirmation', async () => {
    const repo = new InMemoryContactRepository();
    const service = new ContactService(repo);

    const dto = {
      name: 'Michael Scott',
      email: 'm.scott@dundermifflin.com',
      subject: 'Paper Supplies for Portfolio',
      message: 'Hello Alex, we need an awesome web platform for our company.'
    };

    const result = await service.submitContact(dto, '192.168.1.100');

    assert.ok(result.id);
    assert.ok(result.id.startsWith('msg_'));
    assert.ok(result.submittedAt);
    assert.strictEqual(
      result.message,
      'Thank you for reaching out! Your message has been received.'
    );

    // Verify stored in repository
    const stored = await repo.getMessages();
    assert.strictEqual(stored.length, 1);
    assert.strictEqual(stored[0].name, 'Michael Scott');
    assert.strictEqual(stored[0].email, 'm.scott@dundermifflin.com');
    assert.strictEqual(stored[0].status, 'unread');
    assert.strictEqual(stored[0].ipAddress, '192.168.1.100');
  });

  test('stores message with undefined subject and ipAddress when omitted', async () => {
    const repo = new InMemoryContactRepository();
    const service = new ContactService(repo);

    const dto = {
      name: 'Jim Halpert',
      email: 'jim@example.com',
      message: 'Just a quick question about your open source work.'
    };

    const result = await service.submitContact(dto);
    assert.ok(result.id);

    const stored = await repo.getMessages();
    assert.strictEqual(stored.length, 1);
    assert.strictEqual(stored[0].subject, undefined);
    assert.strictEqual(stored[0].ipAddress, undefined);
  });
});
