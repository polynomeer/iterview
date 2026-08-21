# 03-acceptance-baseline

This document defines the minimum repository-wide acceptance standard for any meaningful change.

It exists to keep the monorepo coherent while backend and frontend evolve at different speeds.

## Repository Acceptance

- the repository structure stays coherent
- backend and frontend remain independently buildable
- cross-app documentation lives in root `docs/`
- app-specific implementation documentation stays with the owning app
- root scripts and CI remain understandable to a first-time contributor

## Product Acceptance

The core interview-training loop must remain intact:
- authentication and current-user bootstrap work
- profile and settings flows work
- resume lifecycle flows work
- question discovery and question detail work
- answer submission and answer history work
- result analysis and review queue work
- archive, home, and feed work

## Data Integrity Acceptance

- resume versions remain immutable historical records
- answer attempts remain append-only historical records
- retry state remains durable
- archive continues to be question-level
- interview history remains distinct from archive
- additive intelligence features do not destroy traceability back to source records

## Documentation Acceptance

- public-facing repository docs explain the product clearly
- technical docs describe the changed scope, not just aspirational scope
- route, endpoint, and domain terminology remain consistent
- backend and frontend docs stay aligned when a cross-app contract changes

## Verification Acceptance

The changed scope should be verified at the closest useful level:
- local script verification when repository-wide behavior changes
- backend build or test verification when backend behavior changes
- frontend build or test verification when frontend behavior changes
- manual flow checks when a user journey changed materially

## Change Hygiene

- commits stay scoped to one logical checkpoint
- unrelated files are not mixed into focused work
- migration steps remain understandable in isolation
- shared docs are updated when the repository mental model changed
