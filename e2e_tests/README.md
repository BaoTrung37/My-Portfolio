# Personal Portfolio Opaque-Box E2E Test Suite

Comprehensive 4-Tier opaque-box End-to-End test suite for the Personal Portfolio fullstack application. Designed to validate functionality, contracts, boundary resilience, and user journeys against the backend REST API.

## Features

- **Zero Heavy Dependencies**: Built with native Node.js (v18+, tested on v26) using native `fetch` and ES/CommonJS runtime.
- **Contract-Strict**: Enforces standard `ApiResponse<T>` envelope format (`success`, `data`, `error`, `meta.timestamp`).
- **4-Tier Structure**:
  - **Tier 1 — Feature Coverage**: Min 5 test cases per feature for F-01 through F-05 (Health, Profile, Skills, Projects, Contact Ingestion).
  - **Tier 2 — Boundary & Corner Cases**: Empty strings, unicode/emojis (Vietnamese diacritics), whitespace, string length limits (min/max), invalid email syntax, malformed JSON bodies, payload limits (>64KB), and SQLi/XSS resilience.
  - **Tier 3 — Cross-Feature Combinations**: Contact inquiry uniqueness, skills category filtering, project demo/repo link syntax validation, technology stack alignment, and security/CORS headers.
  - **Tier 4 — Real-World Scenarios**: Full visitor and recruiter walkthroughs, mistake recovery flows, project tech stack exploration, and concurrent inquiry bursts.
- **Dual Execution Modes**:
  - **Live Testing**: Interrogates the live backend over HTTP (configurable via `API_URL` or `--api-url`, default `http://localhost:5001/api`).
  - **Mock Reference Mode (`--mock`)**: In-process specification reference mock server for offline verification, CI dry-runs, and deterministic self-testing.

## Quick Start

### 1. Run Complete E2E Suite (Live Backend)
Ensure your backend server is running (`npm run dev` in backend or Docker):
```bash
node run_e2e.js
# Or with explicit API URL:
node run_e2e.js --api-url http://localhost:5001/api
# Or via environment variable:
API_URL=http://localhost:5001/api node run_e2e.js
```

### 2. Run Self-Contained Mock Mode (Dry Run)
Validates the test suite against the specification reference implementation without needing a live database or running backend:
```bash
node run_e2e.js --mock
```

### 3. Filter by Specific Tier
```bash
node run_e2e.js --tier 1
node run_e2e.js --tier 2
node run_e2e.js --tier 3
node run_e2e.js --tier 4
```

### 4. CI Integration & Machine-Readable Output
```bash
node run_e2e.js --json
```

## Exit Codes

- `0`: All selected test cases passed.
- `1`: One or more test cases failed or the server was unreachable.
