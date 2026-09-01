# 0057. Enforce Frontend Dependency Audits In Shared Verification

## Status
Accepted

## Date
2026-09-01

## Context

The shared verification script installed, tested, and built the frontend, but it did not fail when a dependency advisory was introduced. A recent audit found security issues in React Router, Vite, Vitest, and their transitive dependencies despite successful application tests and builds.

## Decision

Run `npm audit` for the frontend after dependency installation and before the shared test and build steps in `scripts/verify_all.sh`.

The same command now runs for both local verification and the GitHub Actions `ci` mode, so a known vulnerable dependency blocks the shared verification path until it is patched or explicitly addressed.

## Consequences

Positive:

- Dependency advisories are detected before tests and builds consume the affected toolchain.
- Local and CI verification apply the same security baseline.
- The repository does not rely on a manually remembered audit step.

Trade-offs:

- Verification now depends on npm audit registry availability.
- Newly published advisories can block CI even when application code has not changed; this is intentional and requires a scoped dependency maintenance response.
