#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ ! -f "$ROOT_DIR/apps/api/gradlew" ]]; then
  echo "Missing apps/api/gradlew" >&2
  exit 1
fi

if [[ ! -f "$ROOT_DIR/apps/web/package.json" ]]; then
  echo "Missing apps/web/package.json" >&2
  exit 1
fi

echo "[web] npm install"
(
  cd "$ROOT_DIR/apps/web"
  npm install
)

echo "Setup completed for the monorepo."
echo "- backend wrapper found at apps/api/gradlew"
echo "- frontend dependencies installed in apps/web"
