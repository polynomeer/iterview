# Monorepo Conventions

This document defines how to keep the repository simple as it grows.

The goal is not theoretical purity. The goal is operational clarity.

## Repository Model

`iterview` is a two-app monorepo:
- `apps/api`
- `apps/web`

The root exists to explain, coordinate, and verify both apps together. It should not become a second application layer.

## Root Ownership Rules

Keep something at the repository root only when at least one of these is true:
- both apps depend on it directly
- it documents a cross-app workflow
- it coordinates repository-wide CI or local development
- it represents repository-wide policy or orientation

Examples that belong at the root:
- `README.md`
- `AGENTS.md`
- `.github/workflows/ci.yml`
- `docs/` for shared product and repository guidance
- `scripts/` for cross-app setup and verification

## App Ownership Rules

Keep something inside an app when it is coupled to that app's runtime, toolchain, or delivery flow.

Examples that should stay in `apps/api`:
- Gradle wrapper and build files
- Spring configuration
- Flyway migrations
- backend-only scripts
- API-only design and schema docs

Examples that should stay in `apps/web`:
- `package.json`
- Vite and TypeScript configuration
- frontend tests
- UI assets
- route, state, and component design docs

## Documentation Rules

### Root `docs/`

Use root `docs/` for:
- product intent shared by backend and frontend
- monorepo policy
- acceptance baseline
- cross-app sequencing

### App `docs/`

Use app-local `docs/` for:
- domain architecture
- route architecture
- schema design
- API contracts
- app-local implementation planning

### Avoid duplication

- prefer links over copy-paste
- if the same concept must be explained at two levels, give the root doc the high-level framing and the app doc the implementation framing

## Script Rules

### Root scripts

Root `scripts/` should only orchestrate workflows across apps:
- repository setup
- repository dev helpers
- repository build, test, and verify commands

### App scripts

App-local scripts should stay app-local when they serve only one runtime, such as:
- data seeding
- imports
- app-local maintenance

## CI Rules

- prefer one root workflow when the check is logically repository-wide
- keep app-local workflows only if they provide unique coverage that root CI does not yet replace
- do not duplicate the same verification in multiple places without a clear reason

Current decision:
- root CI owns standard build and test verification for `apps/api` and `apps/web`

## Task Tracking Rules

- app-specific backlogs should stay inside the app
- root-level tracking should be reserved for monorepo-wide work or shared product direction

## Change Rules

When changing repository structure:
- move one concern at a time
- prefer simple directory ownership over clever indirection
- keep verification and docs updated in the same change set

## Non-Goals

Do not do these by default:
- flatten backend and frontend into one shared source tree
- create a root Gradle build for the frontend
- create a root npm workspace without a real multi-package need
- move every app-local detail to the root for visibility

## Operational Reference

Current operational follow-up lives in:
- `docs/monorepo-status.md`
