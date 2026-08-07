#!/usr/bin/env bash
set -euo pipefail

#===============================================================================
: << 'DOC'
Name:    Takumi Guard Setup
Usage:   ./scripts/setup-takumi-guard.sh [-h|--help] [-i|--install] [-e|--edit]
         pnpm run setup-takumi-guard
Purpose: Add Takumi Guard (a security-focused npm registry proxy) to your
         global pnpm config.

Notes:
  - Requires pnpm to be installed.
  - Prompts for your Takumi Guard API token interactively.
  - Safe to re-run; overwrites existing config values.
  - The cd .. before pnpm config --global is required. Without it, pnpm
    may update the project-level config instead of the global one.

Version history:
  - v1.0 - 2026-04-06 - Initial version.
  - v1.1 - 2026-04-06 - Add pnpm check before reading global config in --edit.
                        Hide API token input with silent read.
  - v1.2 - 2026-04-06 - Add -e/--edit to show_help usage line.
                        Add exit after --install to prevent fallthrough.
                        Add unknown option handler.
                        Use printf instead of echo for grep input.
                        Document cd .. requirement in notes.
  - v1.3 - 2026-07-22 - Clarify in --help that --install exits after installing.
                        Reject extra arguments and unknown non-option arguments.
DOC
#===============================================================================

REGISTRY_URL="https://npm.flatt.tech/"
AUTH_TOKEN_KEY="//npm.flatt.tech/:_authToken"
SIGNUP_URL="https://flatt.tech/takumi/features/guard"
TEST_PACKAGE="@panda-guard/test-malicious"

#-------------------------------------------------------------------------------
# show_help - print usage information
#-------------------------------------------------------------------------------
show_help() {
  printf '\n\nTakumi Guard Setup\n\n'
  printf 'Add Takumi Guard to your global pnpm config.\n\n'
  printf 'Usage:\n'
  printf '  ./scripts/setup-takumi-guard.sh [-h|--help] [-i|--install] [-e|--edit]\n'
  printf '  pnpm run setup-takumi-guard\n\n'
  printf 'Options:\n'
  printf '  -h, --help       Show this help message and exit\n'
  printf '  -i, --install    Install pnpm via Homebrew, then exit\n'
  printf '  -e, --edit       Open the global pnpm config file in VS Code\n\n'
  printf 'Prerequisites:\n'
  printf '  - pnpm      https://pnpm.io\n\n'
}

#-------------------------------------------------------------------------------
# install_prereqs - install pnpm via Homebrew
#-------------------------------------------------------------------------------
install_prereqs() {
  if ! command -v brew > /dev/null 2>&1; then
    printf '⚠️  Error: Homebrew is not installed.\n' >&2
    printf '   Install it from: https://brew.sh\n' >&2
    exit 1
  fi

  printf '🍺  This will run: brew install pnpm\n'
  printf '    Continue? [Y/n] '
  read -r answer
  answer="${answer:-Y}"
  if [[ "$answer" != [Yy]* ]]; then
    printf '    Cancelled.\n'
    exit 0
  fi

  brew install pnpm
  printf '✅  pnpm installed.\n\n'
}

#-------------------------------------------------------------------------------
# Parse arguments
#-------------------------------------------------------------------------------
if [[ $# -gt 1 ]]; then
  printf '⚠️  Error: Too many arguments. Pass at most one option.\n' >&2
  show_help
  exit 1
fi

case "${1:-}" in
  -h | --help)
    show_help
    exit 0
    ;;
  -i | --install)
    install_prereqs
    exit 0
    ;;
  -e | --edit)
    if ! command -v code > /dev/null 2>&1; then
      printf '⚠️  Error: VS Code CLI (code) is not available.\n' >&2
      printf '   Open VS Code and run "Shell Command: Install code command in PATH".\n' >&2
      exit 1
    fi
    global_config="$HOME/.npmrc"
    if command -v pnpm > /dev/null 2>&1; then
      global_config="$(pnpm config --global list --json 2> /dev/null \
        | grep -o '"globalconfig": *"[^"]*"' | head -1 | cut -d'"' -f4 || true)"
    fi
    if [[ -z "$global_config" || ! -f "$global_config" ]]; then
      global_config="$HOME/.npmrc"
    fi
    code "$global_config"
    printf '✅  Opened global pnpm config in VS Code.\n'
    exit 0
    ;;
  "")
    # No option provided: continue to the interactive setup below.
    ;;
  *)
    printf '⚠️  Error: Unknown option: %s\n' "$1" >&2
    show_help
    exit 1
    ;;
esac

#-------------------------------------------------------------------------------
# Preflight checks
#-------------------------------------------------------------------------------
if ! command -v pnpm > /dev/null 2>&1; then
  printf '⚠️  Error: pnpm is not installed.\n' >&2
  printf '   Re-run with --install to install it via Homebrew.\n' >&2
  exit 1
fi

#-------------------------------------------------------------------------------
# Prompt for API token
#-------------------------------------------------------------------------------
printf '🔑  Get your Takumi Guard API token:\n'
printf '    1. Go to %s\n' "$SIGNUP_URL"
printf '    2. Enter your work Gmail address and click トークンを取得.\n'
printf '    3. Check your Gmail inbox for the [Takumi Guard] APIキーのお知らせ email.\n'
printf '    4. Copy the token under あなたのAPIキー.\n\n'
printf '    Paste your API token: '
read -r -s api_token
printf '\n'

if [[ -z "$api_token" ]]; then
  printf '⚠️  Error: API token cannot be empty.\n' >&2
  exit 1
fi

#-------------------------------------------------------------------------------
# Set registry and auth token
#-------------------------------------------------------------------------------
cd ..

printf '📦  Setting pnpm registry to Takumi Guard...\n'
pnpm config --global set registry "$REGISTRY_URL"

printf '🔐  Storing API token...\n'
pnpm config --global set "$AUTH_TOKEN_KEY" "$api_token"

#-------------------------------------------------------------------------------
# Verify setup
#-------------------------------------------------------------------------------
printf '🧪  This will run: pnpm view %s\n' "$TEST_PACKAGE"
printf '    Continue? [Y/n] '
read -r answer
answer="${answer:-Y}"
if [[ "$answer" != [Yy]* ]]; then
  printf '    Skipped verification.\n'
  cd - > /dev/null
  printf '✅  Takumi Guard setup is complete.\n'
  exit 0
fi

output=$(pnpm view "$TEST_PACKAGE" 2>&1 || true)
if printf '%s\n' "$output" | grep -q "403"; then
  printf '✅  Takumi Guard is working. Malicious package was blocked (403 Forbidden).\n'
else
  printf '⚠️  Verification failed. The test package was not blocked as expected.\n' >&2
  printf '🔍  Possible cause: wrong API key.\n' >&2
  printf '⚡  Please re-run the setup script and use the correct API key.\n' >&2
  cd - > /dev/null
  exit 1
fi

cd - > /dev/null

printf '✅  Takumi Guard setup is complete.\n'
