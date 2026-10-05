#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$ROOT_DIR/apps/web"
API_DIR="$ROOT_DIR/apps/api"
BASE_URL="${E2E_BASE_URL:-http://localhost:5173}"
API_PORT="${E2E_API_PORT:-8080}"
WEB_PORT="${E2E_WEB_PORT:-5173}"
START_STACK=false

usage() {
  cat <<'USAGE'
Usage:
  ./scripts/e2e.sh [--start] [playwright args...]

Runs the browser journeys in apps/web/e2e with Playwright.

Without --start the stack must already be running (./scripts/dev_all.sh) and serve the web app
at E2E_BASE_URL (default http://localhost:5173).

With --start the script builds and starts the API jar and a production build of the web app,
runs the journeys, and stops both. E2E_API_PORT and E2E_WEB_PORT (default 8080 and 5173) move
them off ports a running dev stack already uses. PostgreSQL must be reachable at DB_URL (default
jdbc:postgresql://localhost:5432/iterview). CI uses this mode.

Every journey signs up its own e2e-*@iterview.test account, so runs never depend on each other.
USAGE
}

ARGS=()
for arg in "$@"; do
  case "$arg" in
    -h | --help) usage; exit 0 ;;
    --start) START_STACK=true ;;
    *) ARGS+=("$arg") ;;
  esac
done

wait_for() {
  local url="$1" name="$2" seconds="${3:-180}"
  for _ in $(seq 1 "$seconds"); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  echo "$name did not respond at $url within ${seconds}s" >&2
  return 1
}

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
  LOG_DIR="$WEB_DIR/test-results"
  mkdir -p "$LOG_DIR"

  echo "[e2e] building the API jar"
  (cd "$API_DIR" && ./gradlew bootJar --no-daemon -q)
  API_JAR="$(ls "$API_DIR"/build/libs/*.jar | grep -v -- '-plain.jar' | head -1)"

  echo "[e2e] starting the API on port $API_PORT"
  SERVER_PORT="$API_PORT" java -jar "$API_JAR" >"$LOG_DIR/api.log" 2>&1 &
  PIDS+=("$!")

  echo "[e2e] building and serving the web app"
  (cd "$WEB_DIR" && npm run build >/dev/null)
  (cd "$WEB_DIR" && API_PROXY_TARGET="http://localhost:$API_PORT" exec ./node_modules/.bin/vite preview --port "$WEB_PORT" --strictPort >"$LOG_DIR/web.log" 2>&1) &
  PIDS+=("$!")
  BASE_URL="http://localhost:$WEB_PORT"

  wait_for "http://localhost:$API_PORT/api/health/ready" "API"
fi

wait_for "$BASE_URL" "Web app" 60 || {
  echo "Start the stack with ./scripts/dev_all.sh, or run ./scripts/e2e.sh --start." >&2
  exit 1
}

cd "$WEB_DIR"
E2E_BASE_URL="$BASE_URL" npx playwright test "${ARGS[@]+"${ARGS[@]}"}"
