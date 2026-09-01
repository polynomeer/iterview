# 0066. Separate Liveness From Readiness

## Status
Accepted

## Date
2026-09-01

## Context

The API exposed one unauthenticated health endpoint that reported process availability only.
Deployment systems could not distinguish a running process from an instance that could no longer
reach PostgreSQL, the service's primary required dependency.

## Decision

Preserve `/api/health` for compatibility and add two public probe endpoints:

- `/api/health/live` reports whether the application process can serve requests.
- `/api/health/ready` performs a minimal database query and returns `503` when PostgreSQL is unavailable.

Readiness responses identify dependency state as `up` or `down` but do not expose connection
details, credentials, or exception messages. Both probe paths are explicit public exceptions in
the default-deny API access policy and are included in OpenAPI verification.

## Consequences

Positive:

- Orchestrators can restart a dead process without removing a healthy-but-starting instance.
- Load balancers can stop sending new traffic to an instance that has lost database access.
- Operators receive a stable and documented probe contract without adding an actuator dependency.

Trade-offs:

- Readiness incurs a lightweight database query per probe interval.
- Additional required dependencies must be added deliberately to readiness rather than assumed.
