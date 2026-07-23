#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SETUP_MODE="${1:-install}"

bash "$ROOT_DIR/scripts/setup_all.sh" "$SETUP_MODE"
bash "$ROOT_DIR/scripts/test_all.sh"
bash "$ROOT_DIR/scripts/build_all.sh"

echo "Verification completed for the monorepo."
