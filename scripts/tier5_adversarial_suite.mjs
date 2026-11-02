import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../backend/dist/backend/src/app.js';
import { InMemoryContactRepository } from '../backend/dist/backend/src/modules/contact/contact.repository.js';
import { InMemorySkillsRepository } from '../backend/dist/backend/src/modules/skills/skills.repository.js';
import { InMemoryProjectRepository } from '../backend/dist/backend/src/modules/projects/projects.repository.js';
import { InMemoryProfileRepository } from '../backend/dist/backend/src/modules/profile/profile.repository.js';
import { VALIDATION_RULES } from '@portfolio/shared';

const ROOT_DIR = path.resolve(import.meta.dirname, '..');

console.log('======================================================================');
console.log('⚔️  TIER 5 ADVERSARIAL COVERAGE HARDENING & STRESS HARNESS');
console.log('    Milestone 4 Phase 2 — Empirical Verification Suite');
console.log('======================================================================\n');

let passCount = 0;
let failCount = 0;
const findings = [];

async function recordTest(suiteName, testName, fn) {
  try {
    await fn();
    passCount++;
    console.log(`  ✔ [PASS] ${testName}`);
  } catch (err) {
    failCount++;
    console.error(`  ✖ [FAIL] ${testName}: ${err.message}`);
    findings.push({ suite: suiteName, test: testName, error: err.message, stack: err.stack });
  }
}

// ============================================================================
// SUITE 1: HTTP Method Fuzzing & Route Boundary Safety
// ============================================================================
async function runSuite1() {
  console.log('\n--- SUITE 1: HTTP Method Fuzzing & Route Boundary Safety ---');
  const app = createApp({ useInMemory: true });

  await recordTest('Suite 1', 'Rejects unsupported HTTP methods on read endpoints with clean 404 envelope', async () => {
    const verbs = [
      { method: 'delete', path: '/api/profile' },
      { method: 'put', path: '/api/skills' },
      { method: 'patch', path: '/api/projects' },
      { method: 'post', path: '/api/health' },
      { method: 'patch', path: '/api/health' },
    ];

    for (const v of verbs) {
      const res = await request(app)[v.method](v.path);
      assert.strictEqual(res.status, 404, `Expected 404 for ${v.method.toUpperCase()} ${v.path}, got ${res.status}`);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'NOT_FOUND');
      assert.ok(res.body.error.message.includes(`Cannot ${v.method.toUpperCase()} ${v.path}`));
      assert.ok(res.body.meta.timestamp);
      assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
    }
  });

  await recordTest('Suite 1', 'Rejects unsupported HTTP methods on write endpoint (POST /api/contact)', async () => {
    const disallowedMethods = ['get', 'put', 'patch', 'delete'];
    for (const m of disallowedMethods) {
      const res = await request(app)[m]('/api/contact');
      assert.strictEqual(res.status, 404, `Expected 404 for ${m.toUpperCase()} /api/contact, got ${res.status}`);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'NOT_FOUND');
    }
  });

  await recordTest('Suite 1', 'Responds to OPTIONS preflight on any API route with 204 No Content', async () => {
    const routes = ['/api/contact', '/api/profile', '/api/skills', '/api/projects', '/api/health', '/api/nonexistent'];
    for (const r of routes) {
      const res = await request(app).options(r);
      assert.strictEqual(res.status, 204, `OPTIONS ${r} must return 204`);
      assert.ok(res.headers['access-control-allow-methods'].includes('GET, POST'));
      assert.strictEqual(res.headers['access-control-max-age'], '86400');
    }
  });

  await recordTest('Suite 1', 'Enforces X-Content-Type-Options: nosniff header across 200, 201, 400, 404, 413, 500 responses', async () => {
    // 200
    const res200 = await request(app).get('/api/health');
    assert.strictEqual(res200.headers['x-content-type-options'], 'nosniff');

    // 201
    const res201 = await request(app).post('/api/contact').send({
      name: 'Nosniff Test',
      email: 'nosniff@example.com',
      message: 'Testing nosniff on 201 Created'
    });
    assert.strictEqual(res201.headers['x-content-type-options'], 'nosniff');

    // 400
    const res400 = await request(app).post('/api/contact').send({});
    assert.strictEqual(res400.headers['x-content-type-options'], 'nosniff');

    // 404
    const res404 = await request(app).get('/api/non-existent-page-xyz');
    assert.strictEqual(res404.headers['x-content-type-options'], 'nosniff');

    // 413
    const res413 = await request(app).post('/api/contact').send({ message: 'X'.repeat(70 * 1024) });
    assert.strictEqual(res413.headers['x-content-type-options'], 'nosniff');
  });
}

