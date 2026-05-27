#!/usr/bin/env bash
set -euo pipefail

session="${TMUX_SESSION:-coldcase}"
action="${1:-}"

case "$action" in
  enter) key="Enter" ;;
  up) key="Up" ;;
  down) key="Down" ;;
  back) key="Escape" ;;
  *)
    echo "Unsupported terminal action: $action" >&2
    exit 64
    ;;
esac

if ! command -v tmux >/dev/null 2>&1; then
  echo "tmux is not installed in the terminal container." >&2
  exit 69
fi

if ! tmux has-session -t "$session" 2>/dev/null; then
  echo "tmux session '$session' does not exist." >&2
  exit 75
fi

tmux send-keys -t "$session" "$key"
