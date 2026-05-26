#!/usr/bin/env bash
set -euo pipefail

as_json=false
watch_mode=false

for arg in "$@"; do
  case "$arg" in
    --json) as_json=true ;;
    --watch) watch_mode=true ;;
  esac
done

status_json() {
  local mode="$1"
  local ok="$2"
  local message="$3"
  jq -n \
    --arg mode "$mode" \
    --argjson ok "$ok" \
    --arg message "$message" \
    '{mode:$mode, ok:$ok, message:$message}'
}

detect_status() {
  if [[ -n "${KIRO_API_KEY:-}" ]]; then
    status_json "autopilot-ready" true "KIRO_API_KEY is set; headless Kiro autopilot is available."
    return 0
  fi

  if command -v kiro-cli >/dev/null 2>&1 && kiro-cli whoami >/tmp/kiro-whoami.txt 2>&1; then
    status_json "persisted-login-ready" true "KIRO_API_KEY is blank, but persisted Kiro auth was detected. The terminal uses supervised TUI mode; the app pipeline can run headless with this persisted login."
    return 0
  fi

  status_json "interactive-login-required" false "KIRO_API_KEY is blank and no persisted Kiro login was detected. Open the terminal and run kiro-cli login."
}

if [[ "$as_json" == true ]]; then
  detect_status
  exit 0
fi

print_human_status() {
  local json mode ok message
  json="$(detect_status)"
  mode="$(jq -r '.mode' <<<"$json")"
  ok="$(jq -r '.ok' <<<"$json")"
  message="$(jq -r '.message' <<<"$json")"
  echo "Kiro status: ${mode}"
  echo "${message}"
  if [[ "$ok" != "true" ]]; then
    echo
    echo "Fallback flow:"
    echo "  1. Run: kiro-cli login"
    echo "  2. Open the displayed URL in any browser."
    echo "  3. Enter the device code and complete login."
    echo "  4. Rerun: scripts/kiro-status.sh"
    echo
    echo "The Docker volumes kiro-data and kiro-config persist this login across restarts."
  fi
}

if [[ "$watch_mode" == true ]]; then
  print_human_status
  echo
  echo "kiro-agent service is standing by. Use the terminal service for interactive commands."
  tail -f /dev/null
else
  print_human_status
fi
