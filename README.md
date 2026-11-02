# Personal Portfolio Fullstack Application

A custom, high-performance personal portfolio web application built with a dedicated TypeScript Express REST API backend and a modern frontend interface, backed by PostgreSQL 16.

---

## Architecture Overview

- **Monorepo Layout**: Managed via npm workspaces (`backend/`, `frontend/`, `shared/`).
- **Shared Package (`@portfolio/shared`)**: Shared TypeScript interfaces, DTOs, and API envelope contracts.
- **Backend API (`backend/`)**: Express + TypeScript following a 3-tier **Controller-Service-Repository** pattern.
  - Port: **5001** (macOS port 5000 is occupied by Apple AirPlay Receiver `ControlCenter`).
  - Standard JSON response envelope: `{ success: boolean, data?: T, error?: { code, message, details }, meta: { timestamp } }`.
  - Database persistence: PostgreSQL 16 with connection pooling (`pg.Pool`).
  - Offline / CI fallback: In-memory mock repositories ensuring 100% test pass rate even when Docker is offline.
- **Database Engine**: PostgreSQL 16 Alpine containerized with Docker Compose, pure SQL migrations in `backend/src/db/migrations/`, and idempotent seeding.

---

## Port Allocation Matrix

| Service | Port | Status / Rationale |
|---------|------|-------------------|
| Frontend (Next.js) | `3000` | Standard local web port |
| Backend API (Express) | `5001` | Dedicated REST API port (Port 5000 is avoided due to macOS AirPlay collision) |
| Database (PostgreSQL) | `5432` | Standard PostgreSQL port |

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v22.0.0 or higher (tested on Node.js v26.5.0)
- **npm**: v10.0.0 or higher
- **Docker & Docker Compose** (for containerized PostgreSQL)

### 2. Local Environment Setup
Start PostgreSQL via Docker Compose:
```bash
npm run docker:up
```

Apply pure SQL migrations and seed baseline profile, skills, and projects:
```bash
npm run migrate
npm run seed
```

Start development servers:
```bash
# Start backend (http://localhost:5001)
npm run dev:backend

# Start frontend (http://localhost:3000)
npm run dev:frontend
```

---

## Testing & Quality Assurance

Run entire automated test suite across workspaces (backend: 47 tests, frontend: 49 tests; 96 total passed with 0 failures):
```bash
npm test
```

Run TypeScript compilation check across all workspaces (`shared`, `backend`, `frontend`):
```bash
npm run typecheck
```

Run linter across all workspaces (`shared`, `backend`, `frontend`):
```bash
npm run lint
```

Build all workspaces for production:
```bash
npm run build
```

Verify live fullstack coordination and API contract integration:
```bash
npm run coordination:verify
```

---

## REST API Endpoints

All endpoints return a uniform envelope:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-11-02T02:00:00.000Z"
  }
}
```

### Endpoints
- `GET /api/health` — System uptime and database connection status (HTTP 200).
- `GET /api/profile` — Personal bio, avatar, location, and social links (HTTP 200).
- `GET /api/skills` — Categorized technical skills (HTTP 200). Supports `?category=` and `?featured=true`.
- `GET /api/projects` — Portfolio projects showcase (HTTP 200). Supports `?featured=true`.
- `POST /api/contact` — Ingest visitor contact messages.
  - Body: `{ "name": "...", "email": "...", "subject": "...", "message": "..." }`
  - Valid: Returns HTTP 201 Created with `{ id, message, submittedAt }`.
  - Invalid: Returns HTTP 400 Bad Request with `{ code: "VALIDATION_FAILED", details: [...] }`.
