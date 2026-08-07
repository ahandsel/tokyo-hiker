#!/usr/bin/env zsh

#===============================================================================
: << 'DOC'
Name:     setup.sh
Usage:    setup.sh [-h|--help] [-V|--version]
Purpose:  Run the full repository setup (Homebrew, Node.js, pnpm install, pre-commit).
Output:   Installs Homebrew formulae, Node.js, pnpm dependencies, and pre-commit
          hooks. Prints each step's progress to the terminal and exits non-zero
          if any step fails.

Version history:
- v1.0, 2026-05-19 - Initial version.
- v1.1, 2026-07-30 - Look for the Brewfile in docs/ instead of the repo root.
- v1.2, 2026-08-08 - Look for the Brewfile in the repo root, because docs/ is the published site here.

Notes:
* Runs setup-brew (when Brewfile exists), setup-node, pnpm install, and setup-pre-commit.
* Individual steps can still be run separately via pnpm run setup-*.
DOC
#===============================================================================

setopt ERR_EXIT NO_UNSET PIPE_FAIL

SCRIPT_NAME="setup.sh"
VERSION="1.2"
SCRIPT_DIR="${0:a:h}"
ROOT_DIR="${SCRIPT_DIR:h}"

err() { printf '%s\n' "$*" >&2; }

usage() {
  cat << EOF
$SCRIPT_NAME v$VERSION

Usage:
  $SCRIPT_NAME [-h|--help] [-V|--version]
  pnpm run setup-full

Description:
  Run the full repository setup in order:
    1. setup-brew   (skipped when Brewfile is missing)
    2. setup-node
    3. pnpm install
    4. setup-pre-commit

EOF
}

main() {
  while (($# > 0)); do
    case "$1" in
      -h | --help)
        usage
        exit 0
        ;;
      -V | --version)
        printf '%s v%s\n' "$SCRIPT_NAME" "$VERSION"
        exit 0
        ;;
      *)
        err "Unknown option: $1"
        usage
        exit 2
        ;;
    esac
    shift
  done

  cd "$ROOT_DIR"

  if [[ -f "${ROOT_DIR}/Brewfile" && -f "${SCRIPT_DIR}/setup-brew.sh" ]]; then
    printf '\n▶️  Homebrew dependencies\n'
    bash "${SCRIPT_DIR}/setup-brew.sh"
  fi

  if [[ -f "${SCRIPT_DIR}/setup-node.sh" ]]; then
    printf '\n▶️  Node.js\n'
    bash "${SCRIPT_DIR}/setup-node.sh"
  fi

  printf '\n▶️  pnpm install\n'
  pnpm install

  if [[ -f "${SCRIPT_DIR}/setup-pre-commit.sh" ]]; then
    printf '\n▶️  pre-commit hook\n'
    bash "${SCRIPT_DIR}/setup-pre-commit.sh"
  fi

  printf '\n✅  Setup complete. Run `pnpm index` to see available scripts.\n\n'
}

main "$@"
