# ADR 0002: Preserve Monorepo Shared Boundaries

- Status: Accepted
- Date: 2026-08-25

## Context

The repository was reorganized as a monorepo with `apps/api` and `apps/web`. During migration and redesign work, shared documents, scripts, and policies needed a clear home.

If shared and app-local material were mixed freely, the repository would become harder to navigate and easier to break with unrelated changes.

## Decision

The monorepo keeps a strict ownership split:

- root `docs/` holds only cross-app product, design, architecture, and operating policy
- `apps/api` holds backend implementation detail
- `apps/web` holds frontend implementation detail
- root scripts exist only for workflows that genuinely span both apps

This decision also applies to ADRs: root ADRs are only for repository-level, cross-app, or shared UX decisions.

## Consequences

- Shared decisions belong in root docs and ADRs.
- App-specific runbooks and implementation notes stay with the owning app.
- Commits should remain scoped to one migration unit or one shared concern.
- Future contributors can onboard faster because root-level documentation stays high signal.
