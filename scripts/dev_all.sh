#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
LOG_TAG=dev_all

usage() {
  cat <<'USAGE'
Usage:
  ./scripts/dev_all.sh [--no-logs]

Restarts the iterview Docker Compose stack (postgres, api, web), waits for its health checks and
follows the logs. Docker Desktop or the Docker service is started when needed.

Host ports start at 5432, 8080 and 5173 and move to the next free port when another process
holds one; POSTGRES_PORT, API_PORT and WEB_PORT (environment or .env) pin them.

  --no-logs   return after the stack is healthy instead of following the logs

STACK_START_TIMEOUT_SECONDS changes the readiness wait (default 240). Ctrl+C stops following the
logs; the containers keep running. ./scripts/stop_all.sh stops them.
USAGE
}

FOLLOW_LOGS=true
for arg in "$@"; do
  case "$arg" in
    -h | --help) usage; exit 0 ;;
    --no-logs) FOLLOW_LOGS=false ;;
    *) usage >&2; die "Unknown argument: $arg" ;;
  esac
done

ensure_docker
load_port_settings

log "stopping the existing stack"
compose down --remove-orphans

# Chosen after `down`, so the stack's own previous ports count as free.
export POSTGRES_PORT API_PORT WEB_PORT
POSTGRES_PORT="$(choose_port POSTGRES_PORT "$DEFAULT_POSTGRES_PORT" postgres)"
API_PORT="$(choose_port API_PORT "$DEFAULT_API_PORT" api)"
WEB_PORT="$(choose_port WEB_PORT "$DEFAULT_WEB_PORT" web)"

log "starting the stack"
compose up -d --remove-orphans --wait --wait-timeout "${STACK_START_TIMEOUT_SECONDS:-240}"

log "web:      http://localhost:$WEB_PORT"
log "api:      http://localhost:$API_PORT"
log "postgres: localhost:$POSTGRES_PORT"

[[ "$FOLLOW_LOGS" == true ]] && compose logs -f --tail=100 postgres api web
exit 0