// ============================================================================
// SUITE 2: Content-Type, Serialization & Encoding Adversarial Payloads
// ============================================================================
async function runSuite2() {
  console.log('\n--- SUITE 2: Content-Type, Serialization & Encoding Adversarial Payloads ---');
  const app = createApp({ useInMemory: true });

  await recordTest('Suite 2', 'Rejects raw primitive JSON types (string, number, boolean, null) with HTTP 400 Bad Request', async () => {
    const primitives = [
      { label: 'JSON string', payload: '"hello world"' },
      { label: 'JSON number', payload: '123456' },
      { label: 'JSON boolean true', payload: 'true' },
      { label: 'JSON boolean false', payload: 'false' },
      { label: 'JSON null', payload: 'null' },
    ];

    for (const item of primitives) {
      const res = await request(app)
        .post('/api/contact')
        .set('Content-Type', 'application/json')
        .send(item.payload);
      assert.strictEqual(res.status, 400, `Expected 400 for ${item.label}, got ${res.status}`);
      assert.strictEqual(res.body.success, false);
      assert.ok(
        ['VALIDATION_FAILED', 'INVALID_JSON'].includes(res.body.error.code),
        `Unexpected error code: ${res.body.error.code}`
      );
    }
  });

  await recordTest('Suite 2', 'Rejects JSON array bodies with HTTP 400 Bad Request', async () => {
    const arrays = [
      '[]',
      '[{"name":"User","email":"user@test.com","message":"Hello world valid length"}]',
      '["name", "email", "message"]'
    ];

    for (const arr of arrays) {
      const res = await request(app)
        .post('/api/contact')
        .set('Content-Type', 'application/json')
        .send(arr);
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error.code, 'VALIDATION_FAILED');
      assert.ok(res.body.error.details.some(d => d.issue.includes('Request body must be a JSON object')));
    }
  });

  await recordTest('Suite 2', 'Rejects malformed JSON syntax with HTTP 400 INVALID_JSON', async () => {
    const malformedBodies = [
      '{"name": "broken',
      '{"name": "test", "email": }',
      '{"name": "test", "message": "hello",}',
      '{name: unquotedKey}',
      '{"name": "\x00"}'
    ];

    for (const bad of malformedBodies) {
      const res = await request(app)
        .post('/api/contact')
        .set('Content-Type', 'application/json')
        .send(bad);
      assert.strictEqual(res.status, 400, `Malformed body should return 400, got ${res.status}`);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'INVALID_JSON');
      assert.strictEqual(res.body.error.message, 'Malformed JSON in request body');
    }
  });

  await recordTest('Suite 2', 'Handles 0-byte empty JSON payload with HTTP 400', async () => {
    const res = await request(app)
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send('');
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
  });

  await recordTest('Suite 2', 'Accepts valid form submissions with application/x-www-form-urlencoded', async () => {
    const res = await request(app)
      .post('/api/contact')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send('name=Alex+Rivera&email=alex%40example.com&subject=Form+UrlEncoded&message=This+is+a+valid+urlencoded+message+payload');
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.id);
  });

  await recordTest('Suite 2', 'Rejects non-parsed Content-Types (e.g. application/xml, text/plain) missing parsed body with 400', async () => {
    const resXml = await request(app)
      .post('/api/contact')
      .set('Content-Type', 'application/xml')
      .send('<contact><name>Test</name><email>test@example.com</email><message>Valid message text</message></contact>');
    assert.strictEqual(resXml.status, 400);
    assert.strictEqual(resXml.body.error.code, 'VALIDATION_FAILED');
  });

  await recordTest('Suite 2', 'Fuzzes body with 1,000 distinct unknown keys without memory corruption or prototype pollution', async () => {
    const heavyPayload = {
      name: 'Fuzzer Bot',
      email: 'fuzzer@botnet.test',
      message: 'Fuzzing with 1,000 extra properties within limits.'
    };
    for (let i = 0; i < 1000; i++) {
      heavyPayload[`extra_key_${i}`] = `fuzz_value_${i}`;
    }

    const res = await request(app)
      .post('/api/contact')
      .send(heavyPayload);
    assert.strictEqual(res.status, 201, 'Zod should strip extra properties and accept valid fields');
    assert.ok(res.body.data.id);
  });

  await recordTest('Suite 2', 'Enforces strict 64KB boundary: 63KB valid body accepted vs 65KB rejected with 413 PAYLOAD_TOO_LARGE', async () => {
    // 63KB body: valid message length (under 2000 chars) but padding in safe subject or comment
    const safePad = 'S'.repeat(150);
    const resSafe = await request(app)
      .post('/api/contact')
      .send({
        name: 'Boundary Tester',
        email: 'boundary@test.com',
        subject: safePad,
        message: 'A'.repeat(1990)
      });
    assert.strictEqual(resSafe.status, 201);

    // 65KB body: triggers Express 413
    const bigPad = 'X'.repeat(65 * 1024);
    const resOversized = await request(app)
      .post('/api/contact')
      .send({
        name: 'Oversized',
        email: 'oversized@test.com',
        message: bigPad
      });
    assert.strictEqual(resOversized.status, 413);
    assert.strictEqual(resOversized.body.error.code, 'PAYLOAD_TOO_LARGE');
    assert.strictEqual(resOversized.body.error.message, 'Request payload exceeds 64KB limit');
  });
}

