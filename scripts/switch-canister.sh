#!/usr/bin/env bash
if [ "$#" -ne 1 ]; then
  echo "Usage: switch-canister.sh <local|ic>"
  exit 1
fi

JSFILE_UNIX="$(cd "$(dirname "$0")" && pwd)/switch-canister.js"

# Prefer local 'node' if available in this environment
if command -v node >/dev/null 2>&1; then
  node "$JSFILE_UNIX" "$1"
  exit $?
fi

# If running under WSL and Node is available on Windows, try to call it via PowerShell
if command -v wslpath >/dev/null 2>&1 && command -v powershell.exe >/dev/null 2>&1; then
  JSFILE_WIN=$(wslpath -w "$JSFILE_UNIX")
  powershell.exe -NoProfile -Command "node '$JSFILE_WIN' $1"
  exit $?
fi

echo "node not found in PATH. Install node in this environment or run the PowerShell wrapper: scripts/switch-canister.ps1 -target <local|ic>"
exit 127
