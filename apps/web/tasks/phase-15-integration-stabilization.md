Read AGENTS.md, docs/04-api-integration.md, docs/07-acceptance-criteria.md, and the existing frontend code first.

Stabilize frontend-backend integration for iterview-web.

Scope:
- align API DTO usage
- fix response shape mismatches
- improve date/time handling
- improve error handling for real backend responses
- harden query invalidation and mutation flows

Requirements:
- audit all implemented API integrations against the real backend
- remove mock assumptions that no longer match the backend
- ensure enum handling is explicit and safe
- ensure query invalidation happens correctly after mutations
- improve handling of nullable and optional fields
- make the app resilient to partial payloads where appropriate
- document major API assumptions in code comments or shared types where helpful

Out of scope:
- backend schema redesign
- major frontend rewrite
- full offline support

When finished:
1. summarize integration fixes made
2. summarize DTO or typing adjustments
3. explain major backend/frontend mismatches resolved
4. list remaining integration risks
