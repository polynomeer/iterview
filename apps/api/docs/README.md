# Backend Docs

This directory explains how the backend is shaped, why it is shaped that way, and where upcoming product extensions should fit.

Use it after reading the app guide in [`../README.md`](../README.md).

## Recommended Reading Order

1. [`01-product-overview.md`](01-product-overview.md)
   Backend-specific framing of the shared interview-training product.
2. [`02-backend-architecture.md`](02-backend-architecture.md)
   Package-by-domain rules, ownership boundaries, and extension principles.
3. [`03-db-schema.md`](03-db-schema.md)
   Persistence model and schema structure.
4. [`04-api-contracts.md`](04-api-contracts.md)
   Request and response expectations for backend consumers.
5. [`05-implementation-plan.md`](05-implementation-plan.md)
   Sequencing and rollout expectations.
6. [`06-acceptance-criteria.md`](06-acceptance-criteria.md)
   Definition of done for backend-facing work.
7. [`07-backend-gap-analysis.md`](07-backend-gap-analysis.md)
   Follow-up analysis of what is still missing or additive.
8. [`08-frontend-api.md`](08-frontend-api.md)
   Notes that help keep backend contracts aligned with frontend expectations.

## Supporting Material

- `drafts/`
  Exploratory feature design notes that should not be treated as final contracts.
- `prompts/`
  Prompt assets and related working notes used by AI-backed backend features.

## Scope Rule

Keep documents here when they are backend-owned:
- service design
- schema decisions
- backend API contracts
- backend-only rollout planning

If a document becomes truly shared across backend and frontend, move or summarize it under root [`../../../docs/`](../../../docs/).
