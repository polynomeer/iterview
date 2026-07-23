# 03-acceptance-baseline

## Shared Acceptance Rules
- the repo structure stays coherent
- backend and frontend remain buildable independently
- cross-app docs live in root `docs/`
- app-specific implementation docs stay with the owning app
- API contracts and frontend integration expectations stay aligned

## Product Baseline
- authentication and current-user flows still work
- profile, resume, question, answer, review, home, and feed flows still work
- additive product work does not break immutable resume versions
- additive product work does not break append-only answer attempts

## Delivery Baseline
- each milestone is verified in the changed scope
- commits stay scoped to one logical checkpoint
- unrelated files are not mixed into a migration commit
