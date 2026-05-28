#!/usr/bin/env bash
set -euo pipefail

cd /workspace

session="${TMUX_SESSION:-coldcase}"
control_port="${TERMINAL_CONTROL_PORT:-7682}"

if ! command -v tmux >/dev/null 2>&1; then
  echo "tmux is required for terminal control but is not installed." >&2
  exit 69
fi

if ! command -v ttyd >/dev/null 2>&1; then
  echo "ttyd is required for the browser terminal but is not installed." >&2
  exit 69
fi

if ! command -v node >/dev/null 2>&1; then
  echo "node is required for the terminal control sidecar but is not installed." >&2
  exit 69
fi

if ! tmux has-session -t "$session" 2>/dev/null; then
  tmux new-session -d -s "$session" -c /workspace "bash /workspace/scripts/terminal-menu.sh"
fi
tmux set-option -g mouse on
tmux set-option -g history-limit 50000

TERMINAL_CONTROL_PORT="$control_port" node /workspace/scripts/terminal-control-server.js &

exec ttyd -W -p 7681 -b /terminal -t titleFixed="Coding Cold Cases Cracker" tmux attach-session -t "$session"
