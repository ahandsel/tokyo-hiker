#!/bin/bash

#===============================================================================
: << 'DOC'
Name:    Replace Curly Quotes
Usage:   ./scripts/replace-curly-quotes.sh [directory]
         ./scripts/replace-curly-quotes.sh [-h|--help]

Purpose: Replace curly quotes with straight quotes across the Markdown files in
         a directory, enforcing the repo writing style.

Notes:
  - Bash rather than the project default of zsh, because the find loop relies on
    `export -f`, which zsh does not provide.
  - `pnpm lint` already fixes curly quotes through the markdownlint
    `search-replace` rules. Use this script for a directory outside that sweep,
    or as a one-off pass before the tooling is installed.
  - Skips `node_modules` and `.vitepress` folders.

Output:
  - One line per modified file, then a count of the files changed.
  - ✅ when nothing needed changing, ⚠️ with the list when files were rewritten,
    and ❌ on an unreadable directory or file.

Version history:
  - v1.1, 2026-08-19; Add --help, a full notes section, and status emojis.
  - v1.0, 2024-04-17; Initial version.
DOC
#===============================================================================

usage() {
  sed -n "/^: << 'DOC'$/,/^DOC$/p" "$0" | sed '1d;$d'
}

# Check for correct number of arguments
if [ "$#" -eq 1 ] && { [ "$1" = "-h" ] || [ "$1" = "--help" ]; }; then
  usage
  exit 0
elif [ "$#" -gt 1 ]; then
  echo "❌ Too many arguments provided."
  echo "Usage: $0 [directory]"
  exit 1
elif [ "$#" -eq 0 ]; then
  directory="."
else
  directory="$1"
fi

# Verify that the directory exists
if [ ! -d "$directory" ]; then
  echo "❌ Directory does not exist: $directory"
  exit 1
fi

# Initialize an array to keep track of modified files
declare -a modified_files

# Function to replace curly quotes with straight quotes
process_files() {
  local file="$1"
  local temp_file=$(mktemp)

  # Use sed to replace curly single and double quotes with straight ones
  if sed -E 's/[“”]/"/g; s/[‘’]/'\''/g' "$file" > "$temp_file"; then
    # Check if changes were made
    if ! cmp -s "$file" "$temp_file"; then
      mv "$temp_file" "$file"
      echo "⚠️  Modified: $file"
      modified_files+=("$file")
    else
      rm "$temp_file"
    fi
  else
    echo "❌ Error processing file: $file"
    rm "$temp_file"
    return 1
  fi
}

# Export function so it can be used by find
export -f process_files

# Find all .md files and process them, excluding node_modules and .vitepress folders
find "$directory" -type f -name '*.md' \
  -not -path "*/node_modules/*" \
  -not -path "*/.vitepress/*" \
  -exec bash -c 'process_files "$0"' {} \;

# Summary of modifications
if [ ${#modified_files[@]} -eq 0 ]; then
  echo "✅ No files were changed."
else
  echo "⚠️  Files changed: ${#modified_files[@]}"
  printf "Changed files:\n%s\n" "${modified_files[@]}"
fi
