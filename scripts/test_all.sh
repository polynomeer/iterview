#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[api] ./gradlew test"
(
  cd "$ROOT_DIR/apps/api"
  ./gradlew test
)

echo "[web] npm run test:run"
(
  cd "$ROOT_DIR/apps/web"
  npm run test:run
)

echo "Tests completed for api and web."
