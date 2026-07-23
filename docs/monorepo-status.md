# Monorepo Status

Last updated: 2026-07-23

## Completed
- backend and frontend are imported as peer apps under `apps/`
- root CI is unified in `/.github/workflows/ci.yml`
- shared cross-app scripts live in `/scripts`
- shared product and roadmap documents live in `/docs`
- app-specific implementation documents remain with the owning app

## Current Verification Path
- setup: `./scripts/setup_all.sh`
- test: `./scripts/test_all.sh`
- build: `./scripts/build_all.sh`
- full verify: `./scripts/verify_all.sh`

## Open Operational Risks
- `apps/web` reports 8 npm audit vulnerabilities after install
- `apps/web` production build still emits a large-chunk warning for the main bundle
- Gradle reports deprecation warnings that should be cleaned up before a Gradle 10 upgrade

## Next Optional Improvements
- address frontend dependency vulnerabilities in a scoped dependency update pass
- split large frontend bundles if startup or deploy size becomes a concern
- add repository-level release or deployment workflow only when there is a concrete need
