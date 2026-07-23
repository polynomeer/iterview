# iterview

Interview training platform monorepo root.

## Layout

```text
iterview/
  apps/
    api/    # Spring Boot backend
    web/    # React/Vite frontend
  docs/
  scripts/
  AGENTS.md
```

## Current State

This repository is the monorepo root for:
- `apps/api`
- `apps/web`

The existing backend and frontend have been imported as peer apps.
The root-level onboarding, verification, and CI flow are in place.

## Principles

- keep backend and frontend as peer apps under `apps/`
- move shared documentation and developer scripts to the root only when they are truly cross-app
- preserve each app's own build system
- avoid mixing Gradle and Node concerns at the root unless there is a strong operational reason

## Local Development

Backend:

```bash
cd apps/api
./gradlew bootRun
```

Frontend:

```bash
cd apps/web
npm install
npm run dev
```

Root helpers:

```bash
./scripts/setup_all.sh
./scripts/dev_api.sh
./scripts/dev_web.sh
./scripts/dev_all.sh
./scripts/build_all.sh
./scripts/test_all.sh
./scripts/verify_all.sh
```

## Verification

Backend:

```bash
cd apps/api
./gradlew build
```

Frontend:

```bash
cd apps/web
npm run build
```

Monorepo CI:

- root workflow: `.github/workflows/ci.yml`
- verifies:
  - root setup script in CI mode
  - `apps/api` build
  - `apps/web` test and build

## Monorepo Status

- current status and open operational risks: `docs/monorepo-status.md`
- root CI is unified in `.github/workflows/ci.yml`
- app-specific implementation notes stay in each app's `docs/`

## Monorepo Notes

- monorepo ownership and cleanup rules: `docs/monorepo-conventions.md`
