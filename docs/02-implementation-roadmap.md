# 02-implementation-roadmap

## Planning Rules
- keep backend and frontend changes additive
- preserve current route and API behavior unless a task explicitly changes it
- move shared guidance to the monorepo root only when both apps depend on it
- keep app-level build and test logic inside each app

## Shared Delivery Sequence
1. preserve the current MVP loop and verify it in both apps
2. add resume-driven intelligence without breaking baseline practice flows
3. add richer skill and gap signals to shared API and UI entry points
4. expand question detail and result analysis with deeper guidance
5. keep documentation, tests, and CI aligned with each cross-app slice

## Backend Focus
Backend roadmap remains in `apps/api/docs/` for:

- domain modeling
- schema and migration planning
- API contract detail
- repository and service behavior

## Frontend Focus
Frontend roadmap remains in `apps/web/docs/` for:

- route-level implementation
- component composition
- API integration behavior
- screen state handling