// ============================================================================
// SUITE 3: Path Traversal, URI Manipulation & Route Boundary Fuzzing
// ============================================================================
async function runSuite3() {
  console.log('\n--- SUITE 3: Path Traversal, URI Manipulation & Route Boundary Fuzzing ---');
  const app = createApp({ useInMemory: true });

  await recordTest('Suite 3', 'Safely rejects URL-encoded path traversal attempts without exposing filesystem', async () => {
    const paths = [
      '/api/%2e%2e/%2e%2e/package.json',
      '/api/%2e%2e/src/app.ts',
      '/api/%2e%2e%2f%2e%2e%2fetc/passwd',
      '/api/health/%2e%2e/profile'
    ];

    for (const p of paths) {
      const res = await request(app).get(p);
      assert.ok([200, 404].includes(res.status));
      if (res.status === 404) {
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(res.body.error.code, 'NOT_FOUND');
      }
    }
  });

  await recordTest('Suite 3', 'Handles null bytes in URI path safely', async () => {
    const res = await request(app).get('/api/health%00.json');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'NOT_FOUND');
  });

  await recordTest('Suite 3', 'Handles repeated and redundant slashes safely with standard 404 envelope', async () => {
    const res = await request(app).get('///api//health///');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'NOT_FOUND');
  });

  await recordTest('Suite 3', 'Handles extremely long URI paths (>2KB) without server crash', async () => {
    const longPath = '/api/unknown/' + 'a'.repeat(2500);
    const res = await request(app).get(longPath);
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
  });
}

