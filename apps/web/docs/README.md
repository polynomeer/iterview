# Frontend Docs

This directory explains how the web application delivers the `iterview` experience and how new screens or integrations should fit the existing frontend architecture.

Use it after reading the app guide in [`../README.md`](../README.md).

## Recommended Reading Order

1. [`01-product-overview.md`](01-product-overview.md)
   Frontend-specific framing of the shared product and user journey.
2. [`02-frontend-architecture.md`](02-frontend-architecture.md)
   Structural rules for pages, features, entities, widgets, and shared modules.
3. [`03-routes-and-flows.md`](03-routes-and-flows.md)
   Route ownership and major user flows.
4. [`04-api-integration.md`](04-api-integration.md)
   How frontend modules are expected to consume backend APIs.
5. [`05-implementation-plan.md`](05-implementation-plan.md)
   Delivery sequencing and implementation guidance.
6. [`06-acceptance-criteria.md`](06-acceptance-criteria.md)
   Definition of done for frontend-facing work.
7. [`07-frontend-gap-analysis.md`](07-frontend-gap-analysis.md)
   Follow-up analysis of missing or additive frontend scope.

## Supporting Material

- `prompts/`
  Prompt assets and working notes for AI-assisted frontend-adjacent features.

## Scope Rule

Keep documents here when they are frontend-owned:
- route and screen design
- UI state modeling
- API consumption rules
- frontend rollout detail

If a document becomes cross-app policy or shared product guidance, move or summarize it under root [`../../../docs/`](../../../docs/).
