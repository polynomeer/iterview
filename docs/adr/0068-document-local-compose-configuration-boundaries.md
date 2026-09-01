# 0068. Document Local Compose Configuration Boundaries

## Status
Accepted

## Date
2026-09-01

## Context

The root Compose file had useful local database defaults, but no checked-in inventory of the
variables a developer could override. The API container also relied on Spring's internal default
for its local token signing secret instead of receiving the Compose-level configuration directly.
This obscured the difference between convenient local defaults and deployment credentials.

## Decision

Add a Git-ignored root `.env` workflow with a checked-in `.env.example` for the local Compose
database fields and `AUTH_TOKEN_SECRET`. Pass `AUTH_TOKEN_SECRET` explicitly from Compose into the
API container, retaining the existing development-only fallback for zero-configuration startup.

The root documentation states that this file is for local development only. Deployed environments
must inject unique credentials and signing secrets from their deployment configuration or secret
manager.

## Consequences

Positive:

- Local configuration is discoverable without committing a real `.env` file.
- The API receives the same configured token secret that Compose documents.
- Deployment secret ownership remains outside the repository and local helper scripts.

Trade-offs:

- The example contains deliberately weak development values, so its local-only scope must remain
  explicit in documentation and review.
