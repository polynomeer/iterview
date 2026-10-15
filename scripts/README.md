# scripts

Root scripts coordinate both apps. They stay thin: app-specific automation lives inside the app
(`apps/api/scripts/`, `apps/web/package.json`). Every script answers `--help`.

| Script | What it does |
| --- | --- |
| `setup_all.sh [install\|ci]` | Installs the web dependencies (`npm install` or `npm ci`). |
| `dev_all.sh [--no-logs]` | Restarts the Docker Compose stack (postgres, api, web), waits for health checks, follows logs. Starts Docker when needed. |
| `stop_all.sh` | Stops the Compose stack; volumes are kept. |
| `dev_api.sh [gradle args]` | Runs the API on the host with `./gradlew bootRun`. |
| `dev_web.sh [vite args]` | Runs the Vite dev server on the host, proxying `/api` to the running API. |
| `test_all.sh` | API tests (Testcontainers, so Docker must run) and web unit tests. |
| `build_all.sh` | API build (runs its tests too) and web build. |
| `verify_all.sh [install\|ci]` | Full handoff check: setup, `npm audit`, tests, builds. CI runs it with `ci`. |
| `e2e.sh [--start] [playwright args]` | Browser journeys. Without `--start`, against the running web app; with it, builds and serves API and web itself. CI uses `--start`. |
| `e2e_cleanup.sh [--apply]` | Removes the `e2e-*@iterview.test` accounts from the Compose database. Dry run without `--apply`. |

Shared helpers live in `lib/common.sh`.

## Ports

Other projects on the same machine often hold 5432, 8080 or 5173, so the scripts never assume
them (ADR 0092):

- `dev_all.sh`, `dev_api.sh`, `dev_web.sh` and `e2e.sh --start` start from the default port and
  move to the next free one, printing the port they took.
- `POSTGRES_PORT`, `API_PORT` and `WEB_PORT`, from the environment or the root `.env`, pin a port.
  A pinned port that is taken stops the script instead of moving. `e2e.sh --start` reads
  `E2E_API_PORT` and `E2E_WEB_PORT` instead, so it never fights the dev stack.
- The other scripts find what is running: the Compose stack's ports come from Docker
  (`docker compose port`), host processes started by `dev_api.sh`/`dev_web.sh` record theirs in
  `.tmp/ports.env`. `dev_web.sh` proxies to the running API, `dev_api.sh` and `e2e.sh --start`
  use the running Compose postgres, `e2e.sh` targets the running web app.

Running `docker compose up` by hand uses the defaults (or the `.env` values) again; use
`dev_all.sh`, or pin the ports in `.env`.

## Environment

| Variable | Used by | Default |
| --- | --- | --- |
| `STACK_START_TIMEOUT_SECONDS` | `dev_all.sh` | `240` |
| `DOCKER_START_TIMEOUT_SECONDS` | `dev_all.sh` | `120` |
| `DB_URL` | `dev_api.sh`, `e2e.sh --start` | the running Compose postgres, else `localhost:5432` |
| `API_PROXY_TARGET` | `dev_web.sh` | the running API, else `http://localhost:8080` |
| `E2E_BASE_URL` | `e2e.sh` | the running web app |
| `E2E_EMAIL_PATTERN` | `e2e_cleanup.sh` | `e2e-%@iterview.test` |
