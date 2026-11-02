import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import http from 'node:http';
import request from 'supertest';
import { createApp } from '../backend/dist/backend/src/app.js';
import { VALIDATION_RULES } from '@portfolio/shared';

const ROOT_DIR = path.resolve(import.meta.dirname, '..');

console.log('======================================================================');
console.log('🔥 EMPIRICAL ADVERSARIAL CHALLENGER SUITE — MILESTONE 3');
console.log('======================================================================\n');

let passCount = 0;
let failCount = 0;
const findings = [];

async function recordTest(name, fn) {
  try {
    await fn();
    passCount++;
    console.log(`  ✔ [PASS] ${name}`);
  } catch (err) {
    failCount++;
    console.error(`  ✖ [FAIL] ${name}: ${err.message}`);
    findings.push({ test: name, error: err.message, stack: err.stack });
  }
}

// ============================================================================
// SUITE 1: Cross-Workspace Dependency Graph & Circular Dependency Detection
// ============================================================================
async function runSuite1() {
  console.log('\n--- SUITE 1: Cross-Workspace Dependency Graph & Circular Dependency Audit ---');

  await recordTest('Workspace Package Configurations & Boundary Rules', () => {
    const rootPkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8'));
    assert.deepStrictEqual(rootPkg.workspaces, ['shared', 'backend', 'frontend']);

    const sharedPkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'shared/package.json'), 'utf-8'));
    const backendPkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'backend/package.json'), 'utf-8'));
    const frontendPkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'frontend/package.json'), 'utf-8'));

    // Boundary check: shared must not depend on backend or frontend
    const sharedAllDeps = { ...sharedPkg.dependencies, ...sharedPkg.devDependencies };
    assert.ok(!sharedAllDeps['@portfolio/backend'], 'shared must not depend on @portfolio/backend');
    assert.ok(!sharedAllDeps['@portfolio/frontend'], 'shared must not depend on @portfolio/frontend');

    // Boundary check: backend must not depend on frontend
    const backendAllDeps = { ...backendPkg.dependencies, ...backendPkg.devDependencies };
    assert.ok(!backendAllDeps['@portfolio/frontend'], 'backend must not depend on @portfolio/frontend');

    // Boundary check: frontend must not depend on backend
    const frontendAllDeps = { ...frontendPkg.dependencies, ...frontendPkg.devDependencies };
    assert.ok(!frontendAllDeps['@portfolio/backend'], 'frontend must not depend on @portfolio/backend');

    // shared must be depended on by backend and frontend
    assert.ok(backendPkg.dependencies['@portfolio/shared'], 'backend must depend on @portfolio/shared');
    assert.ok(frontendPkg.dependencies['@portfolio/shared'], 'frontend must depend on @portfolio/shared');
  });

  await recordTest('Static AST & Regex Import Graph Analysis for Cycles and Missing Paths', () => {
    // Scan all source files in shared, backend, and frontend
    const workspaces = ['shared', 'backend', 'frontend'];
    const fileGraph = new Map(); // file -> [importedFiles]

    function scanDir(dir) {
      const files = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...scanDir(fullPath));
        } else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
      return files;
    }

    const allFiles = workspaces.flatMap(ws => scanDir(path.join(ROOT_DIR, ws)));
    const importRegex = /(?:import|export)\s+.*?from\s+['"](.*?)['"]/g;
    const dynamicImportRegex = /import\s*\(\s*['"](.*?)['"]\s*\)/g;

    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const imports = [];
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }
      while ((match = dynamicImportRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }

      const resolvedImports = [];
      for (const imp of imports) {
        // Check relative imports
        if (imp.startsWith('.')) {
          const dir = path.dirname(file);
          let target = path.resolve(dir, imp);
          // Check extensions (.js -> .ts, etc.)
          let exists = fs.existsSync(target);
          if (!exists) {
            const candidates = [
              target + '.ts',
              target + '.tsx',
              target + '.js',
              target + '.jsx',
              target + '.mjs',
              target.replace(/\.js$/, '.ts'),
              target.replace(/\.js$/, '.tsx'),
              path.join(target, 'index.ts'),
              path.join(target, 'index.tsx'),
              path.join(target, 'index.js'),
            ];
            let found = null;
            for (const cand of candidates) {
              if (fs.existsSync(cand)) {
                found = cand;
                break;
              }
            }
            if (found) {
              target = found;
            } else {
              throw new Error(`Unresolvable relative import '${imp}' in ${path.relative(ROOT_DIR, file)}`);
            }
          }
          resolvedImports.push(target);
        }
      }
      fileGraph.set(file, resolvedImports);
    }

    // DFS Cycle Detection
    const visited = new Set();
    const recStack = new Set();
    const cycles = [];

    function checkCycle(node, pathStack = []) {
      visited.add(node);
      recStack.add(node);
      pathStack.push(node);

      const neighbors = fileGraph.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          checkCycle(neighbor, [...pathStack]);
        } else if (recStack.has(neighbor)) {
          cycles.push([...pathStack, neighbor].map(f => path.relative(ROOT_DIR, f)).join(' -> '));
        }
      }

      recStack.delete(node);
    }

    for (const file of allFiles) {
      if (!visited.has(file)) {
        checkCycle(file);
      }
    }

    assert.strictEqual(cycles.length, 0, `Circular dependencies detected: ${cycles.join('; ')}`);
  });

  await recordTest('NodeNext ESM Extension Conformance in Backend Source', () => {
    // In NodeNext module resolution, all relative imports in TypeScript source must specify .js extension
    const backendSrcDir = path.join(ROOT_DIR, 'backend/src');
    function getTsFiles(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const files = [];
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) files.push(...getTsFiles(full));
        else if (entry.name.endsWith('.ts')) files.push(full);
      }
      return files;
    }

    const backendFiles = getTsFiles(backendSrcDir);
    const nonCompliant = [];

    for (const file of backendFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const match = /(?:import|export).*?from\s+['"](\.[^'"]+)['"]/.exec(line);
        if (match) {
          const importPath = match[1];
          if (!importPath.endsWith('.js') && !importPath.endsWith('.json')) {
            nonCompliant.push(`${path.relative(ROOT_DIR, file)}:${idx + 1} -> '${importPath}'`);
          }
        }
      });
    }

    assert.strictEqual(nonCompliant.length, 0, `Non-compliant ESM relative imports lacking .js extension: ${nonCompliant.join(', ')}`);
  });
}

