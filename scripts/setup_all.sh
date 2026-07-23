#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INSTALL_MODE="${1:-install}"

if [[ ! -f "$ROOT_DIR/apps/api/gradlew" ]]; then
  echo "Missing apps/api/gradlew" >&2
  exit 1
fi

if [[ ! -f "$ROOT_DIR/apps/web/package.json" ]]; then
  echo "Missing apps/web/package.json" >&2
  exit 1
fi

case "$INSTALL_MODE" in
  install)
    echo "[web] npm install"
    (
      cd "$ROOT_DIR/apps/web"
      npm install
    )
    ;;
  ci)
    echo "[web] npm ci"
    (
      cd "$ROOT_DIR/apps/web"
      npm ci
    )
    ;;
  *)
    echo "Unsupported install mode: $INSTALL_MODE" >&2
    echo "Usage: $0 [install|ci]" >&2
    exit 1
    ;;
esac

echo "Setup completed for the monorepo."
echo "- backend wrapper found at apps/api/gradlew"
echo "- frontend dependencies prepared in apps/web"
