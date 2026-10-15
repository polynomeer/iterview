#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
LOG_TAG=setup

usage() {
  echo "Usage: ./scripts/setup_all.sh [install|ci]"
  echo
  echo "Installs the web dependencies (npm install, or npm ci with 'ci'). The API needs no setup;"
  echo "Gradle fetches its dependencies on the first build."
}

case "${1:-install}" in
  -h | --help) usage; exit 0 ;;
  install) NPM_COMMAND=install ;;
  ci) NPM_COMMAND=ci ;;
  *) usage >&2; die "Unsupported install mode: $1" ;;
esac

[[ -x "$API_DIR/gradlew" ]] || die "Missing apps/api/gradlew"
[[ -f "$WEB_DIR/package.json" ]] || die "Missing apps/web/package.json"

in_app web npm "$NPM_COMMAND"
log "done"
