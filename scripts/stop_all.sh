#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
LOG_TAG=stop_all

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  echo "Usage: ./scripts/stop_all.sh"
  echo
  echo "Stops the iterview Docker Compose stack. Volumes (database, caches) are kept."
  exit 0
fi

docker info >/dev/null 2>&1 || die "Docker is not running; nothing to stop."
compose down --remove-orphans
log "stack stopped"
