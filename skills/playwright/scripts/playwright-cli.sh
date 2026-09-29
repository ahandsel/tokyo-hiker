#!/usr/bin/env zsh
set -euo pipefail

#===============================================================================
: << 'DOC'
Name:    playwright-cli.sh
Usage:   skills/playwright/scripts/playwright-cli.sh [-h|--help]
         skills/playwright/scripts/playwright-cli.sh <playwright-cli arguments>
         PLAYWRIGHT_CLI_SESSION=<name> skills/playwright/scripts/playwright-cli.sh <arguments>
Purpose: Thin wrapper around the @playwright/cli `playwright-cli` binary that
         resolves it through pnpm and injects a default --session value.
Output:  Nothing of its own.
         Replaces itself with playwright-cli through exec, so the underlying
         command's stdout, stderr, and exit code pass through unchanged.
         Exits 1 when pnpm is not on PATH.

Notes:
  - Requires pnpm on PATH. The package is fetched on demand with pnpm dlx, so
    no local install step is needed.
  - When PLAYWRIGHT_CLI_SESSION is set and the caller passes no --session flag,
    the wrapper inserts --session "$PLAYWRIGHT_CLI_SESSION" before the caller's
    arguments. An explicit --session always wins.
  - Every other argument is forwarded verbatim, so playwright-cli's own flags
    keep working. -h/--help on its own prints this wrapper's usage offline;
    in any longer argument list --help is forwarded
    untouched.

Version history:
  - v1.2 - 2026-09-29 - Use pnpm and zsh; print wrapper help without a network request.
  - v1.1 - 2026-08-28 - Add this notes block and wrapper --help output.
  - v1.0 - 2026-02-10 - Initial version, imported with the playwright skill.
DOC
#===============================================================================

SCRIPT_NAME="playwright-cli.sh"
VERSION="1.2"

if ! command -v pnpm > /dev/null 2>&1; then
  echo "❌ Error: pnpm is required but not found on PATH." >&2
  exit 1
fi

show_help() {
  cat << EOF

$SCRIPT_NAME v$VERSION

Wrapper around the @playwright/cli 'playwright-cli' binary. Resolves the
command through pnpm and supplies a default --session value.

Usage:
  ./$SCRIPT_NAME [-h|--help]
  ./$SCRIPT_NAME <playwright-cli arguments>

Options:
  -h, --help  Show this message, without downloading the CLI.
              Every other argument is forwarded to playwright-cli unchanged.

Environment:
  PLAYWRIGHT_CLI_SESSION  Session name used when no --session flag is given.

EOF
}

# Show the wrapper's usage only when help is the sole argument, so that --help
# inside a longer argument list still reaches playwright-cli untouched.
if [[ $# -eq 1 && ("$1" == "-h" || "$1" == "--help") ]]; then
  show_help
  exit 0
fi

has_session_flag="false"
for arg in "$@"; do
  case "$arg" in
    --session | --session=*)
      has_session_flag="true"
      break
      ;;
  esac
done

cmd=(pnpm dlx @playwright/cli)
if [[ "${has_session_flag}" != "true" && -n "${PLAYWRIGHT_CLI_SESSION:-}" ]]; then
  cmd+=(--session "${PLAYWRIGHT_CLI_SESSION}")
fi
cmd+=("$@")

exec "${cmd[@]}"
