# 0092. Local Scripts Pick Free Ports

## Status
Accepted.

## Date
2026-10-15

## Context
The root scripts and `compose.yml` assumed PostgreSQL on 5432, the API on 8080 and the web app on 5173. Developers run other projects on the same machine, and those projects often hold exactly these ports. Starting the stack then failed with a bind error, and the workaround was a hand-written Compose override file with different ports. `e2e.sh` and `e2e_cleanup.sh` also assumed the defaults, so they had to be told the moved ports by hand.

## Decision
- `compose.yml` publishes `${POSTGRES_PORT:-5432}`, `${API_PORT:-8080}` and `${WEB_PORT:-5173}`.
- Every script that opens a port (`dev_all.sh`, `dev_api.sh`, `dev_web.sh`, `e2e.sh --start`) starts from the default and moves to the next free port. It prints the port it took.
- `POSTGRES_PORT`, `API_PORT` and `WEB_PORT`, from the environment or the root `.env`, pin a port. A pinned port that is taken stops the script; it is never moved silently. `e2e.sh --start` reads `E2E_API_PORT` and `E2E_WEB_PORT` instead, so its own servers never collide with the dev stack's settings.
- Scripts that need a running service find it rather than assume it. The Compose stack's ports come from Docker (`docker compose port`). Host processes started by `dev_api.sh` and `dev_web.sh` record their ports in the ignored `.tmp/ports.env`; a recorded port counts only while something still listens on it.
- The shared helpers live in `scripts/lib/common.sh`, and every root script answers `--help`.

## Consequences
- `./scripts/dev_all.sh` works next to other projects without an override file.
- URLs are no longer fixed. Read them from the script output, or pin them in `.env` when a fixed URL matters (bookmarks, OAuth redirect settings).
- Running `docker compose up` by hand uses the defaults or `.env` again, and can recreate the containers on other ports than the script chose.
- CI is unchanged: its runners have the default ports free.
