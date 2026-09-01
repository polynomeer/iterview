# Monorepo Status

Last updated: 2026-09-01

This document is the operational snapshot of the repository, not the product roadmap.

## Current Shape

The repository is operating as a two-app monorepo:
- `apps/api`
  Kotlin and Spring Boot backend
- `apps/web`
  React and Vite frontend

Shared assets currently live at the root:
- `docs/` for cross-app product and repository documentation
- `scripts/` for cross-app developer workflows
- `.github/workflows/ci.yml` for repository CI

## What Is Already In Place

- backend and frontend are colocated under `apps/`
- root CI is unified in `.github/workflows/ci.yml`
- root scripts provide setup, dev, test, build, and verify helpers
- shared product and monorepo docs exist at the root
- app-specific technical docs remain close to the owning app

## Current Verification Path

- setup: `./scripts/setup_all.sh`
- start backend only: `./scripts/dev_api.sh`
- start frontend only: `./scripts/dev_web.sh`
- start both: `./scripts/dev_all.sh`
- tests: `./scripts/test_all.sh`
- builds: `./scripts/build_all.sh`
- full verify: `./scripts/verify_all.sh`

## CI Status

Repository CI currently runs a single GitHub Actions workflow:
- file: `.github/workflows/ci.yml`
- trigger: pushes to `main` and all pull requests
- runtime: Ubuntu, Java 21, Node 20
- command: `bash ./scripts/verify_all.sh ci`

That means CI currently verifies:
- frontend dependency installation with `npm ci`
- frontend dependency security with `npm audit`
- backend tests and build
- frontend tests and build

## Latest Verification Baseline

Verified locally on 2026-09-01:
- frontend regression suite: 38 test files and 73 tests passed
- frontend production build: passed with Vite `6.4.3`
- frontend dependency audit: 0 known vulnerabilities
- API Kotlin Gradle Plugin: upgraded to `2.3.10`, which is compatible with Gradle `9.0.0`
- representative backend Testcontainers integration test: Flyway migration test passed against PostgreSQL 16

## Observed Operational Risks

- frontend dependencies passed `npm audit` with no known vulnerabilities
- repository-wide verification still depends on local environment support for backend test prerequisites such as Docker when integration tests require it

## Practical Implications For Contributors

- there is no root Gradle build orchestrator
- there is no root npm workspace
- backend and frontend should still be treated as independent runtimes that happen to live in one repository
- when documentation, scripts, or CI change, the root repository viewpoint must remain understandable on its own

## Healthy Next Improvements

- keep the frontend dependency audit clean as dependencies are upgraded
- measure real-user startup cost before deciding whether additional frontend bundle splitting is necessary
- reassess Kotlin Gradle Plugin compatibility when preparing a future Gradle major upgrade
- keep root docs in sync with newly added product areas such as replay, tailoring, and editor workflows
- add release or deployment automation only when a real operational need appears
