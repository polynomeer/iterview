# 0064. Establish Request Correlation IDs

## Status
Accepted

## Date
2026-09-01

## Context

API failures can be reported from the web workspace without enough information to locate the
corresponding server-side event. Local request logs also lacked a stable identifier shared with
the response, making support and operational diagnosis dependent on timestamps and route guesses.

## Decision

Install an early request filter for every profile. It accepts a client-provided `X-Request-Id` only
when it matches a bounded safe identifier format; otherwise it generates a UUID. The ID is returned
in the response header, stored in logging MDC for the request lifetime, and included in standard API
error payloads. Local request logs emit the same value.

## Consequences

Positive:

- A user-reported API error can be matched to its server-side request deterministically.
- Authentication failures and controller exceptions use the same identifier contract.
- Client-provided trace IDs cannot inject arbitrary log content or unbounded header values.

Trade-offs:

- Request IDs are correlation metadata only, not a user identity or authorization signal.
- Distributed tracing and cross-service propagation can extend this header later; this decision does
  not introduce a tracing backend or expose the header to browser JavaScript across origins.
