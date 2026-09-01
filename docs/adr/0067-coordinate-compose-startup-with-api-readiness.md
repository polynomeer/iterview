# 0067. Coordinate Compose Startup With API Readiness

## Status
Accepted

## Date
2026-09-01

## Context

The root Compose stack only waited for the API process to start before launching the web
development server. `dev_all.sh` returned to log streaming immediately after `up -d`, so a
developer could reach a frontend whose API had not completed Gradle startup or database
migration. Stopping the stack also did not give Spring Boot an explicit graceful shutdown
window.

## Decision

Use the public `/api/health/ready` endpoint as the API Compose healthcheck. PostgreSQL remains
the API's own healthy dependency, and the web service waits for the API to become healthy rather
than merely started.

`dev_all.sh` restarts the `iterview` Compose project with `docker compose up --wait` and a
configurable `STACK_START_TIMEOUT_SECONDS` limit. Spring Boot uses graceful shutdown with a
bounded lifecycle phase timeout, and the API container receives a matching stop grace period.

## Consequences

Positive:

- The development stack reports ready only after its database-backed API is usable.
- Frontend startup no longer races API migration and application initialization.
- Compose restarts give in-flight API work a bounded shutdown window.

Trade-offs:

- First startup can wait for dependency installation and Gradle compilation before logs stream.
- The API image healthcheck depends on the image-provided `curl` binary and must be updated if
  that base image changes.
