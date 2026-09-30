#!/usr/bin/env zsh

#===============================================================================
: << 'DOC'
Name:     cleanup-temp-files.sh
Usage:    cleanup-temp-files.sh [-y|--yes] [-h|--help]
Purpose:  Find and list temporary files, delete empty ones automatically, then optionally delete all remaining matches after user confirmation.

Output:
* Lists matching paths and deletion results; --help exits without deleting files.

Version history:
- v5.4, 2026-09-29; Import the zsh cleanup improvements into Tokyo Hiker and document output.
- v5.3, 2026-04-08; Fix: guard empty ADDITIONAL_DIRS; eliminate double-stat race in mod_date; surface find errors; clarify docs and prompts.
- v5.2, 2026-04-08; Merge: incorporate 🗑️ icon for empty files from main.
- v5.1, 2026-03-24; Refactor: idiomatic zsh (setopt, parameter expansion); remove unused cmd_exists and install_deps stubs; fix short_path HOME substitution to avoid regex bugs.
- v5.0, 2026-03-24; Convert from bash to zsh; trap ERR->ZERR; remove unsupported set -E.
- v4.5, 2026-03-24; Fix: missing brace in find_temp_targets; fix undeclared loop variables; remove redundant local declarations.
- v4.4, 2026-01-26; UX copy polishing.
- v4.3, 2025-12-23; Formatting.
- v4.2, 2025-08-18; Change: list output switched to bullet point format with status icons; portability hardening; clearer errors; minor prompts and docs tweaks.
- v4.1, 2025-08-18; Fix: include exact "temp.md" and other "temp.*" files in search.
- v4.0, 2025-08-18; Major refactor; asks user for confirmation before deleting all matching files.

Notes:
* Files are considered temporary if they:
  + start with "temp-" (for example, "temp-draft.md", "temp-scratch"),
  + are exactly "temp" or match "temp.*" (for example, "temp.md"),
  + are listed in ADDITIONAL_FILES,
  + and are not inside a "node_modules" directory.
* Directories listed in ADDITIONAL_DIRS (for example, ".pnpm-store") are also removed.
* Symlinks are not followed and not cleaned up.
* Output paths are shown relative to the current working directory when possible, with $HOME abbreviated to ~.
DOC
#===============================================================================

# Zsh strict mode
setopt ERR_EXIT NO_UNSET PIPE_FAIL

# Configuration
SCRIPT_NAME="cleanup-temp-files.sh"
VERSION="5.4"

# Files that deviate from "temp*" rules
ADDITIONAL_FILES=("import.csv" "import.md" ".DS_Store")

# Directories to remove
ADDITIONAL_DIRS=(".pnpm-store")

# ----------------------------
# Utilities
# ----------------------------

err() { printf '%s\n' "$*" >&2; }

on_error() {
  err "A failure occurred. Exiting."
}
trap on_error ZERR