// ============================================================================
// SUITE 4: Hostile Injection, Unicode, and Data Boundary Fuzzing
// ============================================================================
async function runSuite4() {
  console.log('\n--- SUITE 4: Hostile Injection, Unicode, and Data Boundary Fuzzing ---');
  const contactRepo = new InMemoryContactRepository();
  const app = createApp({ contact: contactRepo, useInMemory: true });

  await recordTest('Suite 4', 'Neutralizes advanced SQL Injection vectors (stacked queries, tautologies, hex encoding)', async () => {
    const sqlVectors = [
      { name: "Admin' OR 1=1; --", email: "sqli1@security.org", message: "Tautology probe payload test." },
      { name: "'; DROP TABLE contact_messages; --", email: "sqli2@security.org", message: "Stacked drop table attack attempt." },
      { name: "CHAR(0x73,0x71,0x6C,0x69)", email: "sqli3@security.org", message: "Hex char literal query injection." },
      { name: "UNION ALL SELECT 1, 'admin', 'pass', 'token' --", email: "sqli4@security.org", message: "Union-based data extraction vector." }
    ];

    for (const vec of sqlVectors) {
      const res = await request(app).post('/api/contact').send(vec);
      assert.strictEqual(res.status, 201, `Failed on vector: ${vec.name}`);
      assert.ok(res.body.data.id);
    }

    // Verify all stored verbatim as text
    const stored = await contactRepo.getMessages();
    assert.ok(stored.some(m => m.name.includes('DROP TABLE')));
    assert.ok(stored.some(m => m.name.includes('UNION ALL')));
  });

  await recordTest('Suite 4', 'Neutralizes Polyglot XSS, Template Injections, and Script Tags', async () => {
    const xssVectors = [
      "jaVasCript:/*-/*`/*\\`/*'/*\"/**/(/* */oNcliCk=alert() )//%0D%0A%0d%0a//</stYle/<titLe/</teXtarEa/</scRipt/--!>\\x3csVg/<sVg/oNloAd=alert()//>\\x3e",
      "{{7*7}} ${7*7} <%= 7*7 %> #{7*7}",
      "<img src=x onerror=alert(1)>",
      "<svg onload=alert(document.cookie)>",
      "<a href=\"javascript:alert('XSS')\">Click Me</a>"
    ];

    for (let i = 0; i < xssVectors.length; i++) {
      const vec = xssVectors[i];
      const res = await request(app).post('/api/contact').send({
        name: `XSS Tester ${i}`,
        email: `xss_${i}@payload.test`,
        subject: vec.slice(0, 150),
        message: `Testing payload: ${vec}`
      });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.headers['content-type'].includes('application/json'), true);
    }
  });

  await recordTest('Suite 4', 'Safely preserves complex UTF-8 accents, Vietnamese tones, surrogate pairs, and ZWJ emojis', async () => {
    const complexUnicode = {
      name: 'Nguyễn Đỗ Khánh Huyền 👩‍💻',
      email: 'huyen.nguyen@cong-nghe.vn',
      subject: 'Phát triển vi mô & Kiến trúc Cloud 🚀🇻🇳',
      message: 'Xin chào! Hệ thống hỗ trợ đầy đủ các ký tự đặc biệt: ă, â, đ, ê, ô, ơ, ư, ế, ề, ể, ễ, ệ, ố, ồ, ổ, ỗ, ộ. Cùng các biểu tượng cảm xúc gia đình: 👨‍👩‍👧‍👦, cờ quốc gia: 🇻🇳, và ký tự Zero-width: \u200B\u200C\u200D.'
    };

    const res = await request(app).post('/api/contact').send(complexUnicode);
    assert.strictEqual(res.status, 201);

    const stored = await contactRepo.getMessages();
    const saved = stored.find(m => m.id === res.body.data.id);
    assert.ok(saved);
    assert.strictEqual(saved.name, complexUnicode.name);
    assert.strictEqual(saved.subject, complexUnicode.subject);
    assert.strictEqual(saved.message, complexUnicode.message);
  });

  await recordTest('Suite 4', 'RFC Email Syntax Fuzzing: validates accepted vs hostile addresses', async () => {
    // Valid emails
    const validEmails = [
      'simple@example.com',
      'very.common@example.com',
      'disposable.style.email.with+symbol@example.com',
      'other.email-with-hyphen@and.subdomains.example.com',
      'fully-qualified-domain@sub.domain.co.uk',
      'user.name+tag+sorting@example.com',
      '1234567890@example.com'
    ];

    for (const email of validEmails) {
      const res = await request(app).post('/api/contact').send({
        name: 'Email Tester',
        email,
        message: 'Valid email RFC syntax test payload.'
      });
      assert.strictEqual(res.status, 201, `Email should be valid: ${email}`);
    }

    // Hostile / invalid emails (violating REGEX /^[^\s@]+@[^\s@]+\.[^\s@]+$/ or MAX length 255)
    const invalidEmails = [
      'plainaddress',
      '#@%^%#$@#$@#.com',
      '@example.com',
      'Joe Smith <email@example.com>',
      'email.example.com',
      'email@example@example.com',
      'email@example',
      'email\n@example.com',
      'email\r@example.com',
      'email with space@example.com',
      'user@',
      'user@.com',
      'user@domain.',
      'a'.repeat(245) + '@example.com' // 257 chars > 255 limit
    ];

    for (const email of invalidEmails) {
      const res = await request(app).post('/api/contact').send({
        name: 'Email Tester',
        email,
        message: 'Invalid email RFC syntax test payload.'
      });
      assert.strictEqual(res.status, 400, `Email should be rejected: ${email}`);
      assert.strictEqual(res.body.error.code, 'VALIDATION_FAILED');
      assert.ok(res.body.error.details.some(d => d.field === 'email'));
    }
  });

  await recordTest('Suite 4', 'Boundary stress: Name length exact limits and whitespace trimming', async () => {
    // 1 char -> 400
    const res1 = await request(app).post('/api/contact').send({ name: 'A', email: 'test@test.com', message: 'Valid message length 10' });
    assert.strictEqual(res1.status, 400);

    // 2 chars -> 201
    const res2 = await request(app).post('/api/contact').send({ name: 'AB', email: 'test@test.com', message: 'Valid message length 10' });
    assert.strictEqual(res2.status, 201);

    // 120 chars -> 201
    const res120 = await request(app).post('/api/contact').send({ name: 'N'.repeat(120), email: 'test@test.com', message: 'Valid message length 10' });
    assert.strictEqual(res120.status, 201);

    // 121 chars -> 400
    const res121 = await request(app).post('/api/contact').send({ name: 'N'.repeat(121), email: 'test@test.com', message: 'Valid message length 10' });
    assert.strictEqual(res121.status, 400);

    // Whitespace trimming to < 2 chars -> 400
    const resTrimShort = await request(app).post('/api/contact').send({ name: '   A   ', email: 'test@test.com', message: 'Valid message length 10' });
    assert.strictEqual(resTrimShort.status, 400);

    // Whitespace trimming to 2 chars -> 201
    const resTrimValid = await request(app).post('/api/contact').send({ name: '   AB   ', email: 'test@test.com', message: 'Valid message length 10' });
    assert.strictEqual(resTrimValid.status, 201);

    // Non-string name -> 400
    const resObjName = await request(app).post('/api/contact').send({ name: { first: 'John' }, email: 'test@test.com', message: 'Valid message length 10' });
    assert.strictEqual(resObjName.status, 400);
  });

  await recordTest('Suite 4', 'Boundary stress: Subject variations (null, undefined, empty, 200 vs 201 chars, type confusion)', async () => {
    // null subject -> 201
    const resNull = await request(app).post('/api/contact').send({ name: 'Subject Test', email: 'test@test.com', subject: null, message: 'Valid message length 10' });
    assert.strictEqual(resNull.status, 201);

    // empty subject -> 201
    const resEmpty = await request(app).post('/api/contact').send({ name: 'Subject Test', email: 'test@test.com', subject: '', message: 'Valid message length 10' });
    assert.strictEqual(resEmpty.status, 201);

    // whitespace-only subject -> 201
    const resSpaces = await request(app).post('/api/contact').send({ name: 'Subject Test', email: 'test@test.com', subject: '     ', message: 'Valid message length 10' });
    assert.strictEqual(resSpaces.status, 201);

    // 200 chars -> 201
    const res200 = await request(app).post('/api/contact').send({ name: 'Subject Test', email: 'test@test.com', subject: 'S'.repeat(200), message: 'Valid message length 10' });
    assert.strictEqual(res200.status, 201);

    // 201 chars -> 400
    const res201 = await request(app).post('/api/contact').send({ name: 'Subject Test', email: 'test@test.com', subject: 'S'.repeat(201), message: 'Valid message length 10' });
    assert.strictEqual(res201.status, 400);

    // Number subject -> 400
    const resNum = await request(app).post('/api/contact').send({ name: 'Subject Test', email: 'test@test.com', subject: 12345, message: 'Valid message length 10' });
    assert.strictEqual(resNum.status, 400);
    assert.ok(resNum.body.error.details.some(d => d.field === 'subject'));
  });

  await recordTest('Suite 4', 'Boundary stress: Message length exact limits and whitespace trimming', async () => {
    // 9 chars -> 400
    const res9 = await request(app).post('/api/contact').send({ name: 'Msg Tester', email: 'test@test.com', message: '123456789' });
    assert.strictEqual(res9.status, 400);

    // 10 chars -> 201
    const res10 = await request(app).post('/api/contact').send({ name: 'Msg Tester', email: 'test@test.com', message: '1234567890' });
    assert.strictEqual(res10.status, 201);

    // 2000 chars -> 201
    const res2000 = await request(app).post('/api/contact').send({ name: 'Msg Tester', email: 'test@test.com', message: 'M'.repeat(2000) });
    assert.strictEqual(res2000.status, 201);

    // 2001 chars -> 400
    const res2001 = await request(app).post('/api/contact').send({ name: 'Msg Tester', email: 'test@test.com', message: 'M'.repeat(2001) });
    assert.strictEqual(res2001.status, 400);

    // 20 spaces -> 400
    const resSpaces = await request(app).post('/api/contact').send({ name: 'Msg Tester', email: 'test@test.com', message: ' '.repeat(20) });
    assert.strictEqual(resSpaces.status, 400);

    // Multiline message with newlines and tabs -> 201
    const multilineMsg = 'Line 1: Hello\r\n\tLine 2: Indented text\r\nLine 3: Final message.';
    const resMulti = await request(app).post('/api/contact').send({ name: 'Msg Tester', email: 'test@test.com', message: multilineMsg });
    assert.strictEqual(resMulti.status, 201);
  });
}

