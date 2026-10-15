#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
LOG_TAG=dev_web

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  cat <<'USAGE'
Usage:
  ./scripts/dev_web.sh [vite args...]

Runs the Vite dev server on the host. The port starts at 5173 and moves to the next free one;
WEB_PORT pins it. /api is proxied to the running API (Compose stack or ./scripts/dev_api.sh);
API_PROXY_TARGET overrides that.
USAGE
  exit 0
fi

load_port_settings
WEB_PORT="$(choose_port WEB_PORT "$DEFAULT_WEB_PORT" web)"
if [[ -z "${API_PROXY_TARGET:-}" ]]; then
  api_port="$(running_api_port)"
  [[ -n "$api_port" ]] || log "no running API found; proxying to port $DEFAULT_API_PORT"
  API_PROXY_TARGET="http://localhost:${api_port:-$DEFAULT_API_PORT}"
fi
remember_port WEB_PORT "$WEB_PORT"

log "web: http://localhost:$WEB_PORT (api $API_PROXY_TARGET)"
cd "$WEB_DIR"
API_PROXY_TARGET="$API_PROXY_TARGET" exec npm run dev -- --port "$WEB_PORT" --strictPort "$@"
