# Monorepo Conventions

## Goal

This document defines what belongs at the monorepo root and what should remain inside each app.

Current apps:
- `apps/api`
- `apps/web`

## Root Ownership

Keep a file or directory at the root only if it satisfies at least one of these:
- it is used directly by both apps
- it documents cross-app workflows
- it coordinates cross-app CI or local development
- it represents repository-wide policy

Examples that belong at the root:
- root `README.md`
- root `AGENTS.md`
- root `.github/workflows/ci.yml`
- root `scripts/` for cross-app orchestration
- root `docs/` for monorepo policy and integration notes

## App Ownership

Keep a file inside an app if it is coupled to that app's runtime, toolchain, or delivery process.

Examples that should stay inside `apps/api`:
- Gradle files
- Flyway migrations
- Spring configuration
- API-only implementation docs
- backend-only CI, if it cannot yet be replaced safely

Examples that should stay inside `apps/web`:
- `package.json`
- Vite and TypeScript configuration
- frontend-only implementation docs
- frontend-only tests and assets

## Duplicate Directories

### `.github`
- prefer one root workflow when a check is logically repo-wide
- keep app-local workflows only when they are materially different or still needed during migration
- remove duplicated app-local workflows only after root CI is proven sufficient

Current decision:
- root CI owns standard build and test verification for `apps/api` and `apps/web`
- duplicated per-app `ci.yml` files should be removed when they do not add unique coverage

### `docs`
- move only cross-app documents to root `docs/`
- keep deep implementation docs close to the owning app
- prefer links from root docs rather than copying content

### `scripts`
- root `scripts/` should orchestrate apps
- app `scripts/` should remain app-specific
- avoid copying the same script into all three places

### `tasks`
- keep delivery backlogs inside the owning app while the work is still app-specific
- create root-level task tracking only for monorepo-wide work

## Immediate Follow-up

Safe next cleanup candidates:
1. review `apps/api/.github/workflows/ci.yml` and `apps/web/.github/workflows/ci.yml` against root CI
2. move only truly shared documentation into root `docs/`
3. add root helper scripts only when they reduce repeated manual work

## Non-Goals

Do not do these by default:
- flatten both apps into one shared source tree
- create a root Gradle build for the frontend
- create a root npm workspace unless there is a clear multi-package need
- rewrite every path and document immediately after import
