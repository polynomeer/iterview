# Shared helpers for the root scripts. Source it; do not run it.
#
#   source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
#
# Port handling (ADR 0092): every script that opens a port starts from the usual default
# (PostgreSQL 5432, API 8080, web 5173) and moves to the next free port when another process
# already holds it. POSTGRES_PORT, API_PORT and WEB_PORT, from the environment or the root .env,
# pin a port instead; a pinned port that is taken is an error, never silently moved.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
API_DIR="$ROOT_DIR/apps/api"
WEB_DIR="$ROOT_DIR/apps/web"
COMPOSE_FILE="$ROOT_DIR/compose.yml"
# Ports of the API and web processes started on the host (dev_api.sh, dev_web.sh), so the other
# scripts can find them. The Compose stack's ports are read from Docker instead.
PORTS_FILE="$ROOT_DIR/.tmp/ports.env"

DEFAULT_POSTGRES_PORT=5432
DEFAULT_API_PORT=8080
DEFAULT_WEB_PORT=5173

log() { printf '[%s] %s\n' "${LOG_TAG:-scripts}" "$*"; }
die() { printf '[%s] %s\n' "${LOG_TAG:-scripts}" "$*" >&2; exit 1; }

# Runs a command inside an app directory with a header line, e.g. `in_app web npm run build`.
in_app() {
  local app="$1"
  shift
  printf '[%s] %s\n' "$app" "$*"
  (cd "$ROOT_DIR/apps/$app" && "$@")
}

# Reads the port settings from the root .env without sourcing it, so the rest of the file never
# runs as shell. Values already in the environment win, as they do for Docker Compose.
load_port_settings() {
  local name value
  [[ -f "$ROOT_DIR/.env" ]] || return 0
  for name in POSTGRES_PORT API_PORT WEB_PORT; do
    [[ -n "${!name:-}" ]] && continue
    value="$(grep -E "^${name}=" "$ROOT_DIR/.env" | tail -1 | cut -d= -f2- | tr -d '"'"'"' ')"
    [[ -n "$value" ]] && export "$name=$value"
  done
  return 0
}

port_in_use() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1 && lsof -nP -iTCP:"$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
    return 0
  fi
  # lsof does not list sockets of other users' processes, so also try to connect.
  (exec 3<>"/dev/tcp/127.0.0.1/$port") >/dev/null 2>&1
}

# Prints the port to use for NAME (POSTGRES_PORT, API_PORT or WEB_PORT): the pinned value when
# set, otherwise the first free port from the default upward.
choose_port() {
  local name="$1" default="$2" label="$3" port
  if [[ -n "${!name:-}" ]]; then
    port_in_use "${!name}" && die "$name=${!name} is pinned, but another process already listens on it."
    echo "${!name}"
    return
  fi
  port="$default"
  while port_in_use "$port"; do
    port=$((port + 1))
    (( port - default > 100 )) && die "No free port for $label between $default and $port."
  done
  (( port != default )) && log "port $default is taken; $label uses $port" >&2
  echo "$port"
}

remember_port() {
  local name="$1" port="$2"
  mkdir -p "$(dirname "$PORTS_FILE")"
  touch "$PORTS_FILE"
  grep -v "^${name}=" "$PORTS_FILE" >"$PORTS_FILE.tmp" || true
  echo "$name=$port" >>"$PORTS_FILE.tmp"
  mv "$PORTS_FILE.tmp" "$PORTS_FILE"
}

# Prints a port remembered by a host process, only while something still listens on it.
remembered_port() {
  local name="$1" port
  [[ -f "$PORTS_FILE" ]] || return 0
  port="$(grep -E "^${name}=" "$PORTS_FILE" | tail -1 | cut -d= -f2)"
  if [[ -n "$port" ]] && port_in_use "$port"; then
    echo "$port"
  fi
}

compose() {
  docker compose --project-directory "$ROOT_DIR" -f "$COMPOSE_FILE" "$@"
}

# Prints the host port Docker published for a running Compose service, or nothing.
compose_port() {
  local service="$1" container_port="$2"
  command -v docker >/dev/null 2>&1 || return 0
  docker info >/dev/null 2>&1 || return 0
  compose port "$service" "$container_port" 2>/dev/null | tail -1 | sed 's/.*://'
}

# Where the running API, web app and database are, wherever they were started: the Compose stack
# first, then the host processes. Prints nothing when none is running.
running_api_port() {
  local port
  port="$(compose_port api 8080)"
  [[ -n "$port" ]] && { echo "$port"; return; }
  remembered_port API_PORT
}

running_web_port() {
  local port
  port="$(compose_port web 5173)"
  [[ -n "$port" ]] && { echo "$port"; return; }
  remembered_port WEB_PORT
}

running_postgres_port() {
  compose_port postgres 5432
}

wait_for_url() {
  local url="$1" name="$2" seconds="${3:-180}"
  for _ in $(seq 1 "$seconds"); do
    curl -fsS "$url" >/dev/null 2>&1 && return 0
    sleep 1
  done
  echo "$name did not respond at $url within ${seconds}s" >&2
  return 1
}

ensure_docker() {
  local timeout="${DOCKER_START_TIMEOUT_SECONDS:-120}" waited=0
  command -v docker >/dev/null 2>&1 || die "Docker CLI is not installed or not on PATH."
  docker info >/dev/null 2>&1 && return 0

  case "$(uname -s)" in
    Darwin)
      log "starting Docker Desktop"
      open -a Docker >/dev/null 2>&1 || true
      ;;
    Linux)
      if command -v systemctl >/dev/null 2>&1; then
        log "starting the Docker service"
        systemctl --user start docker >/dev/null 2>&1 || systemctl start docker >/dev/null 2>&1 || true
      fi
      ;;
  esac

  until docker info >/dev/null 2>&1; do
    (( waited >= timeout )) && die "Docker daemon did not become ready within ${timeout}s."
    sleep 2
    waited=$((waited + 2))
  done
}
