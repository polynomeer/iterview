# Backend Backlog

This backlog contains work that is not already delivered in the current API. Completed
interview sessions, practical-interview transcript processing, job-posting APIs, OpenAPI,
and Testcontainers integration coverage are intentionally excluded.

## Product Expansion

### P1. Public Learning And Community
- lounge domain and APIs
- public answer publishing with visibility and ownership rules
- answer comparison snapshots for side-by-side learning

### P2. External Integrations
- GitHub sync integration with explicit consent, token lifecycle, and import boundaries
- admin moderation APIs for public/community content

## Platform Hardening

### P1. Security And Reliability
- authentication and authorization hardening, including token lifecycle review and sensitive-action policies
- rate limiting beyond one node: the per-user limits for login, uploads and generation (ADR 0090) are in memory, so several instances would each allow the full budget
- observability: structured operational metrics, tracing boundaries, and alertable failure signals

### P2. Scale And Operations
- pagination strategy standardization for expanding collection endpoints
- background-job lifecycle for daily-card generation when synchronous generation is no longer sufficient
- retention and cleanup policies for uploaded interview audio and generated artifacts

## Delivery Rule

Start a backlog item only with its owning domain, additive API contract, migration impact,
and focused integration-test plan identified.