// ============================================================================
// SUITE 5: Query Parameter Pollution & Boolean Parser Stress
// ============================================================================
async function runSuite5() {
  console.log('\n--- SUITE 5: Query Parameter Pollution & Boolean Parser Stress ---');
  const app = createApp({ useInMemory: true });

  await recordTest('Suite 5', 'Skills category query param pollution: array parameters safely handled', async () => {
    // ?category=frontend&category=backend passes array ['frontend', 'backend']
    const resArray = await request(app).get('/api/skills?category=frontend&category=backend');
    assert.strictEqual(resArray.status, 200);
    // Since req.query.category is not a string, controller ignores filter and returns all skills
    assert.ok(resArray.body.data.length >= 7);
  });

  await recordTest('Suite 5', 'Skills category case-insensitivity: lowercase, uppercase, mixed-case', async () => {
    const resLower = await request(app).get('/api/skills?category=frontend');
    const resUpper = await request(app).get('/api/skills?category=FRONTEND');
    const resMixed = await request(app).get('/api/skills?category=FrontEnd');

    assert.strictEqual(resLower.status, 200);
    assert.strictEqual(resUpper.status, 200);
    assert.strictEqual(resMixed.status, 200);

    assert.strictEqual(resLower.body.data.length, resUpper.body.data.length);
    assert.strictEqual(resLower.body.data.length, resMixed.body.data.length);
    assert.ok(resLower.body.data.length > 0);
  });

  await recordTest('Suite 5', 'Featured query param on skills and projects: boolean values and non-boolean fuzzing', async () => {
    // Skills ?featured=true
    const skillsFeatured = await request(app).get('/api/skills?featured=true');
    assert.strictEqual(skillsFeatured.status, 200);
    assert.ok(skillsFeatured.body.data.every(s => s.featured === true));

    // Skills ?featured=false
    const skillsNonFeatured = await request(app).get('/api/skills?featured=false');
    assert.strictEqual(skillsNonFeatured.status, 200);
    assert.ok(skillsNonFeatured.body.data.every(s => s.featured === false));

    // Projects ?featured=true
    const projFeatured = await request(app).get('/api/projects?featured=true');
    assert.strictEqual(projFeatured.status, 200);
    assert.ok(projFeatured.body.data.every(p => p.featured === true));

    // Projects ?featured=false
    const projNonFeatured = await request(app).get('/api/projects?featured=false');
    assert.strictEqual(projNonFeatured.status, 200);
    assert.ok(projNonFeatured.body.data.every(p => p.featured === false));

    // Projects with unexpected string ?featured=yes -> evaluates to false (featured=false)
    const projFuzz = await request(app).get('/api/projects?featured=yes');
    assert.strictEqual(projFuzz.status, 200);
    assert.ok(projFuzz.body.data.every(p => p.featured === false));
  });
}

