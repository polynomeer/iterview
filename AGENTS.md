# AGENTS.md

## Repository Purpose
This repository is the monorepo root for the iterview platform.

Expected app layout:
- `apps/api` for the Kotlin/Spring Boot backend
- `apps/web` for the React/Vite frontend

## Working Rules
- prefer keeping app-specific build logic inside each app
- only move files to the root when they are truly shared
- do not introduce a root build orchestrator unless there is a concrete need
- preserve package-by-domain in `apps/api`
- preserve the existing frontend architecture in `apps/web`
- keep API contracts and frontend integration docs aligned
- record shared product, design, architecture, and repository workflow decisions in `docs/adr/`
- when a work unit introduces a new shared decision, add or update the matching ADR in the same work unit

## Migration Rules
- migrate one app or one shared concern at a time
- do not delete the original source trees until the imported app is verified in the monorepo
- favor simple directory moves over clever history rewrites unless explicitly requested
- keep commits scoped to one migration unit

## Definition of Done
A migration step is complete only if:
- the repo structure is coherent
- the changed scope is verified
- unrelated files are not mixed into the commit

## Commit Style
Use Conventional Commits:
- `feat(monorepo): ...`
- `chore(root): ...`
- `docs(root): ...`
- `refactor(monorepo): ...`
