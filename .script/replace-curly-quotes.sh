#!/bin/bash

# Replace Curly Quotes Script
# v1 - 2024-04-17 - Initial version

# Check for correct number of arguments
if [ "$#" -gt 1 ]; then
  echo "Error: Too many arguments provided."
  echo "Usage: $0 [directory]"
  exit 1
elif [ "$#" -eq 0 ]; then
  directory="."
else
  directory="$1"
fi

# Verify that the directory exists
if [ ! -d "$directory" ]; then
  echo "Error: Directory does not exist: $directory"
  exit 1
fi

# Initialize an array to keep track of modified files
declare -a modified_files

# Function to replace curly quotes with straight quotes
process_files() {
  local file="$1"
  local temp_file=$(mktemp)

  # Use sed to replace curly single and double quotes with straight ones
  if sed -E 's/[“”]/"/g; s/[‘’]/'\''/g' "$file" >"$temp_file"; then
    # Check if changes were made
    if ! cmp -s "$file" "$temp_file"; then
      mv "$temp_file" "$file"
      echo "Modified: $file"
      modified_files+=("$file")
    else
      rm "$temp_file"
    fi
  else
    echo "Error processing file: $file"
    rm "$temp_file"
    return 1
  fi
}

# Export function so it can be used by find
export -f process_files

# Find all .md files and process them
find "$directory" -type f -name '*.md' -exec bash -c 'process_files "$0"' {} \;

# Summary of modifications
if [ ${#modified_files[@]} -eq 0 ]; then
  echo "No files were changed."
else
  echo "Files changed: ${#modified_files[@]}"
  printf "Changed files:\n%s\n" "${modified_files[@]}"
fi
