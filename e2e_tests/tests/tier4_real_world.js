/**
 * tier4_real_world.js
 * Tier 4: Real-World Scenarios
 * Simulates complete end-to-end user journeys and operational scenarios:
 * - Scenario 1: Full client/recruiter evaluation journey (Health -> Bio -> Skills -> Projects -> Inquiry)
 * - Scenario 2: Form validation error recovery journey (Failed attempt -> Fix -> Success)
 * - Scenario 3: Technology-driven project deep-dive flow
 * - Scenario 4: Concurrent inquiry submission resilience
 */

function registerTier4Tests(suite) {
  // =========================================================================
  // Scenario 1: Complete Recruiter / Client Evaluation Journey
  // =========================================================================
  suite.register({
    tier: 4,
    feature: 'Scenario 1 - Full Recruiter Journey',
    title: 'Recruiter journey: health check -> view profile bio -> inspect skills -> explore projects -> submit inquiry',
    fn: async ({ baseUrl, assert, request }) => {
      // Step 1: Client loads portfolio, browser checks backend health
      const healthRes = await request(baseUrl, '/health');
      assert.strictEqual(healthRes.status, 200, 'Step 1: Health check must succeed');
      assert.strictEqual(healthRes.data.data.status, 'UP', 'Service must report UP');

      // Step 2: Visitor inspects About / Profile section
      const profileRes = await request(baseUrl, '/profile');
      assert.strictEqual(profileRes.status, 200, 'Step 2: Profile request must succeed');
      const profile = profileRes.data.data;
      assert.ok(profile.bio, 'Profile must provide bio details');
      const hireStatus = profile.available_for_hire ?? profile.availableForHire;
      assert.ok(hireStatus !== undefined, 'Profile must indicate availability');

      // Step 3: Visitor browses technical skills
      const skillsRes = await request(baseUrl, '/skills');
      assert.strictEqual(skillsRes.status, 200, 'Step 3: Skills retrieval must succeed');
      const skills = skillsRes.data.data;
      assert.ok(skills.length >= 3, 'Must have at least 3 skills for visitor review');

      // Step 4: Visitor explores showcase projects
      const projectsRes = await request(baseUrl, '/projects');
      assert.strictEqual(projectsRes.status, 200, 'Step 4: Projects retrieval must succeed');
      const projects = projectsRes.data.data;
      assert.ok(projects.length >= 1, 'Must have at least 1 showcase project');

      // Inspect first project details
      const firstProj = projects[0];
      assert.ok(firstProj.title && firstProj.technologies, 'Project details must be present');

      // Step 5: Impressed visitor reaches out via contact form
      const contactPayload = {
        name: 'Tech Recruiter Sarah',
        email: 'sarah.recruiter@globaltalent.com',
        subject: `Exciting Senior Engineering Opportunity matching ${firstProj.technologies[0] || 'your skills'}`,
        message:
          'We reviewed your impressive portfolio projects and technical expertise. We would love to discuss an engineering role with our team.',
      };

      const contactRes = await request(baseUrl, '/contact', {
        method: 'POST',
        body: contactPayload,
      });

      assert.strictEqual(contactRes.status, 201, 'Step 5: Contact inquiry submission must return 201');
      assert.strictEqual(contactRes.data.success, true);
      assert.ok(contactRes.data.data.id, 'Inquiry must generate an identifier');
      assert.ok(contactRes.data.data.submittedAt, 'Inquiry must acknowledge timestamp');
    },
  });

  // =========================================================================
  // Scenario 2: Contact Form Validation & User Correction Flow
  // =========================================================================
  suite.register({
    tier: 4,
    feature: 'Scenario 2 - Validation Recovery Flow',
    title: 'Visitor mistake correction flow: invalid email rejected -> user corrects email -> submission succeeds',
    fn: async ({ baseUrl, assert, request }) => {
      // Step 1: User makes a typo in their email address
      const faultyPayload = {
        name: 'Alex Turner',
        email: 'alex.turner_at_domain.com', // missing '@'
        message: 'I would like to hire you for a custom software design sprint.',
      };

      const firstAttempt = await request(baseUrl, '/contact', {
        method: 'POST',
        body: faultyPayload,
      });

      assert.strictEqual(firstAttempt.status, 400, 'Invalid email attempt must be rejected with 400');
      assert.strictEqual(firstAttempt.data.success, false);
      assert.ok(firstAttempt.data.error, 'Error envelope must describe failure');

      // Step 2: User fixes the email and re-submits without refreshing or breaking session
      const correctedPayload = {
        ...faultyPayload,
        email: 'alex.turner@designagency.com',
      };

      const secondAttempt = await request(baseUrl, '/contact', {
        method: 'POST',
        body: correctedPayload,
      });

      assert.strictEqual(secondAttempt.status, 201, 'Corrected submission must succeed with 201 Created');
      assert.strictEqual(secondAttempt.data.success, true);
      assert.ok(secondAttempt.data.data.id, 'Corrected inquiry must generate tracking id');
    },
  });

  // =========================================================================
  // Scenario 3: Technology Deep Dive & Project Selection
  // =========================================================================
  suite.register({
    tier: 4,
    feature: 'Scenario 3 - Tech Stack Exploration',
    title: 'Developer tech stack cross-check: skills verification matches showcase project tags',
    fn: async ({ baseUrl, assert, request }) => {
      const [skillsRes, projectsRes] = await Promise.all([
        request(baseUrl, '/skills'),
        request(baseUrl, '/projects'),
      ]);

      assert.strictEqual(skillsRes.status, 200);
      assert.strictEqual(projectsRes.status, 200);

      const skillNames = skillsRes.data.data.map((s) => s.name.toLowerCase());
      const projects = projectsRes.data.data;

      // Ensure that project technologies are coherent with technical domain
      let techFound = 0;
      for (const p of projects) {
        for (const t of p.technologies) {
          if (
            skillNames.some(
              (s) => s.includes(t.toLowerCase()) || t.toLowerCase().includes(s)
            )
          ) {
            techFound++;
          }
        }
      }

      assert.ok(
        techFound > 0,
        'Demonstrates coherence between skills catalog and project technology stack'
      );
    },
  });

  // =========================================================================
  // Scenario 4: Concurrent Rapid Contact Submissions
  // =========================================================================
  suite.register({
    tier: 4,
    feature: 'Scenario 4 - Concurrent Requests',
    title: 'Concurrent inquiry submissions complete without data corruption or dropped connections',
    fn: async ({ baseUrl, assert, request }) => {
      const submissions = [1, 2, 3].map((i) =>
        request(baseUrl, '/contact', {
          method: 'POST',
          body: {
            name: `Concurrent User ${i}`,
            email: `concurrent${i}@example.com`,
            subject: `Concurrency Test ${i}`,
            message: `Verifying parallel inquiry dispatch capability number ${i}.`,
          },
        })
      );

      const results = await Promise.all(submissions);

      for (let i = 0; i < results.length; i++) {
        const res = results[i];
        assert.strictEqual(
          res.status,
          201,
          `Submission ${i + 1} failed with status ${res.status}: ${res.rawText}`
        );
        assert.strictEqual(res.data.success, true);
        assert.ok(res.data.data.id, `Submission ${i + 1} must return id`);
      }

      // Check all received IDs are unique
      const ids = results.map((r) => r.data.data.id);
      const uniqueIds = new Set(ids);
      assert.strictEqual(uniqueIds.size, ids.length, 'All concurrent inquiry IDs must be distinct');
    },
  });
}

module.exports = {
  registerTier4Tests,
};
