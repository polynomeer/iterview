# iterview

`iterview` is an interview training platform monorepo built to do two things well:
- turn one resume into a deep interview question tree and walk it to the leaves
- build a detailed source of truth for every resume claim before the real interview

This repository is designed to make sense to two audiences quickly:
- developers who want to run, extend, or review the product
- hiring managers or collaborators who want to understand what the product solves and how it is structured

## What The Product Does

At its core, `iterview` treats interview preparation as a resume-defense system.

The product starts from one resume version, expands it into a question tree, and helps the user practice every branch until they can defend the underlying evidence at atomic detail.

```text
resume version
-> resume source of truth
-> root interview question
-> follow-up and tail-question expansion
-> DFS traversal across the full question tree
-> answer simulation and feedback
-> coverage gaps and resume-defense review
```

The current product direction expands that foundation with:
- resume upload and immutable version history
- structured resume source-of-truth authoring and analysis
- question trees and follow-up exploration grounded in one resume
- answer simulation, scoring, and review loops for each node in the tree
- interview-session flows grounded in a selected resume version
- bilingual product support for Korean and English

## Repository Map

```text
iterview/
  apps/
    api/     Kotlin + Spring Boot backend
    web/     React + Vite frontend
  docs/      cross-app product and monorepo documents
  scripts/   cross-app developer helpers
```

Start here if you are new:
- repository and workflow overview: [`docs/README.md`](docs/README.md)
- shared product direction: [`docs/01-product-foundation.md`](docs/01-product-foundation.md)
- shared architecture decisions: [`docs/adr/README.md`](docs/adr/README.md)
- monorepo conventions: [`docs/monorepo-conventions.md`](docs/monorepo-conventions.md)
- backend app guide: [`apps/api/README.md`](apps/api/README.md)
- frontend app guide: [`apps/web/README.md`](apps/web/README.md)

## Current Capabilities

The monorepo already contains working backend and frontend applications for:
- sign up, login, and current-user bootstrap
- profile and target-company settings
- resume upload, version activation, and resume-centered workflows
- question catalog, question detail, question trees, and follow-up exploration
- answer submission, scoring, and result analysis
- review queue, archive, daily card, and feed
- skill intelligence views
- mock interview and practical interview surfaces
- resume tailoring and analysis-related flows

## Tech Stack

### Backend
- Kotlin
- Spring Boot
- Spring Data JPA
- Flyway
- PostgreSQL
- OpenAPI / Swagger

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Vitest + Testing Library

## Quick Start

### 1. Clone and install

```bash
git clone <your-fork-or-origin>
cd iterview
cp .env.example .env # optional: change local Compose defaults before starting
./scripts/setup_all.sh
```

`.env` is ignored by Git. The checked-in example is only for local Compose development; deployed
environments must provide unique database credentials and `AUTH_TOKEN_SECRET` through their own
secret manager or runtime configuration.

### 2. Start the full local stack

For the normal development workflow, run the root helper. It starts Docker if needed,
restarts the `iterview` Compose project, waits for PostgreSQL and API readiness, and then
streams logs:

```bash
./scripts/dev_all.sh
```

Use `Ctrl+C` to stop log streaming; the containers keep running. Set
`STACK_START_TIMEOUT_SECONDS` when the first Gradle startup needs more than the default
four minutes.

### 3. Start applications separately

Use this only when you need to debug an application outside the full Compose stack.

```bash
cd apps/api
docker compose up -d postgres
./gradlew bootRun
```

### 4. Start the frontend

In a second terminal:

```bash
cd apps/web
npm run dev
```

Default local URLs:
- frontend: Vite local dev URL printed in the terminal, usually `http://localhost:5173`
- backend API: `http://localhost:8080`
- backend Swagger UI: `http://localhost:8080/swagger-ui.html`

## Cross-App Scripts

The root `scripts/` directory exists only for workflows that span both apps.

Common commands:

```bash
./scripts/setup_all.sh
./scripts/dev_api.sh
./scripts/dev_web.sh
./scripts/dev_all.sh
./scripts/build_all.sh
./scripts/test_all.sh
./scripts/verify_all.sh
```

More detail: [`scripts/README.md`](scripts/README.md)

## App-Level Documentation

### Backend
- app guide: [`apps/api/README.md`](apps/api/README.md)
- backend docs index: [`apps/api/docs/README.md`](apps/api/docs/README.md)
- backend architecture: [`apps/api/docs/02-backend-architecture.md`](apps/api/docs/02-backend-architecture.md)
- API contracts: [`apps/api/docs/04-api-contracts.md`](apps/api/docs/04-api-contracts.md)

### Frontend
- app guide: [`apps/web/README.md`](apps/web/README.md)
- frontend docs index: [`apps/web/docs/README.md`](apps/web/docs/README.md)
- frontend architecture: [`apps/web/docs/02-frontend-architecture.md`](apps/web/docs/02-frontend-architecture.md)
- API integration notes: [`apps/web/docs/04-api-integration.md`](apps/web/docs/04-api-integration.md)

## How To Read This Repository

If you are evaluating the product:
- read this `README`
- read [`docs/01-product-foundation.md`](docs/01-product-foundation.md)
- skim the backend and frontend app guides

If you are onboarding as a developer:
- run the quick start steps
- use the app-level `README`s as your operational source of truth
- use the app-specific `docs/` folders for deeper architecture and planning context

If you are working on monorepo-wide changes:
- keep cross-app policy in root `docs/`
- keep runtime and implementation detail inside the owning app

## Current Status

This repository is already organized as a two-app monorepo with shared documentation and shared verification scripts at the root.

Operational status and known risks are tracked in:
- [`docs/monorepo-status.md`](docs/monorepo-status.md)

## Contribution Expectations

Repository rules are intentionally simple:
- keep backend and frontend as peer apps under `apps/`
- preserve app-specific build systems
- move files to the root only when they are truly shared
- keep API contracts and frontend integration docs aligned

The authoritative repository guidance lives in:
- [`AGENTS.md`](AGENTS.md)
- [`docs/adr/README.md`](docs/adr/README.md)
- [`docs/monorepo-conventions.md`](docs/monorepo-conventions.md)
