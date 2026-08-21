# docs

This directory holds documents that explain `iterview` at the repository level rather than from one app's point of view.

Use these files when you want to understand product intent, monorepo policy, or shared delivery expectations before diving into backend or frontend detail.

## Recommended Reading Order

1. [`01-product-foundation.md`](01-product-foundation.md)
   Shared product loop, current scope, and cross-app direction.
2. [`02-implementation-roadmap.md`](02-implementation-roadmap.md)
   Shared implementation sequencing and delivery framing.
3. [`03-acceptance-baseline.md`](03-acceptance-baseline.md)
   The baseline definition of done across the product.
4. [`04-design-refresh-strategy.md`](04-design-refresh-strategy.md)
   Shared UX and visual-system reset strategy for the product redesign.
5. [`monorepo-conventions.md`](monorepo-conventions.md)
   What belongs at the root versus inside each app.
6. [`monorepo-status.md`](monorepo-status.md)
   Current operational status, known risks, and verification path.

## What Belongs Here

Keep documentation in root `docs/` only when it is truly shared:
- product direction used by both backend and frontend
- shared design and UX strategy that both apps must follow
- repository-wide engineering policy
- cross-app roadmap and acceptance criteria
- monorepo migration or operating guidance

## What Does Not Belong Here

Do not move app-specific runtime or implementation notes here just for visibility.

Keep those close to the owning app:
- backend detail: [`../apps/api/docs/README.md`](../apps/api/docs/README.md)
- frontend detail: [`../apps/web/docs/README.md`](../apps/web/docs/README.md)
