#!/usr/bin/env bash
set -euo pipefail

#===============================================================================
: << 'DOC'
Name:    Pre-commit Hook Setup
Usage:   ./scripts/setup-pre-commit.sh [-h|--help] [-u|--uninstall] [-s|--status]
         pnpm run setup-pre-commit
Purpose: Install (or uninstall) the pre-commit hook that runs pnpm lint
         before every commit.

Notes:
  - The hook runs pnpm lint (prettier + markdownlint).
  - Prefers corepack pnpm when available; falls back to plain pnpm.
  - Safe to re-run; prompts before overwriting an existing hook.

Version history:
  - v1.0 - 2026-02-16 - Initial version.
DOC
#===============================================================================

HOOK_PATH=".git/hooks/pre-commit"

show_help() {
  printf '\n\nPre-commit Hook Setup\n\n'
  printf 'Install the pre-commit hook that runs pnpm lint before every commit.\n\n'
  printf 'Usage:\n'
  printf '  ./scripts/setup-pre-commit.sh [-h|--help] [-u|--uninstall] [-s|--status]\n'
  printf '  pnpm run setup-pre-commit\n\n'
  printf 'Options:\n'
  printf '  -h, --help         Show this help message and exit\n'
  printf '  -u, --uninstall    Remove the pre-commit hook\n'
  printf '  -s, --status       Show whether the hook is installed\n\n'
  printf 'With no options the hook is installed (default).\n\n'
}

write_hook() {
  cat > "$HOOK_PATH" << 'HOOK'
#!/bin/sh
set -e

cd "$(git rev-parse --show-toplevel)"

echo "pre-commit: running pnpm lint..."

if command -v corepack >/dev/null 2>&1; then
  PNPM="corepack pnpm"
elif command -v pnpm >/dev/null 2>&1; then
  PNPM="pnpm"
else
  echo "pre-commit: ERROR - pnpm is not installed or not on PATH." >&2
  echo "Install it with:  corepack enable && corepack prepare pnpm@latest --activate" >&2
  echo "            or:  npm install -g pnpm" >&2
  exit 1
fi

if ! $PNPM lint; then
  echo "" >&2
  echo "pre-commit: lint failed. Fix the errors above, then try committing again." >&2
  exit 1
fi

echo "pre-commit: lint passed."
HOOK

  chmod +x "$HOOK_PATH"
}

uninstall_hook() {
  if [[ ! -f "$HOOK_PATH" ]]; then
    printf '⚠️  No pre-commit hook found at %s. Nothing to remove.\n' "$HOOK_PATH"
    exit 0
  fi

  rm "$HOOK_PATH"
  printf '✅  Pre-commit hook removed.\n'
  exit 0
}

show_status() {
  if [[ -x "$HOOK_PATH" ]]; then
    printf '✅  Pre-commit hook is installed at %s.\n' "$HOOK_PATH"
  elif [[ -f "$HOOK_PATH" ]]; then
    printf '⚠️  Pre-commit hook exists at %s but is not executable.\n' "$HOOK_PATH"
    printf '   Run: chmod +x %s\n' "$HOOK_PATH"
  else
    printf '❌  No pre-commit hook installed.\n'
    printf '   Run: ./scripts/setup-pre-commit.sh\n'
  fi
  exit 0
}

case "${1:-}" in
  -h | --help)
    show_help
    exit 0
    ;;
  -u | --uninstall)
    uninstall_hook
    ;;
  -s | --status)
    show_status
    ;;
esac

if [[ ! -d ".git" ]]; then
  printf '⚠️  Error: .git directory not found. Run this from the repository root.\n' >&2
  exit 1
fi

if [[ ! -d ".git/hooks" ]]; then
  mkdir -p ".git/hooks"
fi

if [[ -f "$HOOK_PATH" ]]; then
  printf '⚠️  A pre-commit hook already exists at %s.\n' "$HOOK_PATH"
  printf '    Overwrite? [Y/n] '
  read -r answer
  answer="${answer:-Y}"
  if [[ "$answer" != [Yy]* ]]; then
    printf '    Cancelled.\n'
    exit 0
  fi
fi

write_hook

printf '✅  Pre-commit hook installed at %s.\n' "$HOOK_PATH"
