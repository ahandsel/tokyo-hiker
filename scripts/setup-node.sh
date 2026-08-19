#!/usr/bin/env bash
set -euo pipefail

#===============================================================================
: << 'DOC'
Name:    Node.js Setup
Usage:   ./scripts/setup-node.sh [-h|--help] [-i|--install]
         pnpm run setup-node
Purpose: Install and activate the Node.js version specified in .node-version
         using nodenv.

Output:
  - The detected target version, then a line per step as nodenv installs and
    activates it, ending with the active `node -v`.
  - ✅ on success, ⚠️ when the version was already present, ❌ when nodenv is
    missing or the install fails.

Notes:
  - Reads the target version from .node-version in the project root.
  - Requires nodenv to be installed (https://github.com/nodenv/nodenv).
  - Safe to re-run; skips installation if the version is already present.

Version history:
  - v1.0 - 2026-02-16 - Initial version.
DOC
#===============================================================================

show_help() {
  printf '\n\nNode.js Setup\n\n'
  printf 'Install and activate the Node.js version specified in .node-version.\n\n'
  printf 'Usage:\n'
  printf '  ./scripts/setup-node.sh [-h|--help] [-i|--install]\n'
  printf '  pnpm run setup-node\n\n'
  printf 'Options:\n'
  printf '  -h, --help       Show this help message and exit\n'
  printf '  -i, --install    Install prerequisites via Homebrew (nodenv, node-build, pnpm)\n\n'
  printf 'Prerequisites:\n'
  printf '  - nodenv      https://github.com/nodenv/nodenv\n'
  printf '  - node-build  https://github.com/nodenv/node-build (nodenv plugin)\n\n'
}

install_prereqs() {
  local answer

  if ! command -v brew > /dev/null 2>&1; then
    printf '⚠️  Error: Homebrew is not installed.\n' >&2
    printf '   Install it from: https://brew.sh\n' >&2
    exit 1
  fi

  printf '🍺  This will run: brew install nodenv node-build pnpm\n'
  printf '    Continue? [Y/n] '
  read -r answer
  answer="${answer:-Y}"
  if [[ "$answer" != [Yy]* ]]; then
    printf '    Cancelled.\n'
    exit 0
  fi

  brew install nodenv node-build pnpm
  printf '✅  Prerequisites installed.\n\n'
}

case "${1:-}" in
  -h | --help)
    show_help
    exit 0
    ;;
  -i | --install)
    install_prereqs
    ;;
esac

if ! command -v nodenv > /dev/null 2>&1; then
  printf '⚠️  Error: nodenv is not installed.\n' >&2
  printf '   Install it from: https://github.com/nodenv/nodenv\n' >&2
  exit 1
fi

NODE_VERSION_FILE=".node-version"

if [[ ! -f "$NODE_VERSION_FILE" ]]; then
  printf '⚠️  Error: %s not found in the project root.\n' "$NODE_VERSION_FILE" >&2
  exit 1
fi

NODE_VERSION="$(cat "$NODE_VERSION_FILE")"

if [[ -z "$NODE_VERSION" ]]; then
  printf '⚠️  Error: %s is empty.\n' "$NODE_VERSION_FILE" >&2
  exit 1
fi

printf '📦  Installing Node.js v%s...\n' "$NODE_VERSION"
nodenv install --skip-existing "$NODE_VERSION"

nodenv local "$NODE_VERSION"
nodenv rehash

printf '✅  Node.js %s is ready.\n' "$(node -v)"
