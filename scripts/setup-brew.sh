#!/usr/bin/env bash
set -euo pipefail

#===============================================================================
: << 'DOC'
Name:    Homebrew Setup
Usage:   ./scripts/setup-brew.sh [-h|--help]
         pnpm run setup-brew
Purpose: Install project dependencies from Brewfile using Homebrew.
Output:  Installs the formulae listed in Brewfile. Prints Homebrew's
         progress to the terminal and exits non-zero if installation fails.

Notes:
  - Requires Homebrew to be installed (https://brew.sh).
  - Safe to re-run; Homebrew skips already-installed formulae.
  - Resolves the Brewfile from the repo root, so it works from any directory.

Version history:
  - v1.0 - 2026-03-11 - Initial version.
  - v1.1 - 2026-07-30 - Read the Brewfile from docs/ and resolve it from the repo root.
  - v1.2 - 2026-08-08 - Read the Brewfile from the repo root, because docs/ is the published site here.
DOC
#===============================================================================

#-------------------------------------------------------------------------------
# show_help - print usage information
#-------------------------------------------------------------------------------
show_help() {
  printf '\n\nHomebrew Setup\n\n'
  printf 'Install project dependencies from Brewfile using Homebrew.\n\n'
  printf 'Usage:\n'
  printf '  ./scripts/setup-brew.sh [-h|--help]\n'
  printf '  pnpm run setup-brew\n\n'
  printf 'Prerequisites:\n'
  printf '  - Homebrew  https://brew.sh\n\n'
}

#-------------------------------------------------------------------------------
# Parse arguments
#-------------------------------------------------------------------------------
case "${1:-}" in
  -h | --help)
    show_help
    exit 0
    ;;
esac

#-------------------------------------------------------------------------------
# Preflight checks
#-------------------------------------------------------------------------------
if ! command -v brew > /dev/null 2>&1; then
  printf '⚠️  Error: Homebrew is not installed.\n' >&2
  printf '   Install it from: https://brew.sh\n' >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
BREWFILE="Brewfile"

if [[ ! -f "${ROOT_DIR}/${BREWFILE}" ]]; then
  printf '⚠️  Error: %s not found in %s.\n' "$BREWFILE" "$ROOT_DIR" >&2
  exit 1
fi

#-------------------------------------------------------------------------------
# Install
#-------------------------------------------------------------------------------
printf '🍺  Installing dependencies from %s...\n' "$BREWFILE"
brew bundle --file="${ROOT_DIR}/${BREWFILE}"

printf '✅  All Homebrew dependencies are installed.\n\n'

#-------------------------------------------------------------------------------
# Optional update & upgrade
#-------------------------------------------------------------------------------
if [ -t 0 ]; then
  printf '🔄  Would you like to run brew update && brew upgrade? [y/N] '
  read -r answer || answer=N
else
  answer=N
fi
if [[ "${answer:-N}" == [Yy]* ]]; then
  brew update && brew upgrade
  printf '✅  Homebrew updated and upgraded.\n'
else
  printf '   Skipped.\n'
fi
