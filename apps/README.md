# apps

The `apps/` directory contains the product's two runtime applications.

## Structure

- `api`
  Kotlin/Spring Boot backend responsible for authentication, resume processing, question and answer workflows, interview APIs, and persistence.
- `web`
  React/Vite frontend responsible for the end-user learning experience, review flows, interview screens, and resume-centered UI.

## Why This Split Exists

`iterview` is intentionally organized as a simple two-app monorepo:
- backend and frontend remain deployable and buildable on their own
- cross-app policy lives at the repository root
- app-specific implementation detail stays close to the owning codebase

## Where To Go Next

- backend guide: [`api/README.md`](api/README.md)
- frontend guide: [`web/README.md`](web/README.md)
- shared repository docs: [`../docs/README.md`](../docs/README.md)
