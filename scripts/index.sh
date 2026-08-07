#!/usr/bin/env zsh

#===============================================================================
: << 'DOC'
Name:     index.sh
Usage:    index.sh [-h|--help] [-V|--version]
Purpose:  List all pnpm scripts defined in package.json.

Version history:
- v1.3, 2026-03-24; Robust JSON parsing; add --version flag; dynamic column width.
- v1.2, 2026-03-24; Fix find_package_json to check root directory.
- v1.1, 2026-03-24; Remove jq dependency; parse JSON with pure zsh.
- v1.0, 2026-03-24; Initial version.

Notes:
* Reads nearest package.json and prints each script name & its command.
* Parses JSON with pure zsh pattern matching.
DOC
#===============================================================================

# Zsh strict mode
setopt ERR_EXIT NO_UNSET PIPE_FAIL

# Configuration
SCRIPT_NAME="index.sh"
VERSION="1.3"

# ----------------------------
# Utilities
# ----------------------------

err() { printf '%s\n' "$*" >&2; }

_exit_status=0
on_error() {
  ((_exit_status)) && err "A failure occurred. Exiting."
}
trap '_exit_status=$?; on_error' EXIT

# ----------------------------
# Core
# ----------------------------

usage() {
  cat << EOF
$SCRIPT_NAME v$VERSION

🧭 Usage:
  $SCRIPT_NAME [-h|--help] [-V|--version]

🧩 Options:
  -h, --help     Show this help message and exit.
  -V, --version  Print version and exit.

📝 Description:
  + Lists all pnpm scripts defined in the nearest package.json.
  + Each script is shown with its name and command.

EOF
}

find_package_json() {
  local dir="${1:?directory required}"
  while true; do
    if [[ -f "$dir/package.json" ]]; then
      printf '%s\n' "$dir/package.json"
      return 0
    fi
    [[ "$dir" == "/" ]] && break
    dir="${dir:h}"
  done
  err "No package.json found."
  return 1
}

list_scripts() {
  local pkg_json="$1"
  local in_scripts=0 depth=0
  local line name cmd
  local -a names=() cmds=()
  local max_len=0
  local ch in_str escaped i

  while IFS= read -r line; do
    # Detect the "scripts" block opening
    if ((!in_scripts)) && [[ "$line" == *'"scripts"'*'{' ]]; then
      in_scripts=1
      depth=1
      continue
    fi

    if ((in_scripts)); then
      # Track brace nesting depth to handle values containing '}'
      in_str=0 escaped=0
      for ((i = 1; i <= ${#line}; i++)); do
        ch="${line[$i]}"
        if ((escaped)); then
          escaped=0
          continue
        fi
        if [[ "$ch" == '\' ]]; then
          escaped=1
          continue
        fi
        if [[ "$ch" == '"' ]]; then
          in_str=$((1 - in_str))
          continue
        fi
        if ((!in_str)); then
          if [[ "$ch" == '{' ]]; then
            ((depth++))
          elif [[ "$ch" == '}' ]]; then
            ((depth--))
          fi
        fi
      done
      ((depth <= 0)) && break

      # Parse "key": "value" lines, handling escaped quotes in values
      if [[ "$line" =~ '"([^"]+)"[[:space:]]*:[[:space:]]*"(.*)"' ]]; then
        name="${match[1]}"
        cmd="${match[2]}"
        cmd="${cmd//\\\"/\"}" # unescape \"
        names+=("$name")
        cmds+=("$cmd")
        ((${#name} > max_len)) && max_len=${#name}
      fi
    fi
  done < "$pkg_json"

  printf '\n📦 Available scripts:\n\n'

  for ((i = 1; i <= ${#names}; i++)); do
    printf "  pnpm %-${max_len}s → %s\n" "${names[$i]}" "${cmds[$i]}"
  done

  printf '\n'
}

# ----------------------------
# Main
# ----------------------------

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

  local pkg_json
  pkg_json="$(find_package_json "$PWD")"

  list_scripts "$pkg_json"
}

main "$@"
