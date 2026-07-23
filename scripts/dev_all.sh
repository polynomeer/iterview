#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="$ROOT_DIR/apps/api"
WEB_DIR="$ROOT_DIR/apps/web"

usage() {
  cat <<'EOF'
Usage:
  ./scripts/dev_all.sh

Behavior:
  - starts the api with ./gradlew bootRun
  - starts the web with npm run dev
  - forwards termination signals to both child processes

Notes:
  - run npm install in apps/web first if dependencies are missing
  - stop with Ctrl+C
EOF
}

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

if [[ ! -d "$API_DIR" || ! -d "$WEB_DIR" ]]; then
  echo "Expected apps/api and apps/web under $ROOT_DIR" >&2
  exit 1
fi

if [[ ! -f "$WEB_DIR/package.json" ]]; then
  echo "Missing apps/web/package.json" >&2
  exit 1
fi

cleanup() {
  local exit_code=$?

  if [[ -n "${API_PID:-}" ]] && kill -0 "$API_PID" 2>/dev/null; then
    kill "$API_PID" 2>/dev/null || true
  fi

  if [[ -n "${WEB_PID:-}" ]] && kill -0 "$WEB_PID" 2>/dev/null; then
    kill "$WEB_PID" 2>/dev/null || true
  fi

  wait "${API_PID:-}" 2>/dev/null || true
  wait "${WEB_PID:-}" 2>/dev/null || true

  exit "$exit_code"
}

trap cleanup INT TERM EXIT

echo "[api] ./gradlew bootRun"
(
  cd "$API_DIR"
  ./gradlew bootRun
) &
API_PID=$!

echo "[web] npm run dev"
(
  cd "$WEB_DIR"
  npm run dev
) &
WEB_PID=$!

wait -n "$API_PID" "$WEB_PID"