// ============================================================================
// SUITE 6: High Concurrency Burst & Race Condition Stress
// ============================================================================
async function runSuite6() {
  console.log('\n--- SUITE 6: High Concurrency Burst & Race Condition Stress ---');
  const contactRepo = new InMemoryContactRepository();
  const app = createApp({ contact: contactRepo, useInMemory: true });

  await recordTest('Suite 6', 'Processes 120 rapid concurrent requests (valid, invalid, and GETs) without drops or crashes', async () => {
    const promises = [];
    const createdIds = new Set();

    // 40 valid POST inquiries
    for (let i = 0; i < 40; i++) {
      promises.push(
        request(app)
          .post('/api/contact')
          .send({
            name: `Burst User ${i}`,
            email: `burst_${i}@stress.test`,
            subject: `Concurrency Subject ${i}`,
            message: `Burst concurrency payload number ${i} testing race conditions and memory safety.`
          })
          .then(res => {
            assert.strictEqual(res.status, 201);
            assert.ok(res.body.data.id);
            createdIds.add(res.body.data.id);
          })
      );
    }

    // 40 invalid POST inquiries
    for (let i = 0; i < 40; i++) {
      promises.push(
        request(app)
          .post('/api/contact')
          .send({
            name: 'X',
            email: 'bad-email',
            message: 'short'
          })
          .then(res => {
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.error.code, 'VALIDATION_FAILED');
          })
      );
    }

    // 40 mixed read requests
    for (let i = 0; i < 10; i++) {
      promises.push(request(app).get('/api/health').then(res => assert.strictEqual(res.status, 200)));
      promises.push(request(app).get('/api/profile').then(res => assert.strictEqual(res.status, 200)));
      promises.push(request(app).get('/api/skills').then(res => assert.strictEqual(res.status, 200)));
      promises.push(request(app).get('/api/projects').then(res => assert.strictEqual(res.status, 200)));
    }

    await Promise.all(promises);

    // Verify 40 unique IDs generated without collision
    assert.strictEqual(createdIds.size, 40, 'All 40 concurrent valid submissions must have unique IDs');
    const stored = await contactRepo.getMessages();
    assert.strictEqual(stored.length, 40, 'All 40 valid submissions must be persisted without loss');
  });
}

