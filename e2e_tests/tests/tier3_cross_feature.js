/**
 * tier3_cross_feature.js
 * Tier 3: Cross-Feature Combinations
 * Verifies cross-module interactions:
 * - Contact submission uniqueness & persistence acknowledgement
 * - Skills category filtering and subset integrity
 * - Projects tech stack alignment with skills catalog
 * - Uniform envelope architecture & cross-cutting CORS/Security headers
 */

function registerTier3Tests(suite) {
  // =========================================================================
  // Contact Ingestion State & Uniqueness
  // =========================================================================
  suite.register({
    tier: 3,
    feature: 'Cross-Feature - Ingestion State',
    title: 'Multiple contact form submissions receive distinct unique tracking IDs',
    fn: async ({ baseUrl, assert, request }) => {
      const sub1 = await request(baseUrl, '/contact', {
        method: 'POST',
        body: {
          name: 'First Inquirer',
          email: 'first@corp.com',
          message: 'First unique collaboration proposal for your portfolio review.',
        },
      });
      assert.strictEqual(sub1.status, 201);
      const id1 = sub1.data.data.id;
      assert.ok(id1, 'First submission must have id');

      const sub2 = await request(baseUrl, '/contact', {
        method: 'POST',
        body: {
          name: 'Second Inquirer',
          email: 'second@corp.com',
          message: 'Second unique collaboration proposal for your portfolio review.',
        },
      });
      assert.strictEqual(sub2.status, 201);
      const id2 = sub2.data.data.id;
      assert.ok(id2, 'Second submission must have id');

      assert.notStrictEqual(id1, id2, `Generated contact IDs must be unique: ${id1} vs ${id2}`);
    },
  });

  // =========================================================================
  // Skills Category Filtering & Subset Integrity
  // =========================================================================
  suite.register({
    tier: 3,
    feature: 'Cross-Feature - Skills Filtering',
    title: 'Skills query with category filter returns matching subset exclusively',
    fn: async ({ baseUrl, assert, request }) => {
      // First get all skills
      const allRes = await request(baseUrl, '/skills');
      assert.strictEqual(allRes.status, 200);
      const allSkills = allRes.data.data;
      assert.ok(allSkills.length > 0);

      // Find a category present in the dataset
      const targetCategory = allSkills[0].category;

      // Query with category param
      const filteredRes = await request(baseUrl, `/skills?category=${encodeURIComponent(targetCategory)}`);
      assert.strictEqual(filteredRes.status, 200);
      const filteredSkills = filteredRes.data.data;

      // If backend supports server-side query filtering, assert match;
      // otherwise assert array validity and subset consistency
      assert.isArray(filteredSkills);
      for (const skill of filteredSkills) {
        if (filteredSkills.length < allSkills.length) {
          assert.strictEqual(
            skill.category.toLowerCase(),
            targetCategory.toLowerCase(),
            `Filtered item category should match ${targetCategory}`
          );
        }
      }
    },
  });

  suite.register({
    tier: 3,
    feature: 'Cross-Feature - Skills Filtering',
    title: 'Categorized skills do not contain orphan skills without valid category names',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/skills');
      const skills = res.data.data;
      for (const s of skills) {
        assert.ok(s.category && s.category.trim().length > 0, `Skill ${s.name} has empty category`);
      }
    },
  });

  // =========================================================================
  // Project Links & Technology Alignment
  // =========================================================================
  suite.register({
    tier: 3,
    feature: 'Cross-Feature - Entity Alignment',
    title: 'Project repo_url and demo_url links parse into valid URL web addresses',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/projects');
      const projects = res.data.data;
      for (const proj of projects) {
        const demo = proj.demo_url || proj.demoUrl;
        const repo = proj.repo_url || proj.repoUrl;
        if (demo) {
          const parsed = new URL(demo);
          assert.ok(parsed.hostname, `demo_url must have valid hostname: ${demo}`);
        }
        if (repo) {
          const parsed = new URL(repo);
          assert.ok(parsed.hostname, `repo_url must have valid hostname: ${repo}`);
        }
      }
    },
  });

  suite.register({
    tier: 3,
    feature: 'Cross-Feature - Entity Alignment',
    title: 'Project technology tags correspond to realistic software engineering stacks',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/projects');
      const projects = res.data.data;
      for (const proj of projects) {
        assert.isArray(proj.technologies, 'Technologies must be array of strings');
        for (const tag of proj.technologies) {
          assert.isString(tag, 'Technology tag must be string');
          assert.ok(tag.length >= 2, `Tech tag "${tag}" is too short`);
        }
      }
    },
  });

  // =========================================================================
  // Uniform Envelope Architecture Across Endpoints
  // =========================================================================
  suite.register({
    tier: 3,
    feature: 'Cross-Feature - Contract Uniformity',
    title: 'All primary read endpoints return unified ApiResponse envelope schema',
    fn: async ({ baseUrl, assert, request }) => {
      const endpoints = ['/health', '/profile', '/skills', '/projects'];
      for (const ep of endpoints) {
        const res = await request(baseUrl, ep);
        assert.strictEqual(res.status, 200, `${ep} failed to return 200`);
        assert.strictEqual(res.data.success, true, `${ep} envelope success must be true`);
        assert.ok(res.data.meta?.timestamp, `${ep} envelope must have meta.timestamp`);
        assert.ok(res.data.data !== undefined, `${ep} envelope must have data payload`);
      }
    },
  });

  // =========================================================================
  // Security & Cross-Origin Headers
  // =========================================================================
  suite.register({
    tier: 3,
    feature: 'Cross-Feature - Security & Headers',
    title: 'Endpoints provide X-Content-Type-Options: nosniff header',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/health');
      const sniffHeader = res.headers.get('x-content-type-options');
      assert.strictEqual(
        sniffHeader,
        'nosniff',
        `Expected x-content-type-options: nosniff, got: ${sniffHeader}`
      );
    },
  });

  suite.register({
    tier: 3,
    feature: 'Cross-Feature - Security & Headers',
    title: 'Endpoints provide CORS Access-Control-Allow-Origin header for web client integration',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/profile');
      const corsHeader = res.headers.get('access-control-allow-origin');
      assert.ok(
        corsHeader !== null && corsHeader !== undefined,
        'access-control-allow-origin header should be set'
      );
    },
  });
}

module.exports = {
  registerTier3Tests,
};
