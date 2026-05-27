#!/usr/bin/env bash
set -euo pipefail

workspace="${1:-}"
prompt_file="${2:-}"
agent="${KIRO_AGENT:-case-investigator}"

if [[ -z "$workspace" || -z "$prompt_file" ]]; then
  echo "Usage: scripts/kiro-solve.sh <case-workspace> <prompt-file>"
  exit 64
fi

if [[ ! -d "$workspace" ]]; then
  echo "Workspace not found: $workspace"
  exit 66
fi

if [[ ! -f "$prompt_file" ]]; then
  echo "Prompt file not found: $prompt_file"
  exit 66
fi

cd "$workspace"
prompt="$(cat "$prompt_file")"

if [[ -n "${KIRO_API_KEY:-}" ]]; then
  echo "Kiro mode: autopilot-ready"
  echo "Running headless Kiro with agent: $agent"
  exec kiro-cli chat \
    --no-interactive \
    --agent "$agent" \
    --trust-tools=read,write,shell,grep,glob,web_fetch,web_search \
    "$prompt"
fi

if ! kiro-cli whoami >/dev/null 2>&1; then
  cat <<'MSG'
Kiro mode: interactive-login-required

KIRO_API_KEY is blank and no persisted Kiro login was detected.

Run:
  kiro-cli login

Then follow the displayed device/browser login instructions.
After login, rerun this command.

Docker volumes persist the Kiro login across restarts.
MSG
  exit 2
fi

echo "Kiro mode: interactive-ready"
echo "Launching interactive Kiro TUI with agent: $agent"
exec kiro-cli chat --tui --agent "$agent" "$prompt"
