#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
LOG_TAG=verify_all

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  echo "Usage: ./scripts/verify_all.sh [install|ci]"
  echo
  echo "The full handoff check: setup, npm audit, all tests, all builds. CI runs it with 'ci'."
  exit 0
fi

bash "$ROOT_DIR/scripts/setup_all.sh" "${1:-install}"
in_app web npm audit
bash "$ROOT_DIR/scripts/test_all.sh"
bash "$ROOT_DIR/scripts/build_all.sh"
log "verification completed"
