#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/compose.yml"
DOCKER_START_TIMEOUT_SECONDS="${DOCKER_START_TIMEOUT_SECONDS:-120}"

usage() {
  cat <<'EOF'
Usage:
  ./scripts/dev_all.sh

Behavior:
  - ensures the Docker daemon is running
  - stops the existing iterview Docker Compose stack when present
  - starts a fresh iterview Docker Compose stack
  - follows logs from postgres, api, and web containers

Notes:
  - the compose project name is iterview
  - stop log streaming with Ctrl+C, containers keep running
EOF
}

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Missing $COMPOSE_FILE" >&2
  exit 1
fi

docker_compose() {
  (
    cd "$ROOT_DIR"
    docker compose -f "$COMPOSE_FILE" "$@"
  )
}

docker_daemon_ready() {
  docker info >/dev/null 2>&1
}

ensure_docker_cli() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker CLI is not installed or not on PATH." >&2
    exit 1
  fi
}

start_docker_daemon() {
  if docker_daemon_ready; then
    return
  fi

  case "$(uname -s)" in
    Darwin)
      if command -v open >/dev/null 2>&1; then
        echo "[docker] starting Docker Desktop"
        open -a Docker >/dev/null 2>&1 || true
      fi
      ;;
    Linux)
      if command -v systemctl >/dev/null 2>&1; then
        echo "[docker] starting Docker service"
        systemctl --user start docker >/dev/null 2>&1 || systemctl start docker >/dev/null 2>&1 || true
      fi
      ;;
  esac

  local waited=0
  until docker_daemon_ready; do
    if (( waited >= DOCKER_START_TIMEOUT_SECONDS )); then
      echo "Docker daemon did not become ready within ${DOCKER_START_TIMEOUT_SECONDS}s." >&2
      exit 1
    fi

    sleep 2
    waited=$((waited + 2))
  done
}

restart_stack() {
  echo "[docker] stopping existing iterview stack"
  docker_compose down --remove-orphans

  echo "[docker] starting fresh iterview stack"
  docker_compose up -d --remove-orphans
}

ensure_docker_cli
start_docker_daemon
restart_stack

echo "[docker] project: iterview"
echo "[docker] frontend: http://localhost:5173"
echo "[docker] backend:  http://localhost:8080"

docker_compose logs -f --tail=100 postgres api web
