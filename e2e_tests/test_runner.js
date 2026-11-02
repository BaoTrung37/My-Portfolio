/**
 * test_runner.js
 * Lightweight, zero-dependency test runner engine for E2E tests.
 * Supports assertions, HTTP request helpers, suite organization, and reporting.
 */

const http = require('node:http');

// ANSI Color Helpers
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

// Assertion Library
class AssertionError extends Error {
  constructor(message, actual, expected) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
  }
}

const assert = {
  ok(value, message = 'Expected truthy value') {
    if (!value) {
      throw new AssertionError(message, value, true);
    }
  },

  equal(actual, expected, message) {
    if (actual != expected) {
      throw new AssertionError(
        message || `Expected ${JSON.stringify(actual)} == ${JSON.stringify(expected)}`,
        actual,
        expected
      );
    }
  },

  strictEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new AssertionError(
        message || `Expected strict equality:\n  Actual:   ${JSON.stringify(actual)}\n  Expected: ${JSON.stringify(expected)}`,
        actual,
        expected
      );
    }
  },

  notStrictEqual(actual, expected, message) {
    if (actual === expected) {
      throw new AssertionError(
        message || `Expected values to not be strictly equal: ${JSON.stringify(actual)}`,
        actual,
        expected
      );
    }
  },

  isNumber(val, message) {
    if (typeof val !== 'number' || Number.isNaN(val)) {
      throw new AssertionError(message || `Expected number, received: ${typeof val}`, val, 'number');
    }
  },

  isString(val, message) {
    if (typeof val !== 'string') {
      throw new AssertionError(message || `Expected string, received: ${typeof val}`, val, 'string');
    }
  },

  isArray(val, message) {
    if (!Array.isArray(val)) {
      throw new AssertionError(message || `Expected array, received: ${typeof val}`, val, 'Array');
    }
  },

  isObject(val, message) {
    if (typeof val !== 'object' || val === null || Array.isArray(val)) {
      throw new AssertionError(message || `Expected plain object, received: ${typeof val}`, val, 'Object');
    }
  },

  match(str, regex, message) {
    if (typeof str !== 'string' || !regex.test(str)) {
      throw new AssertionError(
        message || `Expected "${str}" to match regex ${regex}`,
        str,
        regex.toString()
      );
    }
  },

  includes(container, item, message) {
    if (typeof container === 'string' || Array.isArray(container)) {
      if (!container.includes(item)) {
        throw new AssertionError(
          message || `Expected container to include ${JSON.stringify(item)}`,
          container,
          item
        );
      }
    } else {
      throw new AssertionError('includes() container must be string or array');
    }
  },
};

