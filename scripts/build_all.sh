#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[api] ./gradlew build"
(
  cd "$ROOT_DIR/apps/api"
  ./gradlew build
)

echo "[web] npm run build"
(
  cd "$ROOT_DIR/apps/web"
  npm run build
)

echo "Build completed for api and web."