# Format a path for human-readable display.
# Converts absolute paths to ./ relative when inside $PWD, and abbreviates
# $HOME to ~.
short_path() {
  local p="${1:?path required}"
  local out="$p"

  # Normalize to an explicit relative or absolute path.
  case "$p" in
    "$PWD"/*) out="./${p#$PWD/}" ;;
    /*) out="$p" ;;
    ./*) out="$p" ;;
    *) out="./$p" ;;
  esac

  # Replace the home directory prefix with ~ using parameter expansion instead of sed, to avoid regex escaping issues.
  if [[ -n "${HOME:-}" && "$out" == "${HOME}"* ]]; then
    out="~${out#${HOME}}"
  fi
  printf '%s\n' "$out"
}

# Print the last-modified date of a file in "YYYY-MM-DD HH:MM:SS" format.
mod_date() {
  local f="${1:?file required}" out
  if out=$(stat -c '%y' "$f" 2> /dev/null); then
    # GNU stat
    printf '%s\n' "${out%%.*}"
  elif out=$(stat -f '%Sm' -t '%Y-%m-%d %H:%M:%S' "$f" 2> /dev/null); then
    # BSD stat (macOS)
    printf '%s\n' "$out"
  else
    printf 'unknown'
  fi
}

# Print "Empty" or "Not empty" based on file size.
file_status() {
  local f="${1:?file required}"
  if [[ ! -s "$f" ]]; then
    printf 'Empty'
  else
    printf 'Not empty'
  fi
}

# Remove a file or directory, printing the result.
safe_rm() {
  local target="${1:?path required}"
  if [[ ! -e "$target" ]]; then
    err "Skip: path does not exist: $(short_path "$target")"
    return 0
  fi
  local rm_cmd=(rm -f --)
  if [[ -d "$target" ]]; then
    rm_cmd=(rm -rf --)
  fi
  if "${rm_cmd[@]}" "$target"; then
    printf 'Deleted: %s\n' "$(short_path "$target")"
    return 0
  else
    err "Error: unable to delete $(short_path "$target")"
    return 1
  fi
}

# Prompt the user for confirmation. Returns 0 if confirmed.
# If $1 is "yes", auto-confirms without prompting.
prompt_yes_no() {
  local auto="${1:-no}"
  local prompt="${2:-Confirm? [y/N]: }"
  if [[ "$auto" == "yes" ]]; then
    return 0
  fi
  printf '%s' "$prompt"
  local answer=''
  read -r answer
  case "$answer" in
    y | Y | yes | YES) return 0 ;;
    *) return 1 ;;
  esac
}

# ----------------------------
# Find helpers
# ----------------------------

# Emit null-delimited paths for all temporary files in the current directory tree, excluding node_modules.
find_temp_targets() {
  local f
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
    -type f \( "${name_args[@]}" \) -print0
}

# Emit null-delimited paths for directories listed in ADDITIONAL_DIRS, excluding node_modules.
find_temp_dir_targets() {
  if ((${#ADDITIONAL_DIRS[@]} == 0)); then
    return 0
  fi
  local d
  local name_args=()
  local first=1
  for d in "${ADDITIONAL_DIRS[@]}"; do
    if ((first)); then
      name_args+=(-name "$d")
      first=0
    else
      name_args+=(-o -name "$d")
    fi
  done

  find . \
    -type d -name 'node_modules' -prune -o \
    -type d \( "${name_args[@]}" \) -print0
}

# ----------------------------
# Core actions
# ----------------------------

# List all matching temporary files and directories with metadata.
list_temp_files() {
  local found=0
  local f d sp dt st icon
  while IFS= read -r -d '' f; do
    found=1
    sp="$(short_path "$f")"
    dt="$(mod_date "$f")"
    st="$(file_status "$f")"
    if [[ "$st" == "Empty" ]]; then
      icon="🗑️"
    else
      icon="📝"
    fi
    printf '%s\n' "$sp"
    printf '+ Modified: %s\n' "$dt"
    printf '+ %s %s\n' "$st" "$icon"
    printf '\n'
  done < <(find_temp_targets)

  while IFS= read -r -d '' d; do
    found=1
    sp="$(short_path "$d")"
    dt="$(mod_date "$d")"
    printf '%s\n' "$sp"
    printf '+ Modified: %s\n' "$dt"
    printf '+ Directory 📁\n'
    printf '\n'
  done < <(find_temp_dir_targets)

  if ((found == 0)); then
    printf 'No matching temporary files found.\n'
  fi
}

# Delete only empty temporary files.
delete_empty_temp_files() {
  local del=0
  local f
  while IFS= read -r -d '' f; do
    if [[ ! -s "$f" ]]; then
      if safe_rm "$f"; then
        del=$((del + 1))
      fi
    fi
  done < <(find_temp_targets)

  if ((del == 0)); then
    printf 'No empty matching temporary files found to delete.\n'
  else
    printf '%d empty temporary file(s) deleted.\n' "$del"
  fi
}

# Collect all remaining targets and offer to delete them after confirmation.
offer_delete_all() {
  local auto="${1:-no}"
  local f d
  local -a targets=()
  while IFS= read -r -d '' f; do
    targets+=("$f")
  done < <(find_temp_targets)
  while IFS= read -r -d '' d; do
    targets+=("$d")
  done < <(find_temp_dir_targets)

  if ((${#targets[@]} == 0)); then
    printf 'No matching temporary files to delete.\n'
    return 0
  fi

  if prompt_yes_no "$auto" "Delete all ${#targets[@]} remaining matches? [y/N]: "; then
    local del=0
    local fail=0
    local t
    for t in "${targets[@]}"; do
      if safe_rm "$t"; then
        del=$((del + 1))
      else
        fail=$((fail + 1))
      fi
    done
    printf '%d item(s) deleted, %d failed.\n' "$del" "$fail"
  else
    printf 'Skipped. Only empty files were deleted.\n'
  fi
}

# ----------------------------
# Main
# ----------------------------

usage() {
  cat << EOF
$SCRIPT_NAME v$VERSION

🧭 Usage:
  $SCRIPT_NAME [-y|--yes] [-h|--help]

🧩 Options:
  -y, --yes   Auto-confirm deletion prompt (skip interactive question).
  -h, --help  Show this help message and exit.

📝 Description:
  + Finds and lists temporary files in the current directory tree, deletes empty ones automatically, then prompts to delete all remaining matches.
  + Temporary files include temp-*, temp, temp.*, and any files listed in ADDITIONAL_FILES.
  + Directories in ADDITIONAL_DIRS are also targeted.
  + Paths inside node_modules are always excluded.

EOF
}

main() {
  local auto_confirm="no"

  while (($# > 0)); do
    case "$1" in
      -h | --help)
        usage
        exit 0
        ;;
      -y | --yes) auto_confirm="yes" ;;
      *)
        err "Unknown option: $1"
        usage
        exit 2
        ;;
    esac
    shift
  done

  printf 'Scanning: %s\n' "$(short_path "$PWD")"
  list_temp_files
  delete_empty_temp_files
  offer_delete_all "$auto_confirm"
  printf 'Done.\n'
}

main "$@"
