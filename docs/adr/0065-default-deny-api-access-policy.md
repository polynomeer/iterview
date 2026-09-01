# 0065. Default Deny API Access Policy

## Status
Accepted

## Date
2026-09-01

## Context

The API security chain previously ended with `permitAll`. New controller routes that were not
added to the matcher list could therefore bypass the filter-level access policy and depend on
controller-level user lookup as an accidental fallback. This made a missing matcher a security
regression that was difficult to spot during feature work.

## Decision

Use a default-deny policy for API requests. Declare protected workspace domains before explicitly
allowing the small public contract:

- health checks
- sign-up and password login
- public question exploration reads
- OpenAPI and Swagger assets
- profile image reads

All other unmatched routes are denied by Spring Security. Public question patterns are limited to
`GET`; user-contributed reference answers and learning materials remain authenticated writes.

## Consequences

Positive:

- A new route is inaccessible until its intended visibility is reviewed explicitly.
- Filter-level authorization and controller ownership checks reinforce each other.
- Public question reading remains available without accidentally opening contribution APIs.

Trade-offs:

- Every intentional public API addition must update the security configuration and its tests.
- A missing public matcher fails closed, so feature work must include route-policy verification.
