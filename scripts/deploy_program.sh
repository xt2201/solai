#!/usr/bin/env bash
set -euo pipefail

ANCHOR_CLI=${ANCHOR_CLI:-anchor}

if ! command -v "$ANCHOR_CLI" >/dev/null 2>&1; then
  echo "Anchor CLI is required. Install with cargo install --git https://github.com/coral-xyz/anchor anchor-cli" >&2
  exit 1
fi

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)

cd "$PROJECT_ROOT"

$ANCHOR_CLI build
$ANCHOR_CLI deploy
