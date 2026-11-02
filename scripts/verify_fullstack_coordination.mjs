import assert from 'node:assert/strict';
import { createApp } from '../backend/dist/backend/src/app.js';
import request from 'supertest';

console.log('=======================================================');
console.log('🔄 Verifying Fullstack Coordination & API Integration');
console.log('=======================================================');

async function runCoordinationVerification() {
  const app = createApp({
    dbCheckFn: async () => true,
    useInMemory: true,
  });

  // 1. Health check endpoint (Objective 3: curl http://127.0.0.1:5001/api/health returning HTTP 200 UP)
  console.log('\n[1/5] Verifying Health Check Endpoint (GET /api/health)...');
  const healthRes = await request(app).get('/api/health');
  assert.strictEqual(healthRes.status, 200, 'Health endpoint must return HTTP 200');
  assert.strictEqual(healthRes.body.success, true);
  assert.strictEqual(healthRes.body.data.status, 'UP', 'Health status must be UP');
  assert.strictEqual(healthRes.body.data.database, 'CONNECTED');
  assert.ok(typeof healthRes.body.data.uptimeSeconds === 'number');
  console.log('✔ Health endpoint returned HTTP 200 with status "UP":', JSON.stringify(healthRes.body.data));

  // 2. Profile endpoint
  console.log('\n[2/5] Verifying Profile Data Endpoint (GET /api/profile)...');
  const profileRes = await request(app).get('/api/profile');
  assert.strictEqual(profileRes.status, 200, 'Profile endpoint must return HTTP 200');
  assert.strictEqual(profileRes.body.success, true);
  assert.strictEqual(profileRes.body.data.fullName, 'Alex Rivera');
  assert.ok(profileRes.body.data.title.includes('Fullstack'));
  console.log(`✔ Profile data verified: ${profileRes.body.data.fullName} - ${profileRes.body.data.title}`);

  // 3. Skills endpoint
  console.log('\n[3/5] Verifying Skills Listing Endpoint (GET /api/skills)...');
  const skillsRes = await request(app).get('/api/skills');
  assert.strictEqual(skillsRes.status, 200, 'Skills endpoint must return HTTP 200');
  assert.strictEqual(skillsRes.body.success, true);
  assert.ok(Array.isArray(skillsRes.body.data) && skillsRes.body.data.length > 0);
  console.log(`✔ Skills verified: ${skillsRes.body.data.length} skills across categories`);

  // 4. Projects endpoint
  console.log('\n[4/5] Verifying Projects Listing Endpoint (GET /api/projects)...');
  const projectsRes = await request(app).get('/api/projects');
  assert.strictEqual(projectsRes.status, 200, 'Projects endpoint must return HTTP 200');
  assert.strictEqual(projectsRes.body.success, true);
  assert.ok(Array.isArray(projectsRes.body.data) && projectsRes.body.data.length > 0);
  console.log(`✔ Projects verified: ${projectsRes.body.data.length} projects retrieved`);

  // 5. Contact Ingestion & Validation
  console.log('\n[5/5] Verifying Contact Form Submission (POST /api/contact)...');
  // 5a. Valid Submission
  const validContact = {
    name: 'Sarah Connor',
    email: 'sarah.connor@cyberdyne.tech',
    subject: 'Fullstack Architectural Inquiry',
    message: 'Hello Alex, I would like to discuss a senior architecture role with our team.',
  };
  const contactRes = await request(app)
    .post('/api/contact')
    .send(validContact)
    .set('Content-Type', 'application/json');
  assert.strictEqual(contactRes.status, 201, 'Valid submission must return HTTP 201');
  assert.strictEqual(contactRes.body.success, true);
  assert.ok(contactRes.body.data.id, 'Submission must return a tracking ID');
  console.log(`✔ Contact submission succeeded with HTTP 201. Tracking ID: ${contactRes.body.data.id}`);

  // 5b. Invalid Submission (Validation error)
  const invalidContact = {
    name: 'A', // Too short
    email: 'not-an-email',
    message: 'short', // Too short
  };
  const invalidRes = await request(app)
    .post('/api/contact')
    .send(invalidContact)
    .set('Content-Type', 'application/json');
  assert.strictEqual(invalidRes.status, 400, 'Invalid submission must return HTTP 400');
  assert.strictEqual(invalidRes.body.success, false);
  assert.strictEqual(invalidRes.body.error.code, 'VALIDATION_FAILED');
  console.log(`✔ Invalid contact submission cleanly rejected with HTTP 400 VALIDATION_FAILED.`);

  console.log('\n=======================================================');
  console.log('🎉 Fullstack Coordination Verification Passed 100%!');
  console.log('=======================================================');
}

runCoordinationVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
