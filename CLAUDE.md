@AGENTS.md

# Claude Code Notes

`AGENTS.md` above is the source of truth for repository rules. This file only adds what Claude Code needs on top of it; do not duplicate rules here.

App-level rules load automatically when working inside an app:
- `apps/api/CLAUDE.md` → `apps/api/AGENTS.md`
- `apps/web/CLAUDE.md` → `apps/web/AGENTS.md`

## Commit Per Work Unit

Always commit when a work unit is complete, without waiting to be asked.

- one work unit = one coherent, verified change (one API slice, one screen flow, one migration set, one docs/ADR update, one tooling change)
- before committing: run the relevant tests/build for the changed scope and review `git diff --staged` for unrelated files
- stage files explicitly by path; never `git add -A` blindly
- Conventional Commits: `<type>(<scope>): <summary>` with types `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`
- scopes in use: `root`, `monorepo`, `adr`, `api`, `web`, `ops`, or a domain such as `auth`, `interview`, `resume`
- if a work unit introduces a shared decision, the ADR goes in the same commit
- commit on `main` directly unless the user asks for a branch; never push unless asked

## Commands

Run from the repository root unless noted.

| Purpose | Command |
| --- | --- |
| API tests | `cd apps/api && ./gradlew test` |
| API build | `cd apps/api && ./gradlew build` |
| Web tests | `cd apps/web && npm run test:run` |
| Web build (typecheck + bundle) | `cd apps/web && npm run build` |
| All tests | `./scripts/test_all.sh` |
| Full handoff check | `./scripts/verify_all.sh` |
| Full local stack (Docker) | `./scripts/dev_all.sh` |
| Browser journeys (stack running) | `./scripts/e2e.sh` |
| Browser journeys (start API + web) | `./scripts/e2e.sh --start` |
| Remove local journey accounts | `./scripts/e2e_cleanup.sh` (dry run), then `--apply` |

API integration tests use Testcontainers, so Docker must be running for `./gradlew test`.

## Where Things Live

- shared decisions: `docs/adr/` (next number follows the highest existing file; also update `docs/adr/README.md` index)
- API contracts: `apps/api/docs/04-api-contracts.md` ↔ frontend integration: `apps/web/docs/04-api-integration.md` — keep aligned
- Flyway migrations: `apps/api/src/main/resources/db/migration/` (`V<n>__<snake_case>.sql`, never edit an applied one)
- app backlogs: `apps/api/tasks/`, `apps/web/tasks/`

## Language

The user writes in Korean. Reply in Korean; keep code, commit messages, and docs in English.
