# Testing Infrastructure & E2E Test Suite Architecture

## 1. Overview & Purpose
This document details the testing infrastructure for the **Personal Portfolio Fullstack Web Application**.
The testing architecture employs a **multi-layered testing strategy**:
1. **Unit & Integration Tests**: Co-located within `backend/tests/` (Vitest + Supertest) and `frontend/tests/` (Vitest + React Testing Library).
2. **Opaque-Box E2E Test Suite**: Located in `personal_portfolio/e2e_tests/`, treating the system as a black box and exercising the public HTTP REST API surface exactly as an external client, browser, or recruiter would.

---

## 2. Test Suite Directory Structure
```
personal_portfolio/
├── TEST_INFRA.md                       # This infrastructure documentation
├── TEST_READY.md                       # Publication signal for orchestrator & milestones
└── e2e_tests/
    ├── package.json                    # Runner scripts and metadata
    ├── README.md                       # Test runner user manual
    ├── run_e2e.js                      # Primary CLI test runner executable
    ├── test_runner.js                  # Assertion library, HTTP helper, suite runner
    ├── mock_server.js                  # Reference specification mock server & in-memory router
    └── tests/
        ├── tier1_feature_coverage.js   # Tier 1: F-01 through F-05 feature coverage (26 tests)
        ├── tier2_boundary_cases.js     # Tier 2: Boundary values, unicode, limits, SQLi/XSS (23 tests)
        ├── tier3_cross_feature.js      # Tier 3: Ingestion state, filtering, URL validation (8 tests)
        └── tier4_real_world.js         # Tier 4: Multi-step end-to-end user journeys (4 tests)
```

---

## 3. Tier Coverage Breakdown

| Tier | Category | Test Count | Description |
|---|---|---|---|
| **Tier 1** | **Feature Coverage** | 26 | Verifies happy paths and core contracts for Features F-01 to F-05 (System Health, Profile Info, Skills Catalog, Projects Showcase, and Contact Ingestion). Minimum 5 tests per feature. |
| **Tier 2** | **Boundary & Corner Cases** | 23 | Tests empty strings, whitespace-only values, Unicode/Vietnamese diacritics & emojis, string length boundary limits (min/max), invalid email structures, malformed JSON bodies, payload limits (>64KB), and SQLi/XSS resilience. |
| **Tier 3** | **Cross-Feature Combinations** | 8 | Exercises cross-cutting interactions: contact submission uniqueness across requests, skills category filtering and subset integrity, project URL syntax validation, tech stack alignment with skills catalog, standard API envelope consistency, and security/CORS headers. |
| **Tier 4** | **Real-World Scenarios** | 4 | Complete realistic user scenarios: Full recruiter portfolio walkthrough (landing -> bio -> skills -> project inspection -> inquiry), form validation recovery flow (mistake -> fix -> submit), tech stack exploration, and concurrent inquiry burst handling. |
| **Total** | | **61** | **100% Pass Rate Across All Tiers** |

---

## 4. Interface Contracts Enforced

### Standard Response Envelope (`ApiResponse<T>`)
Every JSON response from the REST API must adhere to the standard envelope:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Array<{ field?: string; issue: string }>;
  };
  meta: {
    timestamp: string; // ISO 8601 string
  };
}
```

### Endpoints Verified
1. `GET /api/health`: Returns HTTP 200 with `{ status: "UP", database: "CONNECTED", uptimeSeconds: number }`.
2. `GET /api/profile`: Returns HTTP 200 with profile bio, title, location, social links, and `available_for_hire`.
3. `GET /api/skills`: Returns HTTP 200 with array of categorized skills (`id`, `name`, `category`, `proficiency: 1-100`). Supports `?category=` filtering.
4. `GET /api/projects`: Returns HTTP 200 with array of projects (`id`, `title`, `slug`, `description`, `technologies`, `demo_url`, `repo_url`, `featured`).
5. `POST /api/contact`:
   - Valid input: Returns HTTP 201 with `{ id: string, message: string, submittedAt: string }`.
   - Invalid input: Returns HTTP 400 with `{ code: "VALIDATION_FAILED", message: string, details: [...] }`.
   - Large payload (>64KB): Returns HTTP 413 Payload Too Large.
   - Malformed JSON: Returns HTTP 400 Bad Request.

---

## 5. Execution Commands & Configuration

### Environment Variables
- `API_URL`: Base URL of the target API service (default: `http://localhost:5001/api`).

### Running Live Tests Against Backend
```bash
# From workspace root
node personal_portfolio/e2e_tests/run_e2e.js

# Or from e2e_tests directory
cd personal_portfolio/e2e_tests
npm run test:e2e
```

### Running Offline Specification Mock Mode
```bash
node personal_portfolio/e2e_tests/run_e2e.js --mock
```

### Filtering by Tier
```bash
node personal_portfolio/e2e_tests/run_e2e.js --tier 1
node personal_portfolio/e2e_tests/run_e2e.js --tier 2
node personal_portfolio/e2e_tests/run_e2e.js --tier 3
node personal_portfolio/e2e_tests/run_e2e.js --tier 4
```

### CI / Machine-Readable JSON Output
```bash
node personal_portfolio/e2e_tests/run_e2e.js --mock --json
```

---

## 6. Exit Codes
- `0`: All executed test assertions passed successfully.
- `1`: One or more test assertions failed, or target service is unreachable.
