# Interview Training Platform Frontend

`apps/web` is the user-facing application for `iterview`. It turns backend interview data into a guided practice experience across daily recommendations, review work, resume analysis, and interview-session flows.

## What Users Can Do Here

The frontend currently covers the learning journey below:

```text
open home
-> inspect today's question or weak areas
-> read question detail or follow-up tree
-> submit an answer
-> review score and feedback
-> retry weak questions or archive mastered ones
-> continue with resume, skills, or interview flows
```

The app already contains screens and modules for:
- home, practice list, and question detail
- answer editor and result analysis
- review queue and archive
- feed and profile settings
- resume management, resume analysis, and resume heatmap views
- resume tailoring flows
- skills dashboard
- mock interview and interview result screens
- practical interview list and review flows
- login and signup

## Frontend Architecture Summary

The codebase follows a layered structure:

```text
src/
  app/
  pages/
  features/
  entities/
  widgets/
  shared/
```

This split is already reflected in the repository and should be preserved:
- `pages` own route-level composition and state branching
- `features` own action logic and API hooks
- `entities` map API data into UI-safe shapes
- `widgets` assemble reusable UI sections
- `shared` holds platform concerns such as config, auth, API client, i18n, theme, and UI primitives

## Tech Stack

- React 19
- TypeScript 5
- Vite 6
- React Router 7
- TanStack Query 5
- Vitest
- Testing Library

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- reachable `iterview` backend API, local or remote

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Create local environment overrides

```bash
cp .env.example .env.local
```

### 3. Configure the backend base URL if needed

Default:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

### 4. Start the development server

```bash
npm run dev
```

Open the Vite local URL shown in the terminal, typically `http://localhost:5173`.

## Environment Variables

The frontend reads only Vite-prefixed variables.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | No | `http://localhost:8080` | Base URL for the backend API. Trailing slashes are trimmed automatically. |

If the backend runs elsewhere:

```bash
VITE_API_BASE_URL=http://localhost:9000
```

## Scripts

- `npm run dev`
  Starts the Vite development server.
- `npm run build`
  Runs TypeScript build checks and creates the production bundle.
- `npm run preview`
  Serves the production build locally.
- `npm run test`
  Starts Vitest in watch mode.
- `npm run test:run`
  Runs the test suite once for CI or handoff verification.

## Local Integration Workflow

Typical local pairing:

1. Start the backend at `http://localhost:8080`
2. Start this frontend with `npm run dev`
3. Sign in and validate the main route flows against the API

Important integration notes:
- some screens such as skill intelligence, question tree, and resume analysis expect additive backend fields or endpoints
- the interview experience includes local MVP route support so the UI can remain testable while backend session capabilities evolve

## Local Verification

Recommended commands before handing off frontend changes:

```bash
npm run test:run
npm run build
```

## Documentation Map

Read these documents in order if you are new to the frontend:

- [`docs/README.md`](docs/README.md)
  Frontend docs index and reading guide.
- [`docs/01-product-overview.md`](docs/01-product-overview.md)
  Frontend-specific explanation of the shared product direction.
- [`docs/02-frontend-architecture.md`](docs/02-frontend-architecture.md)
  Structural rules for pages, features, entities, widgets, and shared modules.
- [`docs/03-routes-and-flows.md`](docs/03-routes-and-flows.md)
  Route-level ownership and user navigation flows.
- [`docs/04-api-integration.md`](docs/04-api-integration.md)
  API shape expectations and frontend integration contracts.
- [`docs/05-implementation-plan.md`](docs/05-implementation-plan.md)
  Delivery sequencing and implementation framing.
- [`docs/06-acceptance-criteria.md`](docs/06-acceptance-criteria.md)
  Acceptance expectations for the frontend scope.

## CI

Repository CI runs from the root workflow at `.github/workflows/ci.yml`.

Frontend validation currently includes:
- `npm ci`
- `npm run test:run`
- `npm run build`
