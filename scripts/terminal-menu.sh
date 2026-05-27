#!/usr/bin/env bash
set -euo pipefail

cd /workspace

if command -v node >/dev/null 2>&1; then
  exec node app/cli.js tui
fi

clear
cat <<'BANNER'
Coding Cold Cases Cracker
=========================

Node.js is not available in this terminal container, so the rich TUI could not start.

Useful fallback commands:

  scripts/kiro-status.sh
  kiro-cli login
  scripts/kiro-solve.sh <case-workspace> <prompt-file>
BANNER

exec bash -l
