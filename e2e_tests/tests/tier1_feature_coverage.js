/**
 * tier1_feature_coverage.js
 * Tier 1: Feature Coverage (F-01 through F-05)
 * Minimum 5 test cases per feature verifying primary behavior & response envelope contracts.
 */

function registerTier1Tests(suite) {
  // =========================================================================
  // F-01: System Health Check (5 tests)
  // =========================================================================
  suite.register({
    tier: 1,
    feature: 'F-01 System Health Check',
    title: 'GET /api/health returns HTTP 200 OK',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/health');
      assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
    },
  });

  suite.register({
    tier: 1,
    feature: 'F-01 System Health Check',
    title: 'Health check response conforms to ApiResponse envelope specification',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/health');
      assert.ok(res.data, 'Expected response body');
      assert.strictEqual(res.data.success, true, 'Envelope success should be true');
      assert.ok(res.data.meta, 'Envelope meta object should exist');
      assert.isString(res.data.meta.timestamp, 'meta.timestamp should be an ISO string');
      assert.ok(!Number.isNaN(Date.parse(res.data.meta.timestamp)), 'meta.timestamp should parse as valid date');
    },
  });

  suite.register({
    tier: 1,
    feature: 'F-01 System Health Check',
    title: 'Health data payload contains status indicator "UP"',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/health');
      assert.ok(res.data.data, 'data payload should be present');
      assert.strictEqual(res.data.data.status, 'UP', 'Service status should be "UP"');
    },
  });

  suite.register({
    tier: 1,
    feature: 'F-01 System Health Check',
    title: 'Health data payload includes database connectivity status',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/health');
      assert.ok(res.data.data, 'data payload should be present');
      assert.ok(
        res.data.data.database !== undefined,
        'database connectivity status field should be present'
      );
      assert.ok(
        ['CONNECTED', 'UP', 'HEALTHY'].includes(String(res.data.data.database).toUpperCase()),
        `Database status should indicate healthy connection, got: ${res.data.data.database}`
      );
    },
  });

  suite.register({
    tier: 1,
    feature: 'F-01 System Health Check',
    title: 'Health data payload includes non-negative uptimeSeconds',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/health');
      assert.ok(res.data.data, 'data payload should be present');
      assert.isNumber(res.data.data.uptimeSeconds, 'uptimeSeconds should be a number');
      assert.ok(res.data.data.uptimeSeconds >= 0, 'uptimeSeconds should be non-negative');
    },
  });

  // =========================================================================
  // F-02: Profile Data Retrieval (5 tests)
  // =========================================================================
  suite.register({
    tier: 1,
    feature: 'F-02 Profile Data Retrieval',
    title: 'GET /api/profile returns HTTP 200 OK',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/profile');
      assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
    },
  });

  suite.register({
    tier: 1,
    feature: 'F-02 Profile Data Retrieval',
    title: 'Profile response conforms to ApiResponse envelope specification',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/profile');
      assert.ok(res.data, 'Expected response body');
      assert.strictEqual(res.data.success, true, 'Envelope success should be true');
      assert.ok(res.data.meta?.timestamp, 'Envelope meta.timestamp should be present');
    },
  });

  suite.register({
    tier: 1,
    feature: 'F-02 Profile Data Retrieval',
    title: 'Profile contains non-empty full name and professional title',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/profile');
      const profile = res.data.data;
      assert.ok(profile, 'Profile data object must exist');
      const name = profile.full_name || profile.fullName || profile.name;
      assert.ok(name && typeof name === 'string' && name.trim().length > 0, 'Profile name must be a non-empty string');
      assert.ok(profile.title && typeof profile.title === 'string' && profile.title.trim().length > 0, 'Profile title must be non-empty');
    },
  });

  suite.register({
    tier: 1,
    feature: 'F-02 Profile Data Retrieval',
    title: 'Profile contains descriptive bio and location',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/profile');
      const profile = res.data.data;
      assert.ok(profile.bio && typeof profile.bio === 'string' && profile.bio.length >= 10, 'Profile bio should have at least 10 chars');
      assert.ok(profile.location && typeof profile.location === 'string', 'Profile location should be present');
    },
  });

  suite.register({
    tier: 1,
    feature: 'F-02 Profile Data Retrieval',
    title: 'Profile includes social links dictionary and available_for_hire flag',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/profile');
      const profile = res.data.data;
      const hireFlag = profile.available_for_hire ?? profile.availableForHire;
      assert.strictEqual(typeof hireFlag, 'boolean', 'available_for_hire should be a boolean');
      const socialLinks = profile.social_links || profile.socialLinks;
      assert.isObject(socialLinks, 'social_links should be a key-value object');
      assert.ok(
        Object.keys(socialLinks).length > 0,
        'social_links should contain at least one external profile (github, linkedin, etc.)'
      );
    },
  });

  // =========================================================================
  // F-03: Skills Listing Retrieval (5 tests)
  // =========================================================================
  suite.register({
    tier: 1,
    feature: 'F-03 Skills Listing Retrieval',
    title: 'GET /api/skills returns HTTP 200 OK',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/skills');
      assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
    },
  });

  suite.register({
    tier: 1,
    feature: 'F-03 Skills Listing Retrieval',
    title: 'Skills response data is a non-empty array inside standard envelope',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/skills');
      assert.strictEqual(res.data.success, true, 'Envelope success should be true');
      assert.isArray(res.data.data, 'Skills data should be an array');
      assert.ok(res.data.data.length > 0, 'Skills array should have at least 1 item');
    },
  });

  suite.register({
    tier: 1,
    feature: 'F-03 Skills Listing Retrieval',
    title: 'Every skill item contains required fields (id, name, category, proficiency)',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/skills');
      const skills = res.data.data;
      for (const skill of skills) {
        assert.ok(skill.id, `Skill must have an id: ${JSON.stringify(skill)}`);
        assert.isString(skill.name, `Skill name must be string: ${skill.id}`);
        assert.isString(skill.category, `Skill category must be string: ${skill.id}`);
        assert.isNumber(skill.proficiency, `Skill proficiency must be number: ${skill.id}`);
      }
    },
  });

  suite.register({
    tier: 1,
    feature: 'F-03 Skills Listing Retrieval',
    title: 'Skills catalog spans multiple distinct technical categories',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/skills');
      const skills = res.data.data;
      const categories = new Set(skills.map((s) => s.category.toLowerCase()));
      assert.ok(
        categories.size >= 2,
        `Skills should cover at least 2 distinct categories, found: ${Array.from(categories).join(', ')}`
      );
    },
  });

  suite.register({
    tier: 1,
    feature: 'F-03 Skills Listing Retrieval',
    title: 'Skill proficiency scores are valid integers between 1 and 100',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/skills');
      const skills = res.data.data;
      for (const skill of skills) {
        assert.ok(
          skill.proficiency >= 1 && skill.proficiency <= 100,
          `Proficiency must be between 1 and 100, got ${skill.proficiency} for ${skill.name}`
        );
      }
    },
  });

  // =========================================================================
  // F-04: Projects Listing Retrieval (5 tests)
  // =========================================================================
  suite.register({
    tier: 1,
    feature: 'F-04 Projects Listing Retrieval',
    title: 'GET /api/projects returns HTTP 200 OK',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/projects');
      assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
    },
  });

  suite.register({
    tier: 1,
    feature: 'F-04 Projects Listing Retrieval',
    title: 'Projects response data is a non-empty array inside standard envelope',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/projects');
      assert.strictEqual(res.data.success, true, 'Envelope success should be true');
      assert.isArray(res.data.data, 'Projects data should be an array');
      assert.ok(res.data.data.length > 0, 'Projects array should contain at least 1 item');
    },
  });

  suite.register({
    tier: 1,
    feature: 'F-04 Projects Listing Retrieval',
    title: 'Every project item contains required fields (id, title, slug, description, technologies)',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/projects');
      const projects = res.data.data;
      for (const proj of projects) {
        assert.ok(proj.id, `Project must have an id: ${JSON.stringify(proj)}`);
        assert.isString(proj.title, `Project title must be string: ${proj.id}`);
        assert.isString(proj.slug, `Project slug must be string: ${proj.id}`);
        assert.isString(proj.description, `Project description must be string: ${proj.id}`);
        assert.isArray(proj.technologies, `Project technologies must be array: ${proj.id}`);
        assert.ok(proj.technologies.length > 0, `Project must list at least 1 tech tag: ${proj.id}`);
      }
    },
  });

  suite.register({
    tier: 1,
    feature: 'F-04 Projects Listing Retrieval',
    title: 'Project items provide valid demo_url or repo_url link strings',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/projects');
      const projects = res.data.data;
      const urlRegex = /^https?:\/\//;
      for (const proj of projects) {
        const demoUrl = proj.demo_url || proj.demoUrl;
        const repoUrl = proj.repo_url || proj.repoUrl;
        assert.ok(
          (demoUrl && urlRegex.test(demoUrl)) || (repoUrl && urlRegex.test(repoUrl)),
          `Project "${proj.title}" must have at least one valid HTTP/HTTPS demo or repo URL`
        );
      }
    },
  });

  suite.register({
    tier: 1,
    feature: 'F-04 Projects Listing Retrieval',
    title: 'Projects collection includes boolean featured flag',
    fn: async ({ baseUrl, assert, request }) => {
      const res = await request(baseUrl, '/projects');
      const projects = res.data.data;
      for (const proj of projects) {
        assert.strictEqual(typeof proj.featured, 'boolean', `featured should be boolean for "${proj.title}"`);
      }
    },
  });

  // =========================================================================
  // F-05: Contact Message Ingestion (6 tests)
  // =========================================================================
  suite.register({
    tier: 1,
    feature: 'F-05 Contact Message Ingestion',
    title: 'POST /api/contact with valid payload returns HTTP 201 Created',
    fn: async ({ baseUrl, assert, request }) => {
      const payload = {
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        message: 'Hello, I am interested in discussing a new contract project opportunity with you!',
      };
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: payload,
      });
      assert.strictEqual(res.status, 201, `Expected 201 Created, got ${res.status}: ${res.rawText}`);
      assert.strictEqual(res.data.success, true, 'Envelope success should be true');
    },
  });

  suite.register({
    tier: 1,
    feature: 'F-05 Contact Message Ingestion',
    title: 'Successful contact submission returns generated id and confirmation message',
    fn: async ({ baseUrl, assert, request }) => {
      const payload = {
        name: 'Bob Smith',
        email: 'bob.smith@example.org',
        message: 'Looking forward to reviewing your portfolio and scheduling a technical discussion.',
      };
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: payload,
      });
      assert.strictEqual(res.status, 201);
      assert.ok(res.data.data, 'Response data must be present');
      assert.ok(res.data.data.id, 'Response should return generated inquiry id');
      assert.isString(res.data.data.message, 'Response should return confirmation message');
    },
  });

  suite.register({
    tier: 1,
    feature: 'F-05 Contact Message Ingestion',
    title: 'POST /api/contact with optional subject succeeds with HTTP 201 Created',
    fn: async ({ baseUrl, assert, request }) => {
      const payload = {
        name: 'Carol White',
        email: 'carol.white@startup.io',
        subject: 'Senior Fullstack Consultation',
        message: 'We would love to discuss an architectural audit for our cloud web application.',
      };
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: payload,
      });
      assert.strictEqual(res.status, 201, `Expected 201 Created, got ${res.status}`);
      assert.strictEqual(res.data.success, true);
    },
  });

  suite.register({
    tier: 1,
    feature: 'F-05 Contact Message Ingestion',
    title: 'POST /api/contact with missing name returns HTTP 400 Bad Request',
    fn: async ({ baseUrl, assert, request }) => {
      const payload = {
        email: 'noname@example.com',
        message: 'This message has no sender name attached.',
      };
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: payload,
      });
      assert.strictEqual(res.status, 400, `Expected 400 Bad Request, got ${res.status}`);
      assert.strictEqual(res.data.success, false, 'Envelope success should be false');
      assert.ok(res.data.error, 'Error object must be present in envelope');
    },
  });

  suite.register({
    tier: 1,
    feature: 'F-05 Contact Message Ingestion',
    title: 'POST /api/contact with invalid email returns HTTP 400 Bad Request',
    fn: async ({ baseUrl, assert, request }) => {
      const payload = {
        name: 'David Brown',
        email: 'invalid-email-format-without-at',
        message: 'Testing email validation rejection on invalid syntax.',
      };
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: payload,
      });
      assert.strictEqual(res.status, 400, `Expected 400 Bad Request, got ${res.status}`);
      assert.strictEqual(res.data.success, false);
      assert.ok(res.data.error, 'Error object must be returned');
    },
  });

  suite.register({
    tier: 1,
    feature: 'F-05 Contact Message Ingestion',
    title: 'POST /api/contact with missing message returns HTTP 400 Bad Request',
    fn: async ({ baseUrl, assert, request }) => {
      const payload = {
        name: 'Eve Adams',
        email: 'eve@example.com',
      };
      const res = await request(baseUrl, '/contact', {
        method: 'POST',
        body: payload,
      });
      assert.strictEqual(res.status, 400, `Expected 400 Bad Request, got ${res.status}`);
      assert.strictEqual(res.data.success, false);
    },
  });
}

module.exports = {
  registerTier1Tests,
};
