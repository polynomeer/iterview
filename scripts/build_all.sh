#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
LOG_TAG=build_all

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  echo "Usage: ./scripts/build_all.sh"
  echo
  echo "Builds the API (./gradlew build, which also runs its tests) and the web app."
  exit 0
fi

in_app api ./gradlew build
in_app web npm run build
log "build completed for api and web"
