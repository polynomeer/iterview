#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
LOG_TAG=e2e

usage() {
  cat <<'USAGE'
Usage:
  ./scripts/e2e.sh [--start] [playwright args...]

Runs the browser journeys in apps/web/e2e with Playwright.

Without --start the journeys run against the web app that is already running: the Compose stack
(./scripts/dev_all.sh) or ./scripts/dev_web.sh, on whatever port it got. E2E_BASE_URL points them
somewhere else.

With --start the script builds the API jar and a production build of the web app, serves both on
free ports (from 8080 and 5173 upward; E2E_API_PORT and E2E_WEB_PORT pin them), runs the journeys
and stops both. The API uses DB_URL, which defaults to the Compose postgres when it is running,
otherwise jdbc:postgresql://localhost:5432/iterview. CI uses this mode.

Every journey signs up its own e2e-*@iterview.test account, so runs never depend on each other;
./scripts/e2e_cleanup.sh removes them.
USAGE
}

START_STACK=false
ARGS=()
for arg in "$@"; do
  case "$arg" in
    -h | --help) usage; exit 0 ;;
    --start) START_STACK=true ;;
    *) ARGS+=("$arg") ;;
  esac
done

PIDS=()
cleanup() {
  for pid in "${PIDS[@]:-}"; do
    [[ -n "$pid" ]] || continue
    pkill -TERM -P "$pid" >/dev/null 2>&1 || true
    kill "$pid" >/dev/null 2>&1 || true
  done
}
trap cleanup EXIT

if [[ "$START_STACK" == true ]]; then
  API_PORT="$(API_PORT="${E2E_API_PORT:-}" choose_port API_PORT "$DEFAULT_API_PORT" api)"
  WEB_PORT="$(WEB_PORT="${E2E_WEB_PORT:-}" choose_port WEB_PORT "$DEFAULT_WEB_PORT" web)"
  if [[ -z "${DB_URL:-}" ]]; then
    postgres_port="$(running_postgres_port)"
    DB_URL="jdbc:postgresql://localhost:${postgres_port:-$DEFAULT_POSTGRES_PORT}/${POSTGRES_DB:-iterview}"
  fi
  LOG_DIR="$WEB_DIR/test-results"
  mkdir -p "$LOG_DIR"

  log "building the API jar"
  (cd "$API_DIR" && ./gradlew bootJar --no-daemon -q)
  API_JAR="$(ls "$API_DIR"/build/libs/*.jar | grep -v -- '-plain.jar' | head -1)"

  log "starting the API on port $API_PORT (database $DB_URL)"
  SERVER_PORT="$API_PORT" DB_URL="$DB_URL" java -jar "$API_JAR" >"$LOG_DIR/api.log" 2>&1 &
  PIDS+=("$!")

  log "building and serving the web app on port $WEB_PORT"
  (cd "$WEB_DIR" && npm run build >/dev/null)
  (cd "$WEB_DIR" && API_PROXY_TARGET="http://localhost:$API_PORT" exec ./node_modules/.bin/vite preview --port "$WEB_PORT" --strictPort >"$LOG_DIR/web.log" 2>&1) &
  PIDS+=("$!")
  BASE_URL="http://localhost:$WEB_PORT"

  wait_for_url "http://localhost:$API_PORT/api/health/ready" "API"
elif [[ -n "${E2E_BASE_URL:-}" ]]; then
  BASE_URL="$E2E_BASE_URL"
else
  web_port="$(running_web_port)"
  [[ -n "$web_port" ]] || die "No running web app found. Start it with ./scripts/dev_all.sh, or run ./scripts/e2e.sh --start."
  BASE_URL="http://localhost:$web_port"
fi

wait_for_url "$BASE_URL" "Web app" 60 || die "Start the stack with ./scripts/dev_all.sh, or run ./scripts/e2e.sh --start."

log "journeys against $BASE_URL"
cd "$WEB_DIR"
E2E_BASE_URL="$BASE_URL" npx playwright test "${ARGS[@]+"${ARGS[@]}"}"