// HTTP Request Helper
async function request(baseUrl, path, options = {}) {
  const url = `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  const method = (options.method || 'GET').toUpperCase();
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  let body = options.body;
  if (body !== undefined && typeof body !== 'string' && !Buffer.isBuffer(body)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    body = JSON.stringify(body);
  }

  const start = performance.now();
  try {
    const fetchFn = options.mockHandler || globalThis.__E2E_MOCK_HANDLER__ || fetch;
    const res = await fetchFn(url, {
      method,
      headers,
      body,
      signal: options.signal || AbortSignal.timeout(options.timeout || 10000),
    });

    const duration = Math.round(performance.now() - start);
    const contentType = res.headers.get('content-type') || '';
    let data = null;
    let rawText = '';

    try {
      rawText = await res.text();
      if (contentType.includes('application/json') || rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
        data = JSON.parse(rawText);
      } else {
        data = rawText;
      }
    } catch {
      data = rawText;
    }

    return {
      status: res.status,
      ok: res.ok,
      headers: res.headers,
      data,
      rawText,
      duration,
      url,
    };
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    return {
      error: err,
      status: 0,
      ok: false,
      headers: new Headers(),
      data: null,
      rawText: '',
      duration,
      url,
    };
  }
}

// Test Runner Registry
class TestSuite {
  constructor() {
    this.tests = [];
  }

  register({ tier, feature, title, fn }) {
    this.tests.push({
      tier,
      feature: feature || 'General',
      title,
      fn,
      status: 'pending',
      duration: 0,
      error: null,
    });
  }

  async run(context = {}, filterTier = null) {
    const selectedTests = filterTier
      ? this.tests.filter((t) => String(t.tier) === String(filterTier))
      : this.tests;

    console.log(
      `${colors.bold}${colors.cyan}══════════════════════════════════════════════════════════════════${colors.reset}`
    );
    console.log(
      `${colors.bold} Running E2E Test Suite (${selectedTests.length} tests selected, Filter: ${
        filterTier ? `Tier ${filterTier}` : 'All Tiers'
      })${colors.reset}`
    );
    console.log(
      `${colors.bold}${colors.cyan}══════════════════════════════════════════════════════════════════${colors.reset}\n`
    );

    let currentTier = null;
    let currentFeature = null;

    let passed = 0;
    let failed = 0;
    const startTime = performance.now();

    if (context.mockHandler) {
      globalThis.__E2E_MOCK_HANDLER__ = context.mockHandler;
    }

    for (const test of selectedTests) {
      if (test.tier !== currentTier) {
        currentTier = test.tier;
        console.log(`\n${colors.bold}${colors.blue}▶ TIER ${currentTier}${colors.reset}`);
      }
      if (test.feature !== currentFeature) {
        currentFeature = test.feature;
        console.log(`  ${colors.bold}${colors.white}[${currentFeature}]${colors.reset}`);
      }

      const testStart = performance.now();
      try {
        await test.fn({ ...context, assert, request });
        test.duration = Math.round(performance.now() - testStart);
        test.status = 'passed';
        passed++;
        console.log(
          `    ${colors.green}✔ PASS${colors.reset} ${test.title} ${colors.gray}(${test.duration}ms)${colors.reset}`
        );
      } catch (err) {
        test.duration = Math.round(performance.now() - testStart);
        test.status = 'failed';
        test.error = err;
        failed++;
        console.log(
          `    ${colors.red}✖ FAIL${colors.reset} ${test.title} ${colors.gray}(${test.duration}ms)${colors.reset}`
        );
        console.log(`      ${colors.red}${err.name}: ${err.message}${colors.reset}`);
        if (context.verbose && err.stack) {
          console.log(`      ${colors.gray}${err.stack.split('\n').slice(1, 4).join('\n      ')}${colors.reset}`);
        }
      }
    }

    const totalDuration = Math.round(performance.now() - startTime);

    // Summary Reporting
    console.log(`\n${colors.bold}${colors.cyan}══════════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bold} E2E Test Suite Summary${colors.reset}`);
    console.log(`${colors.cyan}══════════════════════════════════════════════════════════════════${colors.reset}`);

    // Tier Breakdown
    const tierStats = {};
    for (const t of selectedTests) {
      if (!tierStats[t.tier]) {
        tierStats[t.tier] = { total: 0, passed: 0, failed: 0 };
      }
      tierStats[t.tier].total++;
      if (t.status === 'passed') tierStats[t.tier].passed++;
      if (t.status === 'failed') tierStats[t.tier].failed++;
    }

    for (const [tier, stat] of Object.entries(tierStats)) {
      const statusColor = stat.failed === 0 ? colors.green : colors.red;
      console.log(
        `  Tier ${tier}: ${statusColor}${stat.passed}/${stat.total} passed${colors.reset} ${
          stat.failed > 0 ? `(${stat.failed} failed)` : ''
        }`
      );
    }

    console.log(`${colors.gray}──────────────────────────────────────────────────────────────────${colors.reset}`);
    console.log(`  Total Tests: ${selectedTests.length}`);
    console.log(`  Passed:      ${colors.green}${passed}${colors.reset}`);
    console.log(`  Failed:      ${failed > 0 ? colors.red + failed : colors.green + '0'}${colors.reset}`);
    console.log(`  Duration:    ${totalDuration}ms`);
    console.log(`${colors.cyan}══════════════════════════════════════════════════════════════════${colors.reset}\n`);

    return {
      total: selectedTests.length,
      passed,
      failed,
      duration: totalDuration,
      tierStats,
      success: failed === 0,
    };
  }
}

module.exports = {
  assert,
  request,
  TestSuite,
  colors,
};
