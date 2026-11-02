/**
 * tier2_boundary_cases.js
 * Tier 2: Boundary & Corner Cases
 * Tests empty strings, unicode/emojis, whitespace-only, boundary lengths,
 * malformed inputs, oversized payloads, SQLi/XSS defense, and error envelopes.
 */

function registerTier2Tests(suite) {
  // =========================================================================
  // Empty & Whitespace-only Inputs
  // =========================================================================
  suite.register({
    tier: 2,
    feature: 'Boundary - Empty Values',
    title: 'POST /api/contact with empty name string rejected with 400',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: { name: '', email: 'valid@example.com', message: 'Legitimate message content here.' },
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    },
  });

  suite.register({
    tier: 2,
    feature: 'Boundary - Empty Values',
    title: 'POST /api/contact with empty email string rejected with 400',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: { name: 'Valid Name', email: '', message: 'Legitimate message content here.' },
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    },
  });

  suite.register({
    tier: 2,
    feature: 'Boundary - Empty Values',
    title: 'POST /api/contact with empty message string rejected with 400',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: { name: 'Valid Name', email: 'valid@example.com', message: '' },
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    },
  });

  suite.register({
    tier: 2,
    feature: 'Boundary - Whitespace Handling',
    title: 'POST /api/contact with whitespace-only name rejected with 400',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: { name: '     ', email: 'valid@example.com', message: 'Legitimate message content here.' },
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    },
  });

  suite.register({
    tier: 2,
    feature: 'Boundary - Whitespace Handling',
    title: 'POST /api/contact with whitespace-only message rejected with 400',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: { name: 'Valid Name', email: 'valid@example.com', message: '             ' },
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    },
  });

  // =========================================================================
  // Unicode, Emojis & Vietnamese Diacritics
  // =========================================================================
  suite.register({
    tier: 2,
    feature: 'Boundary - Unicode & Diacritics',
    title: 'POST /api/contact accepts full Vietnamese UTF-8 names and emojis with 201',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: {
          name: 'Nguyễn Văn Trung 🌟',
          email: 'trung.nguyen@congnghe.vn',
          subject: 'Hợp tác phát triển Fullstack & Trí tuệ nhân tạo 🚀',
          message: 'Chào bạn, tôi rất ấn tượng với danh mục dự án portfolio của bạn! Mong sớm có cơ hội làm việc cùng.',
        },
      });
      assert.strictEqual(res.status, 201, `Failed to accept Vietnamese UTF-8 text: ${res.rawText}`);
      assert.strictEqual(res.data.success, true);
    },
  });

  suite.register({
    tier: 2,
    feature: 'Boundary - Unicode & Diacritics',
    title: 'POST /api/contact accepts multi-byte international characters in message',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: {
          name: '田中 太郎 (Taro Tanaka)',
          email: 'tanaka@tokyo-tech.jp',
          message: 'こんにちは！ポートフォリオを拝見し、素晴らしいと思いました。ぜひお話ししたいです。',
        },
      });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.success, true);
    },
  });

  // =========================================================================
  // String Length Boundary Tests
  // =========================================================================
  suite.register({
    tier: 2,
    feature: 'Boundary - Length Limits',
    title: 'Name exact lower boundary (2 chars) accepted with 201',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: { name: 'An', email: 'an@example.com', message: 'Message meeting the 10 characters requirement.' },
      });
      assert.strictEqual(res.status, 201);
    },
  });

  suite.register({
    tier: 2,
    feature: 'Boundary - Length Limits',
    title: 'Name below minimum length (1 char) rejected with 400',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: { name: 'A', email: 'an@example.com', message: 'Message meeting the 10 characters requirement.' },
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    },
  });

  suite.register({
    tier: 2,
    feature: 'Boundary - Length Limits',
    title: 'Name exact upper boundary (120 chars) accepted with 201',
    fn: async ({ baseUrl, assert, request }) => {
      const maxName = 'A'.repeat(120);
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: { name: maxName, email: 'boundary@example.com', message: 'Message meeting the 10 characters requirement.' },
      });
      assert.strictEqual(res.status, 201);
    },
  });

  suite.register({
    tier: 2,
    feature: 'Boundary - Length Limits',
    title: 'Name exceeding upper boundary (121 chars) rejected with 400',
    fn: async ({ baseUrl, assert, request }) => {
      const overMaxName = 'A'.repeat(121);
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: { name: overMaxName, email: 'boundary@example.com', message: 'Message meeting the 10 characters requirement.' },
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    },
  });

  suite.register({
    tier: 2,
    feature: 'Boundary - Length Limits',
    title: 'Message below minimum length (9 chars) rejected with 400',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: { name: 'Valid Name', email: 'valid@example.com', message: '123456789' },
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    },
  });

  suite.register({
    tier: 2,
    feature: 'Boundary - Length Limits',
    title: 'Message exact lower boundary (10 chars) accepted with 201',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: { name: 'Valid Name', email: 'valid@example.com', message: '1234567890' },
      });
      assert.strictEqual(res.status, 201);
    },
  });

  suite.register({
    tier: 2,
    feature: 'Boundary - Length Limits',
    title: 'Message exact upper boundary (2000 chars) accepted with 201',
    fn: async ({ baseUrl, assert, request }) => {
      const maxMsg = 'M'.repeat(2000);
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: { name: 'Valid Name', email: 'valid@example.com', message: maxMsg },
      });
      assert.strictEqual(res.status, 201);
    },
  });

  suite.register({
    tier: 2,
    feature: 'Boundary - Length Limits',
    title: 'Message exceeding upper boundary (2001 chars) rejected with 400',
    fn: async ({ baseUrl, assert, request }) => {
      const overMaxMsg = 'M'.repeat(2001);
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: { name: 'Valid Name', email: 'valid@example.com', message: overMaxMsg },
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    },
  });

  // =========================================================================
  // Invalid Email Structures
  // =========================================================================
  suite.register({
    tier: 2,
    feature: 'Boundary - Email Syntax',
    title: 'Email missing domain ("user@") rejected with 400',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: { name: 'Valid Name', email: 'user@', message: 'Meeting 10 characters length.' },
      });
      assert.strictEqual(res.status, 400);
    },
  });

  suite.register({
    tier: 2,
    feature: 'Boundary - Email Syntax',
    title: 'Email missing username ("@domain.com") rejected with 400',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: { name: 'Valid Name', email: '@domain.com', message: 'Meeting 10 characters length.' },
      });
      assert.strictEqual(res.status, 400);
    },
  });

  suite.register({
    tier: 2,
    feature: 'Boundary - Email Syntax',
    title: 'Email missing at-symbol ("user.example.com") rejected with 400',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: { name: 'Valid Name', email: 'user.example.com', message: 'Meeting 10 characters length.' },
      });
      assert.strictEqual(res.status, 400);
    },
  });

  // =========================================================================
  // Malformed JSON & Payload Limits
  // =========================================================================
  suite.register({
    tier: 2,
    feature: 'Boundary - Malformed Payloads',
    title: 'POST /api/contact with malformed JSON body rejected with 400',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"name": "Broken JSON", "email": ',
      });
      assert.strictEqual(res.status, 400, `Expected 400 for broken JSON, got ${res.status}`);
      assert.strictEqual(res.data.success, false);
    },
  });

  suite.register({
    tier: 2,
    feature: 'Boundary - Malformed Payloads',
    title: 'Oversized JSON payload (>64KB limit) rejected with 413 or 400',
    fn: async ({ baseUrl, assert, request }) => {
      const bigString = 'X'.repeat(70 * 1024); // 70KB
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: { name: 'Test', email: 'test@example.com', message: bigString },
      });
      assert.ok(
        [413, 400].includes(res.status),
        `Expected 413 Payload Too Large or 400 Bad Request, got: ${res.status}`
      );
    },
  });

  // =========================================================================
  // SQL Injection & XSS Resilience
  // =========================================================================
  suite.register({
    tier: 2,
    feature: 'Boundary - Injection Resilience',
    title: 'SQL injection strings in contact form handled safely without server crash (no 500)',
    fn: async ({ baseUrl, assert, request }) => {
      const sqlPayload = {
        name: "'; DROP TABLE contact_messages; --",
        email: "sqli-test@example.com",
        message: "' OR 1=1; SELECT * FROM profiles WHERE 'a'='a",
      };
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: sqlPayload,
      });
      assert.ok(
        res.status === 201 || res.status === 400,
        `Server should either validate or safely ingest SQLi payload without 500. Got: ${res.status}`
      );
      assert.notStrictEqual(res.status, 500, 'Server must never crash on SQLi input');
    },
  });

  suite.register({
    tier: 2,
    feature: 'Boundary - Injection Resilience',
    title: 'XSS script and tag injection in contact form handled safely without server crash (no 500)',
    fn: async ({ baseUrl, assert, request }) => {
      const xssPayload = {
        name: '<script>alert("XSS")</script>',
        email: 'xss-attacker@example.org',
        message: '<img src=x onerror="alert(document.cookie)"> hello world',
      };
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: xssPayload,
      });
      assert.ok(
        res.status === 201 || res.status === 400,
        `Server should safely handle HTML/XSS input without 500. Got: ${res.status}`
      );
      assert.notStrictEqual(res.status, 500, 'Server must never crash on XSS input');
    },
  });

  // =========================================================================
  // Route Not Found (404)
  // =========================================================================
  suite.register({
    tier: 2,
    feature: 'Boundary - Routing',
    title: 'Request to non-existent route returns HTTP 404 in standard error envelope',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/non_existent_route_12345');
      assert.strictEqual(res.status, 404, `Expected 404 Not Found, got: ${res.status}`);
      assert.strictEqual(res.data.success, false);
      assert.ok(res.data.error, 'Error object should be present');
    },
  });
}

module.exports = {
  registerTier2Tests,
};
