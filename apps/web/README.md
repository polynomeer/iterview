# Interview Training Platform Frontend

## Overview
This repository contains the frontend for an interview training platform.

Core user flow:
1. user opens home screen
2. sees today&apos;s question, retry work, and skill or gap previews
3. opens question detail or question tree
4. submits answer tied to the active resume version
5. reviews score, weak patterns, skill impact, and follow-up guidance
6. revisits weak questions through the review queue
7. reviews resume analysis and skill dashboard
8. optionally runs a focused mock interview session
9. tracks archived questions over time

## MVP Screens
- Home
- Practice list
- Question detail
- Question tree
- Answer editor
- Result analysis
- Skills dashboard
- Archive
- Feed
- Profile
- Resume version management
- Resume analysis
- Interview session and session summary

## Source Documents
- docs/01-product-overview.md
- docs/02-frontend-architecture.md
- docs/03-routes-and-flows.md
- docs/04-api-integration.md
- docs/05-implementation-plan.md
- docs/06-acceptance-criteria.md

## Tech Stack
- React
- TypeScript
- Vite
- React Router
- React Query
- Vitest + Testing Library

## Requirements
- Node.js 20+ recommended
- npm 10+ recommended
- `iterview-api` running locally or another reachable API base URL

## Local Setup
1. Install dependencies:
   - `npm install`
2. Create a local env file:
   - `cp .env.example .env.local`
3. Set the backend base URL in `.env.local` if your API is not running at the default local address.
4. Start the frontend:
   - `npm run dev`
5. Open the Vite local URL shown in the terminal.

By default, the frontend expects the backend API at `http://localhost:8080`.

## Environment Variables
The frontend reads Vite-prefixed environment variables.

Required for normal local API integration:

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | No | `http://localhost:8080` | Base URL for `iterview-api`. Trailing slashes are trimmed automatically. |

Example `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

## Scripts
- `npm run dev`
  Starts the Vite development server.
- `npm run build`
  Runs TypeScript project build checks and creates the production bundle.
- `npm run preview`
  Serves the built app locally for a production-style preview.
- `npm run test`
  Starts Vitest in interactive watch mode.
- `npm run test:run`
  Runs the Vitest suite once for CI or local verification.

## Local Backend Integration
The frontend is configured to call `iterview-api` through `VITE_API_BASE_URL`.

Typical local pairing:
1. Start `iterview-api` on `http://localhost:8080`
2. Start this frontend with `npm run dev`
3. Sign in and exercise the screen flows against the local API

Current frontend note:
- some advanced surfaces such as resume analysis, skill radar, and question tree support additive backend endpoints
- the interview session flow currently has a local MVP session mode so the route flow remains usable even before dedicated backend session APIs are available

If the backend runs elsewhere, update `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:9000
```

## Verification
Recommended local verification before handing off changes:
- `npm run test:run`
- `npm run build`

## CI
GitHub Actions runs a minimal frontend validation workflow on pushes to `main` and on pull requests.

The workflow runs:
- `npm ci`
- `npm run test:run`
- `npm run build`
