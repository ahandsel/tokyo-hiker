#!/bin/bash

# Title: Markdown Lint Script
# Description: This script lints markdown files in a specified directory using markdownlint.
# Usage: ./md-lint.sh [directory] [config_file]
#  directory: Where to search for md files. (default: current working directory)
#  config_file: markdownlint configuration file. (optional)
#
# Version History:
# + v1.1 - Polished the script and added more comments.
# + v1.0 - Initial script

# Variables
CURRENT_DATE=$(date +"%Y-%m-%d")
CURRENT_TIME=$(date +"%H:%M")
LOG_FILE="markdown-lint-log.txt"
DEFAULT_LINT_CONFIG=".markdownlint.json"
LINT_CONFIG=""
MARKDOWNLINT_CMD="markdownlint"

# Helper Functions
function check_markdownlint_installed {
    if ! command -v $MARKDOWNLINT_CMD &>/dev/null; then
        printf "Error: markdownlint not found.\nInstall it by executing either:\n"
        printf "npm install -g markdownlint-cli\nor\nbrew install markdownlint-cli\n"
        exit 1
    fi
}

function setup_log_file {
    if [ ! -f $LOG_FILE ]; then
        printf "# Markdown Lint Log for %s\n" "$(pwd)" >$LOG_FILE
    fi
    printf "\n## Markdown Linting at %s %s\n" "$CURRENT_DATE" "$CURRENT_TIME" >>$LOG_FILE
}

function sanitize_log_file {
    awk '!seen[$0]++' $LOG_FILE | sed "s|$HOME|~|g" >$LOG_FILE.tmp && mv $LOG_FILE.tmp $LOG_FILE
}

function run_markdownlint {
    local file_path="$1"
    local lint_config="$2"

    if [ -z "$lint_config" ]; then
        $MARKDOWNLINT_CMD "$file_path" >>$LOG_FILE 2>&1
    else
        $MARKDOWNLINT_CMD -c "$lint_config" "$file_path" >>$LOG_FILE 2>&1
    fi

    if [ $? -eq 0 ]; then
        return
    else
        $MARKDOWNLINT_CMD --fix "$file_path" &>/dev/null
        if [ $? -eq 0 ]; then
            printf "%s: --fixed\n" "$file_path" >>$LOG_FILE
        fi
    fi
}

function scan_markdown_files {
    local directory="$1"
    find "$directory" -type f -name "*.md" -print
}

# Main Script
function main {
    # Parse Inputs
    local search_directory="${1:-$(pwd)}"
    local config_file="$2"

    if [ -n "$config_file" ]; then
        LINT_CONFIG="$config_file"
    elif [ -f "$search_directory/$DEFAULT_LINT_CONFIG" ]; then
        LINT_CONFIG="$search_directory/$DEFAULT_LINT_CONFIG"
    fi

    # Run Checks and Setup
    check_markdownlint_installed
    setup_log_file

    # Scan for Markdown Files
    local markdown_files
    markdown_files=$(scan_markdown_files "$search_directory")
    local file_count
    file_count=$(echo "$markdown_files" | wc -l)

    # Output and Log
    printf "* %d markdown files found in %s.\n" "$file_count" "$search_directory"
    printf "* %d markdown files found in %s.\n" "$file_count" "$search_directory" >>$LOG_FILE

    # Lint Files
    while IFS= read -r file; do
        run_markdownlint "$file" "$LINT_CONFIG"
    done <<<"$markdown_files"

    # Sanitize Log File
    sanitize_log_file

    printf "Markdown linting completed.\n"
}

main "$@"
