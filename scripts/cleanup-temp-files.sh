#!/usr/bin/env bash

#===============================================================================
:<<'DOC'
Name:     cleanup-temp-files.sh
Usage:    cleanup-temp-files.sh [-y|--yes]
Purpose:  Search and list temporary files in a bullet point format. Delete empty ones, and optionally delete all matching files after confirmation.

Version history:
  - v4.2 - 2025-08-18 - Change: list output switched to bullet point format with status icons; portability hardening; clearer errors; minor prompts and docs tweaks.
  - v4.1 - 2025-08-18 - Fix: include exact "temp.md" and other "temp.*" files in search.
  - v4.0 - 2025-08-18 - Major refactor; asks user for confirmation before deleting all matching files.

Notes:
* Files are considered temporary if they:
  + start with "temp-" and have any extension,
  + are exactly "temp" or match "temp.*" (for example, "temp.md"),
  + are listed in ADDITIONAL_FILES,
  + and are not inside a "node_modules" directory.
* Output paths are relative to the current working directory.
* No third-party libraries are required; if a future change adds dependencies, add an "install_deps" function accordingly.
DOC
#===============================================================================

set -Eeuo pipefail

# Configuration
SCRIPT_NAME="cleanup-temp-files.sh"
VERSION="4.2"

# Files that deviate from "temp*" rules
ADDITIONAL_FILES=("import.csv" "import.md")

# ----------------------------
# Utilities
# ----------------------------

err() { printf '%s\n' "$*" >&2; }

on_error() {
  err "A failure occurred. Exiting."
}
trap on_error ERR

cmd_exists() {
  command -v "$1" >/dev/null 2>&1
}

short_path() {
  local p="${1:?path required}"
  local out="$p"
  case "$p" in
    "$PWD"/*) out="./${p#$PWD/}" ;;
    /*) out="$p" ;;
    ./*) out="$p" ;;
    *) out="./$p" ;;
  esac
  if [ -n "${HOME:-}" ]; then
    out="$(printf '%s' "$out" | sed "s|^$HOME|~|")"
  fi
  printf '%s\n' "$out"
}

mod_date() {
  local f="${1:?file required}"
  if stat -c '%y' "$f" >/dev/null 2>&1; then
    stat -c '%y' "$f" | sed 's/\..*//'
  elif stat -f '%Sm' -t '%Y-%m-%d %H:%M:%S' "$f" >/dev/null 2>&1; then
    stat -f '%Sm' -t '%Y-%m-%d %H:%M:%S' "$f"
  else
    printf 'unknown'
  fi
}

file_status() {
  local f="${1:?file required}"
  if [ ! -s "$f" ]; then
    printf 'Empty'
  else
    printf 'Not empty'
  fi
}

safe_rm() {
  local f="${1:?file required}"
  if [ ! -e "$f" ]; then
    err "Skip: file does not exist: $(short_path "$f")"
    return 0
  fi
  if rm -f -- "$f"; then
    printf 'Deleted: %s\n' "$(short_path "$f")"
    return 0
  else
    err "Error: unable to delete $(short_path "$f")"
    return 1
  fi
}

prompt_yes_no() {
  local auto="${1:-no}"
  if [ "$auto" = "yes" ]; then
    return 0
  fi
  printf 'Delete all matching temporary files, including special files? [y/N]: '
  local answer=''
  read -r answer
  case "$answer" in
    y|Y|yes|YES) return 0 ;;
    *) return 1 ;;
  esac
}

# Placeholder for future dependency installation
install_deps() {
  : # No dependencies required currently
}

# ----------------------------
# Find helpers
# ----------------------------

find_temp_targets() {
  local name_args=(
    -name 'temp-*'
    -o -name 'temp'
    -o -name 'temp.*'
  )
  for f in "${ADDITIONAL_FILES[@]}"; do
    name_args+=(-o -name "$f")
  done

  find . \
    -type d -name 'node_modules' -prune -o \
    -type f \( "${name_args[@]}" \) -print0 2>/dev/null
}

# ----------------------------
# Core actions
# ----------------------------

list_temp_files() {
  local found=0
  while IFS= read -r -d '' f; do
    found=1
    local sp dt st icon
    sp="$(short_path "$f")"
    dt="$(mod_date "$f")"
    st="$(file_status "$f")"
    if [ "$st" = "Empty" ]; then
      icon="📃"
    else
      icon="📝"
    fi
    printf '%s\n' "$sp"
    printf '+ Modified: %s\n' "$dt"
    printf '+ %s %s\n' "$st" "$icon"
    printf '\n'
  done < <(find_temp_targets)

  if [ "$found" -eq 0 ]; then
    printf 'No matching temporary files found.\n'
  fi
}

delete_empty_temp_files() {
  local del=0
  while IFS= read -r -d '' f; do
    if [ ! -s "$f" ]; then
      if safe_rm "$f"; then
        del=$((del + 1))
      fi
    fi
  done < <(find_temp_targets)

  if [ "$del" -eq 0 ]; then
    printf 'No empty matching temporary files found to delete.\n'
  else
    printf '%d empty temporary file(s) deleted.\n' "$del"
  fi
}

offer_delete_all() {
  local auto="${1:-no}"
  local -a files=()
  while IFS= read -r -d '' f; do
    files+=("$f")
  done < <(find_temp_targets)

  if [ "${#files[@]}" -eq 0 ]; then
    printf 'No matching temporary files to delete.\n'
    return 0
  fi

  if prompt_yes_no "$auto"; then
    local del=0
    local fail=0
    local f
    for f in "${files[@]}"; do
      if safe_rm "$f"; then
        del=$((del + 1))
      else
        fail=$((fail + 1))
      fi
    done
    printf '%d file(s) deleted, %d failed.\n' "$del" "$fail"
  else
    printf 'Deletion canceled by user. No files were deleted.\n'
  fi
}

# ----------------------------
# Main
# ----------------------------

usage() {
  cat <<EOF
$SCRIPT_NAME v$VERSION

Usage:
  $SCRIPT_NAME [-y|--yes]

Options:
  -y, --yes   Auto-confirm deletion prompt.

Description:
  Search and list temporary files in a bullet point format. Delete empty ones, and optionally delete all matching files after confirmation.
EOF
}

main() {

  local auto_confirm="no"

  while [ $# -gt 0 ]; do
    case "$1" in
      -h|--help) usage; exit 0 ;;
      -y|--yes)  auto_confirm="yes" ;;
      *) err "Unknown option: $1"; usage; exit 2 ;;
    esac
    shift
  done

  install_deps

  printf 'Scanning: %s\n' "$(short_path "$PWD")"
  list_temp_files
  delete_empty_temp_files
  offer_delete_all "$auto_confirm"
  printf 'Done.\n'
}

main "$@"
