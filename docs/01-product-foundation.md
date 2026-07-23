# 01-product-foundation

## Product Scope
iterview is an interview training platform with two peer applications:

- `apps/api`: Kotlin/Spring Boot backend
- `apps/web`: React/Vite frontend

The product is centered on one learning loop:

```text
resume context
-> question selection
-> answer submission
-> scoring and feedback
-> retry and archive decisions
-> next recommended practice
```

## Current MVP Capabilities
The current baseline across backend and frontend already supports:

- authentication and current-user bootstrap
- profile and settings
- target companies
- resume containers and immutable resume versions
- question catalog and question detail
- answer submission, scoring, and feedback persistence
- retry queue, archive flow, home, and feed

## Product Direction
The next shared direction should extend the current loop instead of replacing it:

- make resume context more visible in question recommendation and answer analysis
- add richer skill radar and gap-analysis signals
- expand question detail with follow-up depth and study material context
- preserve append-only answer history and immutable resume versions
- keep home focused on the next best action

## Ownership Split
Shared product intent belongs in root `docs/`.

Backend-specific implementation detail stays in:

- `apps/api/docs/`

Frontend-specific implementation detail stays in:

- `apps/web/docs/`
