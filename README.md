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
./scripts/dev_api.sh
./scripts/dev_web.sh
./scripts/dev_all.sh
./scripts/build_all.sh
./scripts/test_all.sh
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

## Remaining Monorepo Tasks

1. normalize duplicated docs and scripts between `apps/api` and `apps/web`
2. decide whether CI should remain per-app or be partially unified at the root
3. add root-level developer helpers only for workflows that span both apps
4. move only truly shared documentation into `docs/`
