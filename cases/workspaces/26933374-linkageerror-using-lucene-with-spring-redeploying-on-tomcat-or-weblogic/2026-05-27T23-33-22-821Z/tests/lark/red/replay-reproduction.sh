#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../../.."

if [ 'cd repro && mvn test' = "TO_BE_DISCOVERED_BY_KIRO" ]; then
  echo "No red reproduction command has been discovered yet."
  exit 2
fi

cd repro && mvn test