// ============================================================================
// SUITE 2: Fullstack Contract Consistency & Boundary Invariants
// ============================================================================
async function runSuite2() {
  console.log('\n--- SUITE 2: Fullstack Contract Consistency & Boundary Invariants ---');

  const app = createApp({ useInMemory: true });

  await recordTest('Validation Rules Shared Constant Alignment', () => {
    assert.strictEqual(VALIDATION_RULES.NAME.MIN, 2);
    assert.strictEqual(VALIDATION_RULES.NAME.MAX, 120);
    assert.strictEqual(VALIDATION_RULES.MESSAGE.MIN, 10);
    assert.strictEqual(VALIDATION_RULES.MESSAGE.MAX, 2000);
    assert.strictEqual(VALIDATION_RULES.SUBJECT.MAX, 200);
    assert.strictEqual(VALIDATION_RULES.EMAIL.MAX, 255);
  });

  await recordTest('Health Endpoint Contract & Schema Conformance', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(typeof res.body.meta.timestamp, 'string');
    assert.ok(['UP', 'DOWN'].includes(res.body.data.status));
    assert.ok(['CONNECTED', 'DISCONNECTED'].includes(res.body.data.database));
    assert.strictEqual(typeof res.body.data.uptimeSeconds, 'number');
    assert.strictEqual(typeof res.body.data.version, 'string');
    // Nosniff and CORS headers
    assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
  });

  await recordTest('Profile Endpoint Contract & Schema Conformance', async () => {
    const res = await request(app).get('/api/profile');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    const profile = res.body.data;
    assert.strictEqual(typeof profile.id, 'string');
    assert.strictEqual(typeof profile.fullName, 'string');
    assert.strictEqual(typeof profile.title, 'string');
    assert.strictEqual(typeof profile.bio, 'string');
    assert.strictEqual(typeof profile.socialLinks, 'object');
    assert.strictEqual(typeof profile.availableForHire, 'boolean');
  });

  await recordTest('Skills Endpoint Contract & Query Filtering', async () => {
    const resAll = await request(app).get('/api/skills');
    assert.strictEqual(resAll.status, 200);
    assert.strictEqual(resAll.body.success, true);
    assert.ok(Array.isArray(resAll.body.data));
    assert.ok(resAll.body.data.length >= 7);

    // Verify item shape
    const item = resAll.body.data[0];
    assert.ok(item.id && item.name && item.category && typeof item.proficiency === 'number');

    // Filter by category
    const resFrontend = await request(app).get('/api/skills?category=frontend');
    assert.strictEqual(resFrontend.status, 200);
    assert.ok(resFrontend.body.data.every(s => s.category.toLowerCase() === 'frontend'));

    // Filter by non-existent category
    const resEmpty = await request(app).get('/api/skills?category=nonexistent_xyz');
    assert.strictEqual(resEmpty.status, 200);
    assert.deepStrictEqual(resEmpty.body.data, []);
  });

  await recordTest('Projects Endpoint Contract & Featured Filter', async () => {
    const resAll = await request(app).get('/api/projects');
    assert.strictEqual(resAll.status, 200);
    assert.strictEqual(resAll.body.success, true);
    assert.ok(Array.isArray(resAll.body.data));

    const item = resAll.body.data[0];
    assert.ok(item.id && item.title && item.slug && item.description && Array.isArray(item.technologies));

    // Filter featured=true
    const resFeatured = await request(app).get('/api/projects?featured=true');
    assert.strictEqual(resFeatured.status, 200);
    assert.ok(resFeatured.body.data.every(p => p.featured === true));

    // Filter featured=false
    const resNonFeatured = await request(app).get('/api/projects?featured=false');
    assert.strictEqual(resNonFeatured.status, 200);
    assert.ok(resNonFeatured.body.data.every(p => p.featured === false));
  });

  await recordTest('Contact Boundary Inputs (Exact Min/Max Lengths)', async () => {
    // 1. Name boundaries
    // Name = 1 char -> 400
    const res1 = await request(app).post('/api/contact').send({
      name: 'A',
      email: 'alex@example.com',
      message: 'Hello, this is a test message.'
    });
    assert.strictEqual(res1.status, 400);

    // Name = 2 chars -> 201
    const res2 = await request(app).post('/api/contact').send({
      name: 'Al',
      email: 'alex@example.com',
      message: 'Hello, this is a test message.'
    });
    assert.strictEqual(res2.status, 201);

    // Name = 120 chars -> 201
    const res3 = await request(app).post('/api/contact').send({
      name: 'N'.repeat(120),
      email: 'alex@example.com',
      message: 'Hello, this is a test message.'
    });
    assert.strictEqual(res3.status, 201);

    // Name = 121 chars -> 400
    const res4 = await request(app).post('/api/contact').send({
      name: 'N'.repeat(121),
      email: 'alex@example.com',
      message: 'Hello, this is a test message.'
    });
    assert.strictEqual(res4.status, 400);

    // 2. Message boundaries
    // Message = 9 chars -> 400
    const res5 = await request(app).post('/api/contact').send({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      message: '123456789'
    });
    assert.strictEqual(res5.status, 400);

    // Message = 10 chars -> 201
    const res6 = await request(app).post('/api/contact').send({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      message: '1234567890'
    });
    assert.strictEqual(res6.status, 201);

    // Message = 2000 chars -> 201
    const res7 = await request(app).post('/api/contact').send({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      message: 'M'.repeat(2000)
    });
    assert.strictEqual(res7.status, 201);

    // Message = 2001 chars -> 400
    const res8 = await request(app).post('/api/contact').send({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      message: 'M'.repeat(2001)
    });
    assert.strictEqual(res8.status, 400);

    // 3. Subject boundaries
    // Subject = 200 chars -> 201
    const res9 = await request(app).post('/api/contact').send({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      subject: 'S'.repeat(200),
      message: 'Valid length message.'
    });
    assert.strictEqual(res9.status, 201);

    // Subject = 201 chars -> 400
    const res10 = await request(app).post('/api/contact').send({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      subject: 'S'.repeat(201),
      message: 'Valid length message.'
    });
    assert.strictEqual(res10.status, 400);
  });
}

