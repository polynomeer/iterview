#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
LOG_TAG=test_all

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  echo "Usage: ./scripts/test_all.sh"
  echo
  echo "Runs the API tests (Testcontainers, so Docker must be running) and the web unit tests."
  exit 0
fi

in_app api ./gradlew test
in_app web npm run test:run
log "tests passed for api and web"
