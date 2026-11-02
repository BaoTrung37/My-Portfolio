# Personal Portfolio — Frontend Application

A responsive personal portfolio web application built with **Next.js 14+ / React 19**, **TypeScript**, and **Tailwind CSS**, featuring semantic design tokens and a modular component architecture.

---

## Architecture & Layout

```
personal_portfolio/frontend/
├── package.json                   # @portfolio/frontend workspace definition
├── tsconfig.json                  # TypeScript strict compiler options & path aliases
├── next.config.mjs                # Next.js config with API proxy rewrites (/api -> :5001)
├── tailwind.config.ts             # Semantic colors & standard typography tokens
├── postcss.config.js              # PostCSS plugins
├── babel.config.cjs               # Babel presets for JSX & TypeScript testing
├── jest.config.mjs                # Jest + JSDOM test runner configuration
├── scripts/
│   ├── lint.mjs                   # Code quality and syntax linter
│   └── build.mjs                  # Production build & verification script
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with SEO metadata & OpenGraph tags
│   │   ├── page.tsx               # Main portfolio landing page
│   │   └── globals.css            # Typography tokens, semantic CSS variables & scrollbars
│   ├── components/
│   │   ├── common/                # Reusable design system UI components
│   │   │   ├── Button.tsx         # Multi-variant button (primary, secondary, outline, ghost)
│   │   │   ├── Input.tsx          # Controlled input with inline error feedback & helper text
│   │   │   ├── TextArea.tsx       # Controlled textarea with char count & error feedback
│   │   │   ├── Card.tsx           # Container card with Header, Title, Content, Footer
│   │   │   ├── Badge.tsx          # Pill tags for skills, categories, and featured flags
│   │   │   ├── Alert.tsx          # Visual feedback alert banners (success, error, warning)
│   │   │   ├── SectionHeader.tsx  # Standard section headers with title and accent line
│   │   │   └── LoadingSpinner.tsx # Accessible SVG status spinner
│   │   ├── layout/
│   │   │   ├── Navbar.tsx         # Sticky header with brand, anchor navigation & mobile drawer
│   │   │   └── Footer.tsx         # Copyright, back-to-top button, and social links
│   │   └── sections/
│   │       ├── Hero.tsx           # Headline, bio summary, avatar, location, and social links
│   │       ├── About.tsx          # Detailed narrative bio and engineering pillars
│   │       ├── Skills.tsx         # Technical skills categorized with proficiency bars
│   │       ├── Projects.tsx       # Grid of project cards with live demo and repo buttons
│   │       └── Contact.tsx        # Controlled contact form with real-time validation
│   ├── services/
│   │   ├── api.ts                 # Fetch wrapper with ApiResponse envelope parsing
│   │   └── portfolio.ts           # getProfile, getSkills, getProjects, submitContact
│   └── types/
│       └── index.ts               # Shared contracts and frontend type definitions
└── tests/
    ├── setup.ts                   # JSDOM polyfills & custom Jest DOM matchers
    ├── matchers.d.ts              # Jest Matchers type augmentation
    ├── styleMock.js               # CSS module mock
    └── components/
        ├── HomePage.test.tsx      # Full page integration test
        ├── Navbar.test.tsx        # Navigation & mobile drawer interaction tests
        ├── AboutHero.test.tsx     # Hero & About profile rendering tests
        ├── SkillsSection.test.tsx # Skills category filtering & proficiency tests
        ├── ProjectsSection.test.tsx # Projects grid & external link tests
        ├── ContactForm.test.tsx   # Real-time validation & API submission tests
        └── CommonComponents.test.tsx # Shared UI component library unit tests
```

---

## Design Tokens & UI Guidelines Compliance

- **Semantic Color Tokens**:
  - Primary: `text-primary`, `bg-primary`, `hover:bg-primary-hover`, `bg-primary/10`
  - Feedback: `text-success` / `bg-success-bg`, `text-error` / `bg-error-bg`, `text-warning` / `bg-warning-bg`
  - Neutrals: `text-neutral-title`, `text-neutral-secondary`, `text-neutral-placeholder`, `border-neutral-divider`
  - Surfaces: `bg-container`, `bg-layout`
- **Standard Typography Scale**:
  - `text-h4`: 2rem (32px), bold, tight
  - `text-h6`: 1.25rem (20px), semibold, snug
  - `text-subtitle-1`: 1.125rem (18px), medium
  - `text-body-1`: 1rem (16px), normal
  - `text-caption`: 0.875rem (14px), normal

---

## Available Commands

Run from `personal_portfolio/frontend` (or via monorepo workspace `npm ... --workspace=frontend`):

```bash
# Run unit and integration test suite
npm test

# Run code style and syntax linter
npm run lint

# Run strict TypeScript compiler verification
npm run typecheck

# Build production bundle
npm run build
```

---

## Quality Metrics & Test Results

- **Test Suite**: 7 suites, 49 tests passing, 0 failures.
- **Type Checking**: 0 errors with TypeScript 5.9 strict mode.
- **Linting**: 0 warnings, 0 errors across 35 files.