// ============================================================================
// SUITE 3: Adversarial Stress, Concurrency & Unexpected Payloads
// ============================================================================
async function runSuite3() {
  console.log('\n--- SUITE 3: Concurrency, Malformed Payloads & Security Stress ---');

  const app = createApp({ useInMemory: true });

  await recordTest('Rapid Concurrency Burst (150 Mixed Concurrent Requests)', async () => {
    const promises = [];
    const submittedIds = new Set();

    // 50 valid POST contact
    for (let i = 0; i < 50; i++) {
      promises.push(
        request(app)
          .post('/api/contact')
          .send({
            name: `User ${i}`,
            email: `concurrent${i}@example.com`,
            message: `Concurrent burst message payload number ${i} testing race conditions.`
          })
          .then(res => {
            assert.strictEqual(res.status, 201);
            assert.ok(res.body.data.id);
            submittedIds.add(res.body.data.id);
          })
      );
    }

    // 50 invalid POST contact (should cleanly reject without crashing)
    for (let i = 0; i < 50; i++) {
      promises.push(
        request(app)
          .post('/api/contact')
          .send({ name: 'X', email: 'invalid-email', message: 'short' })
          .then(res => {
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.error.code, 'VALIDATION_FAILED');
          })
      );
    }

    // 50 GET requests across endpoints
    for (let i = 0; i < 25; i++) {
      promises.push(
        request(app).get('/api/health').then(res => assert.strictEqual(res.status, 200))
      );
      promises.push(
        request(app).get('/api/skills').then(res => assert.strictEqual(res.status, 200))
      );
    }

    await Promise.all(promises);
    assert.strictEqual(submittedIds.size, 50, 'All 50 concurrent submissions must have unique IDs without collision');
  });

  await recordTest('Malformed JSON Syntax & Body Variations', async () => {
    // Malformed JSON string
    const resMalformed = await request(app)
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send('{"name": "Bad JSON, missing close brace');
    assert.strictEqual(resMalformed.status, 400, 'Malformed JSON must return HTTP 400 Bad Request');
    assert.strictEqual(resMalformed.body.success, false);

    // Array body instead of object
    const resArray = await request(app)
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send([{ name: 'Jane', email: 'jane@example.com', message: 'Hello valid message' }]);
    assert.strictEqual(resArray.status, 400);
    assert.strictEqual(resArray.body.error.code, 'VALIDATION_FAILED');

    // Primitive number body
    const resNumber = await request(app)
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send('12345');
    assert.strictEqual(resNumber.status, 400);

    // Empty body
    const resEmpty = await request(app)
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send('');
    assert.strictEqual(resEmpty.status, 400);
  });

  await recordTest('Security: Prototype Pollution Attempt & Extra Field Injection', async () => {
    const maliciousPayload = {
      name: 'Safe Visitor',
      email: 'visitor@example.com',
      message: 'Legitimate looking message with payload injection.',
      __proto__: { isAdmin: true, polluted: 'pwned' },
      constructor: { prototype: { hijacked: true } },
      role: 'admin',
      isVerified: true
    };

    const res = await request(app)
      .post('/api/contact')
      .send(maliciousPayload);

    assert.strictEqual(res.status, 201, 'Should accept valid fields');
    // Verify global Object prototype was not polluted
    const cleanObj = {};
    assert.strictEqual(cleanObj.isAdmin, undefined, 'Prototype pollution must not succeed');
    assert.strictEqual(cleanObj.polluted, undefined);
    assert.strictEqual(cleanObj.hijacked, undefined);
  });

  await recordTest('Security: SQL Injection & XSS Payloads in Contact Fields', async () => {
    // SQLi payloads
    const sqliPayload = {
      name: "Alex'); DROP TABLE contact_messages; --",
      email: 'hacker@safe-domain.com',
      subject: "UNION SELECT * FROM profiles WHERE '1'='1",
      message: "SELECT * FROM contact_messages WHERE id = '1' OR '1'='1';"
    };

    const sqliRes = await request(app).post('/api/contact').send(sqliPayload);
    assert.strictEqual(sqliRes.status, 201, 'SQL injection strings must be safely handled as text');
    assert.ok(sqliRes.body.data.id);

    // XSS payloads
    const xssPayload = {
      name: "<script>alert('xss')</script>",
      email: 'xss@example.com',
      subject: "<img src=x onerror=alert(1)>",
      message: "<svg onload=alert(document.cookie)>Hello world</svg>"
    };

    const xssRes = await request(app).post('/api/contact').send(xssPayload);
    assert.strictEqual(xssRes.status, 201);
  });

  await recordTest('Payload Size Limits (64KB Enforcement)', async () => {
    // Send 70KB body
    const hugeMessage = 'A'.repeat(70 * 1024);
    const res = await request(app)
      .post('/api/contact')
      .send({
        name: 'Huge Sender',
        email: 'huge@example.com',
        message: hugeMessage
      });
    // Express returns 413 Payload Too Large when express.json({ limit: '64kb' }) is exceeded
    assert.strictEqual(res.status, 413, 'Oversized payloads > 64KB must return HTTP 413');
  });

  await recordTest('404 Handler for Unknown Routes', async () => {
    const res = await request(app).get('/api/unknown-route-12345');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'NOT_FOUND');
  });
}

