#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
LOG_TAG=dev_api

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  cat <<'USAGE'
Usage:
  ./scripts/dev_api.sh [gradle args...]

Runs the API on the host with ./gradlew bootRun. The port starts at 8080 and moves to the next
free one; API_PORT pins it. DB_URL defaults to the Compose postgres when it is running, otherwise
jdbc:postgresql://localhost:5432/iterview.
USAGE
  exit 0
fi

load_port_settings
API_PORT="$(choose_port API_PORT "$DEFAULT_API_PORT" api)"
if [[ -z "${DB_URL:-}" ]]; then
  postgres_port="$(running_postgres_port)"
  DB_URL="jdbc:postgresql://localhost:${postgres_port:-$DEFAULT_POSTGRES_PORT}/${POSTGRES_DB:-iterview}"
fi
remember_port API_PORT "$API_PORT"

log "api: http://localhost:$API_PORT (database $DB_URL)"
cd "$API_DIR"
SERVER_PORT="$API_PORT" DB_URL="$DB_URL" exec ./gradlew bootRun "$@"
