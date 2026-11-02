#!/usr/bin/env node
/**
 * run_e2e.js
 * Standalone E2E Test Suite Runner for Personal Portfolio (Tiers 1-4).
 * Executable via: node run_e2e.js [--api-url <url>] [--tier <1-4>] [--mock] [--verbose] [--json]
 */

const { TestSuite, colors, request } = require('./test_runner');
const { startMockServer, handleMockRequest } = require('./mock_server');
const { registerTier1Tests } = require('./tests/tier1_feature_coverage');
const { registerTier2Tests } = require('./tests/tier2_boundary_cases');
const { registerTier3Tests } = require('./tests/tier3_cross_feature');
const { registerTier4Tests } = require('./tests/tier4_real_world');

// Parse CLI Arguments
const args = process.argv.slice(2);
let apiUrl = process.env.API_URL || 'http://localhost:5001/api';
let filterTier = null;
let useMockServer = false;
let useLiveBackend = false;
let verbose = false;
let outputJson = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--api-url' && args[i + 1]) {
    apiUrl = args[++i];
  } else if (arg === '--tier' && args[i + 1]) {
    filterTier = args[++i];
  } else if (arg === '--mock' || arg === '--self-test') {
    useMockServer = true;
  } else if (arg === '--backend' || arg === '--app' || arg === '--live') {
    useLiveBackend = true;
  } else if (arg === '--verbose') {
    verbose = true;
  } else if (arg === '--json') {
    outputJson = true;
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
${colors.bold}Personal Portfolio E2E Test Runner (Tiers 1-4)${colors.reset}

Usage:
  node run_e2e.js [options]

Options:
  --api-url <url>   Base API URL (default: http://localhost:5001/api or $API_URL)
  --tier <1-4>      Run only tests in the specified Tier (1, 2, 3, or 4)
  --mock            Run against built-in contract mock server (dry-run self-test)
  --backend         Run against live compiled Express backend in-process
  --verbose         Print detailed failure traces
  --json            Output results summary in JSON
  --help, -h        Show this help message

Examples:
  node run_e2e.js
  node run_e2e.js --tier 1
  node run_e2e.js --mock
  node run_e2e.js --backend
  API_URL=http://localhost:5001/api node run_e2e.js
`);
    process.exit(0);
  }
}

function getExpressHandler() {
  const path = require('node:path');
  const appPath = path.resolve(__dirname, '../backend/dist/backend/src/app.js');
  const supertestPath = path.resolve(__dirname, '../node_modules/supertest');

  const { createApp } = require(appPath);
  const supertest = require(supertestPath);

  const app = createApp({ useInMemory: true, dbCheckFn: async () => true });
  const req = supertest(app);

  return async function expressFetchHandler(url, options = {}) {
    const parsed = new URL(url);
    const targetPath = parsed.pathname + parsed.search;
    const method = (options.method || 'GET').toLowerCase();

    let r = req[method](targetPath);
    if (options.headers) {
      for (const [k, v] of Object.entries(options.headers)) {
        r = r.set(k, v);
      }
    }
    if (options.body !== undefined) {
      if (typeof options.body === 'string') {
        r = r
          .set(
            'Content-Type',
            options.headers?.['Content-Type'] ||
              options.headers?.['content-type'] ||
              'application/json'
          )
          .send(options.body);
      } else {
        r = r.send(options.body);
      }
    }

    try {
      const res = await r;
      return {
        status: res.status,
        ok: res.status >= 200 && res.status < 300,
        headers: {
          get: (h) => res.headers[h.toLowerCase()] || null,
        },
        text: async () => res.text || '',
        json: async () => res.body || (res.text ? JSON.parse(res.text) : null),
      };
    } catch (err) {
      if (err.response) {
        const res = err.response;
        return {
          status: res.status,
          ok: res.status >= 200 && res.status < 300,
          headers: {
            get: (h) => res.headers[h.toLowerCase()] || null,
          },
          text: async () => res.text || '',
          json: async () => res.body || (res.text ? JSON.parse(res.text) : null),
        };
      }
      throw err;
    }
  };
}

async function main() {
  const suite = new TestSuite();

  // Register all 4 Tiers
  registerTier1Tests(suite);
  registerTier2Tests(suite);
  registerTier3Tests(suite);
  registerTier4Tests(suite);

  let mockInstance = null;
  let mockHandler = null;
  let activeBaseUrl = apiUrl;

  try {
    if (useMockServer) {
      console.log(`${colors.yellow}ℹ Initializing in-process contract reference mock engine...${colors.reset}`);
      mockHandler = handleMockRequest;
      activeBaseUrl = 'http://localhost:5001/api';
      console.log(`${colors.green}✔ Mock engine initialized for ${activeBaseUrl}${colors.reset}\n`);
    } else if (useLiveBackend) {
      console.log(`${colors.yellow}ℹ Initializing live compiled Express backend in-process...${colors.reset}`);
      mockHandler = getExpressHandler();
      activeBaseUrl = 'http://localhost:5001/api';
      console.log(`${colors.green}✔ Live Express backend initialized for ${activeBaseUrl}${colors.reset}\n`);
    } else {
      // Pre-flight check: is server reachable?
      console.log(`${colors.gray}Probing target API at ${activeBaseUrl}...${colors.reset}`);
      const probe = await request(activeBaseUrl, '/health', { timeout: 3000 });
      if (probe.status === 0) {
        try {
          console.log(`${colors.yellow}Notice:${colors.reset} Standalone server not reachable on socket. Initializing live compiled Express backend in-process...`);
          mockHandler = getExpressHandler();
          activeBaseUrl = 'http://localhost:5001/api';
          console.log(`${colors.green}✔ Live Express backend initialized for ${activeBaseUrl}${colors.reset}\n`);
        } catch {
          console.error(`\n${colors.bold}${colors.red}Error: Unable to connect to target API at ${activeBaseUrl}${colors.reset}`);
          console.error(`${colors.yellow}Tip:${colors.reset} Ensure your backend server is running on port 5001:`);
          console.error(`       cd backend && npm run dev`);
          console.error(`     Or run with the built-in mock server to self-verify the test suite:`);
          console.error(`       node run_e2e.js --mock\n`);
          process.exit(1);
        }
      } else {
        console.log(`${colors.green}✔ Target API is responsive.${colors.reset}\n`);
      }
    }

    const context = {
      baseUrl: activeBaseUrl,
      mockHandler,
      verbose,
    };

    const results = await suite.run(context, filterTier);

    if (outputJson) {
      console.log(JSON.stringify(results, null, 2));
    }

    if (!results.success) {
      process.exit(1);
    }
  } catch (err) {
    console.error(`${colors.red}Fatal test runner error: ${err.message}${colors.reset}`);
    if (verbose) console.error(err);
    process.exit(1);
  } finally {
    if (mockInstance) {
      await mockInstance.close();
    }
  }
}

main();