// ============================================================================
// SUITE 4: Frontend Proxy & Coordination Pipeline
// ============================================================================
async function runSuite4() {
  console.log('\n--- SUITE 4: Frontend Proxy & Coordination Pipeline ---');

  await recordTest('Frontend Landing Page, Health & Build Manifest Verification', async () => {
    // Verify frontend build manifest exists
    const manifestPath = path.join(ROOT_DIR, 'frontend/dist/build-manifest.json');
    assert.ok(fs.existsSync(manifestPath), 'frontend/dist/build-manifest.json must exist');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    assert.strictEqual(manifest.status, 'SUCCESS');
    assert.ok(Array.isArray(manifest.routes) && manifest.routes.length > 0);

    // Verify frontend server HTML generation
    const serverModulePath = path.join(ROOT_DIR, 'frontend/scripts/server.mjs');
    const content = fs.readFileSync(serverModulePath, 'utf-8');
    // Verify design tokens and required sections
    assert.ok(content.includes('id="about"'), 'Frontend must render About section');
    assert.ok(content.includes('id="skills"'), 'Frontend must render Skills section');
    assert.ok(content.includes('id="projects"'), 'Frontend must render Projects section');
    assert.ok(content.includes('id="contact"'), 'Frontend must render Contact form');
    assert.ok(content.includes('tailwind.config'), 'Frontend must include Tailwind configuration');
  });

  await recordTest('Frontend Server HTTP Endpoints via Supertest', async () => {
    const { default: frontendServer } = await import('../frontend/scripts/server.mjs');
    const handler = (req, res) => frontendServer.emit('request', req, res);

    // 1. Health check
    const healthRes = await request(handler).get('/health');
    assert.strictEqual(healthRes.status, 200);
    assert.strictEqual(healthRes.body.status, 'UP');
    assert.strictEqual(healthRes.body.service, 'portfolio-frontend');

    // 2. Default HTML page
    const pageRes = await request(handler).get('/');
    assert.strictEqual(pageRes.status, 200);
    assert.ok(pageRes.text.includes('Alex Rivera'));
    assert.ok(pageRes.text.includes('id="contact-form"'));

    // 3. Build manifest endpoint
    const manifestRes = await request(handler).get('/build-manifest.json');
    assert.strictEqual(manifestRes.status, 200);
    assert.strictEqual(manifestRes.body.status, 'SUCCESS');

    // 4. Proxy when backend is unreachable returns 503
    const proxyRes = await request(handler).get('/api/health');
    // If backend is not listening on 5001, proxy returns 503
    // If backend is listening, it returns 200
    assert.ok([200, 503].includes(proxyRes.status));
    if (proxyRes.status === 503) {
      assert.strictEqual(proxyRes.body.error.code, 'BACKEND_UNAVAILABLE');
    }

    frontendServer.close();
  });
}

async function main() {
  const startTime = Date.now();
  await runSuite1();
  await runSuite2();
  await runSuite3();
  await runSuite4();
  const elapsed = Date.now() - startTime;

  console.log('\n======================================================================');
  console.log(`SUMMARY: ${passCount} passed, ${failCount} failed (${elapsed}ms)`);
  console.log('======================================================================\n');

  if (failCount > 0) {
    console.error(`FAILED with ${failCount} findings.`);
    process.exit(1);
  } else {
    console.log('🎉 ALL EMPIRICAL ADVERSARIAL CHALLENGES PASSED!');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal challenger execution error:', err);
  process.exit(1);
});