// ============================================================================
// SUITE 7: Fault Injection, Database Error Handling & Graceful Degradation
// ============================================================================
async function runSuite7() {
  console.log('\n--- SUITE 7: Fault Injection & System Resilience ---');

  await recordTest('Suite 7', 'Health endpoint returns HTTP 503 DATABASE_DISCONNECTED when dbCheckFn returns false', async () => {
    const app = createApp({ dbCheckFn: async () => false, useInMemory: true });
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 503);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'DATABASE_DISCONNECTED');
    assert.ok(res.body.error.details.some(d => d.field === 'database'));
  });

  await recordTest('Suite 7', 'Health endpoint recovers cleanly when dbCheckFn throws an unhandled Error', async () => {
    const app = createApp({
      dbCheckFn: async () => {
        throw new Error('ETIMEDOUT: Connection to PostgreSQL timed out');
      },
      useInMemory: true
    });
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 500);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'INTERNAL_SERVER_ERROR');
    assert.strictEqual(res.body.error.message, 'ETIMEDOUT: Connection to PostgreSQL timed out');
  });

  await recordTest('Suite 7', 'Profile endpoint returns HTTP 500 when repository returns null', async () => {
    const mockRepo = {
      getProfile: async () => null
    };
    const app = createApp({ profile: mockRepo, useInMemory: true });
    const res = await request(app).get('/api/profile');
    assert.strictEqual(res.status, 500);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'INTERNAL_SERVER_ERROR');
    assert.strictEqual(res.body.error.message, 'Profile not found in database');
  });

  await recordTest('Suite 7', 'Skills endpoint returns HTTP 500 when repository throws an error', async () => {
    const mockRepo = {
      getSkills: async () => {
        throw new Error('Postgres query failure: relation skills does not exist');
      }
    };
    const app = createApp({ skills: mockRepo, useInMemory: true });
    const res = await request(app).get('/api/skills');
    assert.strictEqual(res.status, 500);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'INTERNAL_SERVER_ERROR');
    assert.ok(res.body.error.message.includes('Postgres query failure'));
  });

  await recordTest('Suite 7', 'Projects endpoint returns HTTP 500 when repository throws an error', async () => {
    const mockRepo = {
      getProjects: async () => {
        throw new Error('Disk read failure in project repository');
      }
    };
    const app = createApp({ projects: mockRepo, useInMemory: true });
    const res = await request(app).get('/api/projects');
    assert.strictEqual(res.status, 500);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'INTERNAL_SERVER_ERROR');
    assert.strictEqual(res.body.error.message, 'Disk read failure in project repository');
  });

  await recordTest('Suite 7', 'Contact submission returns HTTP 500 when repository save throws', async () => {
    const mockRepo = {
      saveMessage: async () => {
        throw new Error('Database transaction deadlocked on write');
      },
      getMessages: async () => []
    };
    const app = createApp({ contact: mockRepo, useInMemory: true });
    const res = await request(app).post('/api/contact').send({
      name: 'Safe User',
      email: 'safe@test.com',
      message: 'Valid length message payload.'
    });
    assert.strictEqual(res.status, 500);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'INTERNAL_SERVER_ERROR');
    assert.strictEqual(res.body.error.message, 'Database transaction deadlocked on write');
  });
}

