#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../../.."

if [ 'cd repro && mvn test 2>&1 | grep -E '\''(ClassCastException|IllegalStateException|Tests run|BUILD)'\''' = "TO_BE_DISCOVERED_BY_KIRO" ]; then
  echo "No green verification command has been discovered yet."
  exit 2
fi

cd repro && mvn test 2>&1 | grep -E '(ClassCastException|IllegalStateException|Tests run|BUILD)'
