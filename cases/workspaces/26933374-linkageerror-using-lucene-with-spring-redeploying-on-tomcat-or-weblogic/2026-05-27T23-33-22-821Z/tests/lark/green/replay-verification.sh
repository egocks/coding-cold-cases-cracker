#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../../.."

if [ 'cd repaired && mvn test' = "TO_BE_DISCOVERED_BY_KIRO" ]; then
  echo "No green verification command has been discovered yet."
  exit 2
fi

cd repaired && mvn test
