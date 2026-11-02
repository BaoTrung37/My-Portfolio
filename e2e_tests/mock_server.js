/**
 * mock_server.js
 * Reference mock server strictly implementing PROJECT.md Interface Contracts.
 * Supports both in-memory dispatch (for sandbox/dry-run verification)
 * and standalone HTTP server (for live integration testing).
 */

const http = require('node:http');

const MAX_PAYLOAD_BYTES = 64 * 1024; // 64KB limit from PROJECT.md F-06

// Mock Database State
const mockData = {
  profile: {
    id: 'prof-001',
    full_name: 'Trung Nguyen',
    title: 'Senior Fullstack Software Engineer',
    bio: 'Passionate software engineer building resilient, scalable web applications and distributed systems.',
    avatar_url: 'https://example.com/avatar.jpg',
    location: 'Ho Chi Minh City, Vietnam',
    social_links: {
      github: 'https://github.com/trungnguyen',
      linkedin: 'https://linkedin.com/in/trungnguyen',
      twitter: 'https://x.com/trungnguyen',
    },
    available_for_hire: true,
  },
  skills: [
    { id: 'sk-1', name: 'TypeScript', category: 'Frontend', proficiency: 95, icon: 'ts-icon', featured: true, display_order: 1 },
    { id: 'sk-2', name: 'React / Next.js', category: 'Frontend', proficiency: 92, icon: 'react-icon', featured: true, display_order: 2 },
    { id: 'sk-3', name: 'Node.js & Express', category: 'Backend', proficiency: 90, icon: 'node-icon', featured: true, display_order: 3 },
    { id: 'sk-4', name: 'PostgreSQL', category: 'Database', proficiency: 88, icon: 'pg-icon', featured: true, display_order: 4 },
    { id: 'sk-5', name: 'Docker & DevOps', category: 'DevOps', proficiency: 85, icon: 'docker-icon', featured: false, display_order: 5 },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Personal Portfolio Platform',
      slug: 'personal-portfolio-platform',
      description: 'Fullstack portfolio platform showcasing projects, skills, and interactive contact messaging.',
      technologies: ['TypeScript', 'Next.js', 'Express', 'PostgreSQL', 'Docker'],
      demo_url: 'https://portfolio.example.com',
      repo_url: 'https://github.com/trungnguyen/personal_portfolio',
      image_url: 'https://example.com/project1.png',
      featured: true,
      display_order: 1,
    },
    {
      id: 'proj-2',
      title: 'E-Commerce Live Stream Hub',
      slug: 'ecommerce-live-stream-hub',
      description: 'Real-time interactive live commerce analytics dashboard with event processing.',
      technologies: ['Node.js', 'WebSockets', 'PostgreSQL', 'Redis'],
      demo_url: 'https://live-hub.example.com',
      repo_url: 'https://github.com/trungnguyen/live-commerce-hub',
      image_url: 'https://example.com/project2.png',
      featured: true,
      display_order: 2,
    },
  ],
  contactMessages: [],
};

const serverStartTime = Date.now();