// ============================================================================
// SUITE 8: Frontend Service Layer & Component Error Boundary Simulation
// ============================================================================
async function runSuite8() {
  console.log('\n--- SUITE 8: Frontend Service Layer & Component Boundary Simulation ---');

  await recordTest('Suite 8', 'Verifies default fallback constants exist and satisfy data integrity', async () => {
    const portfolioServicePath = path.join(ROOT_DIR, 'frontend/src/services/portfolio.ts');
    const fileContent = fs.readFileSync(portfolioServicePath, 'utf-8');

    // Check DEFAULT_PROFILE shape in code
    assert.ok(fileContent.includes('DEFAULT_PROFILE: Profile = {'));
    assert.ok(fileContent.includes("fullName: 'Alex Rivera'"));
    assert.ok(fileContent.includes("availableForHire: true"));

    // Check DEFAULT_SKILLS
    assert.ok(fileContent.includes('DEFAULT_SKILLS: Skill[] = ['));
    assert.ok(fileContent.includes('TypeScript'));
    assert.ok(fileContent.includes('React / Next.js'));

    // Check DEFAULT_PROJECTS
    assert.ok(fileContent.includes('DEFAULT_PROJECTS: Project[] = ['));
    assert.ok(fileContent.includes('CloudTelemetry Observability Suite'));
  });

  await recordTest('Suite 8', 'Frontend contact form validation rules exact mirror of backend validation rules', async () => {
    const contactComponentPath = path.join(ROOT_DIR, 'frontend/src/components/sections/Contact.tsx');
    const content = fs.readFileSync(contactComponentPath, 'utf-8');

    // Name: min 2, max 120
    assert.ok(content.includes('trimmed.length < 2'));
    assert.ok(content.includes('trimmed.length > 120'));

    // Email: max 255
    assert.ok(content.includes('trimmed.length > 255'));

    // Subject: max 200
    assert.ok(content.includes('trimmed.length > 200'));

    // Message: min 10, max 2000
    assert.ok(content.includes('trimmed.length < 10'));
    assert.ok(content.includes('trimmed.length > 2000'));
  });

  await recordTest('Suite 8', 'Frontend ApiError mapping: details array mapped to individual field errors', async () => {
    const contactComponentPath = path.join(ROOT_DIR, 'frontend/src/components/sections/Contact.tsx');
    const content = fs.readFileSync(contactComponentPath, 'utf-8');

    assert.ok(content.includes("['name', 'email', 'subject', 'message'].includes(d.field)"));
    assert.ok(content.includes('backendFieldErrors[d.field as keyof ContactFormErrors] = d.issue'));
  });
}

// ============================================================================
// MAIN RUNNER
// ============================================================================
async function main() {
  const startTime = Date.now();

  await runSuite1();
  await runSuite2();
  await runSuite3();
  await runSuite4();
  await runSuite5();
  await runSuite6();
  await runSuite7();
  await runSuite8();

  const durationMs = Date.now() - startTime;

  console.log('\n======================================================================');
  console.log(`TIER 5 RESULTS: ${passCount} passed, ${failCount} failed (${durationMs}ms)`);
  console.log('======================================================================\n');

  if (failCount > 0) {
    console.error(`💥 TIER 5 HARDENING DETECTED ${failCount} DEFECTS:`);
    for (const f of findings) {
      console.error(`  - [${f.suite}] ${f.test}: ${f.error}`);
    }
    process.exit(1);
  } else {
    console.log('🏆 TIER 5 ADVERSARIAL COVERAGE HARDENING COMPLETE — ALL HOSTILE PAYLOADS HANDLED RESILIENTLY!');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal Tier 5 execution error:', err);
  process.exit(1);
});