function createResponseEnvelope(success, data = null, error = null) {
  const envelope = {
    success,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
  if (data !== null) envelope.data = data;
  if (error !== null) envelope.error = error;
  return envelope;
}

/**
 * Core Request Router logic.
 * Processes an incoming request and returns { status, headers, bodyString }.
 */
function processApiRequest({ method, pathname, queryParams, rawBody, headers }) {
  const responseHeaders = {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'Content-Type, Accept',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
  };

  const normalizedMethod = (method || 'GET').toUpperCase();

  if (normalizedMethod === 'OPTIONS') {
    return { status: 204, headers: responseHeaders, body: '' };
  }

  // Check Payload Limit
  const bodyByteLength = Buffer.byteLength(rawBody || '', 'utf8');
  if (bodyByteLength > MAX_PAYLOAD_BYTES) {
    return {
      status: 413,
      headers: responseHeaders,
      body: JSON.stringify(
        createResponseEnvelope(false, null, {
          code: 'PAYLOAD_TOO_LARGE',
          message: 'Request payload exceeds 64KB limit',
        })
      ),
    };
  }

  const cleanPath = pathname.replace(/\/+$/, '');

  // GET /api/health
  if (cleanPath === '/api/health' && normalizedMethod === 'GET') {
    const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
    return {
      status: 200,
      headers: responseHeaders,
      body: JSON.stringify(
        createResponseEnvelope(true, {
          status: 'UP',
          database: 'CONNECTED',
          uptimeSeconds,
        })
      ),
    };
  }

  // GET /api/profile
  if (cleanPath === '/api/profile' && normalizedMethod === 'GET') {
    return {
      status: 200,
      headers: responseHeaders,
      body: JSON.stringify(createResponseEnvelope(true, mockData.profile)),
    };
  }

  // GET /api/skills
  if (cleanPath === '/api/skills' && normalizedMethod === 'GET') {
    const categoryFilter = queryParams.get ? queryParams.get('category') : queryParams.category;
    let skills = mockData.skills;
    if (categoryFilter) {
      skills = skills.filter((s) => s.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    return {
      status: 200,
      headers: responseHeaders,
      body: JSON.stringify(createResponseEnvelope(true, skills)),
    };
  }

  // GET /api/projects
  if (cleanPath === '/api/projects' && normalizedMethod === 'GET') {
    return {
      status: 200,
      headers: responseHeaders,
      body: JSON.stringify(createResponseEnvelope(true, mockData.projects)),
    };
  }

  // POST /api/contact
  if (cleanPath === '/api/contact' && normalizedMethod === 'POST') {
    let parsedPayload;
    try {
      parsedPayload = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      return {
        status: 400,
        headers: responseHeaders,
        body: JSON.stringify(
          createResponseEnvelope(false, null, {
            code: 'INVALID_JSON',
            message: 'Malformed JSON payload',
          })
        ),
      };
    }

    const { name, email, subject, message } = parsedPayload || {};
    const validationIssues = [];

    // Name validation: min 2, max 120, string
    if (!name || typeof name !== 'string') {
      validationIssues.push({ field: 'name', issue: 'Name is required' });
    } else if (name.trim().length < 2) {
      validationIssues.push({ field: 'name', issue: 'Name must be at least 2 characters' });
    } else if (name.length > 120) {
      validationIssues.push({ field: 'name', issue: 'Name must not exceed 120 characters' });
    }

    // Email validation: regex check, max 255
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string') {
      validationIssues.push({ field: 'email', issue: 'Email is required' });
    } else if (!emailRegex.test(email.trim())) {
      validationIssues.push({ field: 'email', issue: 'Invalid email address format' });
    } else if (email.length > 255) {
      validationIssues.push({ field: 'email', issue: 'Email must not exceed 255 characters' });
    }

    // Message validation: min 10, max 2000, string
    if (!message || typeof message !== 'string') {
      validationIssues.push({ field: 'message', issue: 'Message is required' });
    } else if (message.trim().length < 10) {
      validationIssues.push({ field: 'message', issue: 'Message must be at least 10 characters' });
    } else if (message.length > 2000) {
      validationIssues.push({ field: 'message', issue: 'Message must not exceed 2000 characters' });
    }

    if (validationIssues.length > 0) {
      return {
        status: 400,
        headers: responseHeaders,
        body: JSON.stringify(
          createResponseEnvelope(false, null, {
            code: 'VALIDATION_FAILED',
            message: 'Validation failed for submitted contact form',
            details: validationIssues,
          })
        ),
      };
    }

    // Persist Message in Mock Store
    const savedInquiry = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      name: name.trim(),
      email: email.trim(),
      subject: subject ? String(subject).trim() : null,
      message: message.trim(),
      submittedAt: new Date().toISOString(),
    };
    mockData.contactMessages.push(savedInquiry);

    return {
      status: 201,
      headers: responseHeaders,
      body: JSON.stringify(
        createResponseEnvelope(true, {
          id: savedInquiry.id,
          message: 'Your inquiry has been received successfully.',
          submittedAt: savedInquiry.submittedAt,
        })
      ),
    };
  }

  // 404 Route Not Found
  return {
    status: 404,
    headers: responseHeaders,
    body: JSON.stringify(
      createResponseEnvelope(false, null, {
        code: 'NOT_FOUND',
        message: `Endpoint ${cleanPath} not found`,
      })
    ),
  };
}

/**
 * In-memory Mock Handler for direct execution without network sockets.
 */
async function handleMockRequest(url, options = {}) {
  const parsedUrl = new URL(url);
  const method = options.method || 'GET';
  const queryParams = parsedUrl.searchParams;
  const rawBody =
    typeof options.body === 'string'
      ? options.body
      : options.body
      ? JSON.stringify(options.body)
      : '';

  const result = processApiRequest({
    method,
    pathname: parsedUrl.pathname,
    queryParams,
    rawBody,
    headers: options.headers || {},
  });

  return {
    status: result.status,
    ok: result.status >= 200 && result.status < 300,
    headers: {
      get: (headerName) => result.headers[headerName.toLowerCase()] || null,
    },
    text: async () => result.body,
    json: async () => JSON.parse(result.body),
  };
}

/**
 * Start standalone HTTP Server on port (optional).
 */
function startMockServer(port = 5001) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      let rawBody = '';

      req.on('data', (chunk) => {
        rawBody += chunk.toString();
      });

      req.on('end', () => {
        const result = processApiRequest({
          method: req.method,
          pathname: parsedUrl.pathname,
          queryParams: parsedUrl.searchParams,
          rawBody,
          headers: req.headers,
        });

        res.statusCode = result.status;
        for (const [k, v] of Object.entries(result.headers)) {
          res.setHeader(k, v);
        }
        res.end(result.body);
      });
    });

    server.listen(port, () => {
      const actualPort = server.address().port;
      resolve({
        server,
        port: actualPort,
        url: `http://localhost:${actualPort}/api`,
        close: () => new Promise((res) => server.close(res)),
      });
    });

    server.on('error', reject);
  });
}

// Allow direct CLI execution: node mock_server.js [port]
if (require.main === module) {
  const port = process.argv[2] ? parseInt(process.argv[2], 10) : 5001;
  startMockServer(port).then((instance) => {
    console.log(`Mock server listening at http://localhost:${instance.port}/api`);
  });
}

module.exports = {
  processApiRequest,
  handleMockRequest,
  startMockServer,
  mockData,
};
