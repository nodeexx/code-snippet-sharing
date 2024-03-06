#!/usr/bin/env bash

set -eu

CURRENT_WORKING_DIRECTORY_ABSOLUTE_PATH=$(realpath .)
SCRIPT_ABSOLUTE_PATH=$(realpath "$0")
SCRIPT_DIRECTORY_ABSOLUTE_PATH=$(dirname "$SCRIPT_ABSOLUTE_PATH")
SCRIPT_RELATIVE_PATH="./$(realpath --relative-to="$CURRENT_WORKING_DIRECTORY_ABSOLUTE_PATH" "$SCRIPT_ABSOLUTE_PATH")"
SCRIPT_DIRECTORY_RELATIVE_PATH="$(dirname "$SCRIPT_RELATIVE_PATH")"
SCRIPT_NAME=$(basename "$SCRIPT_RELATIVE_PATH")

HELP_DESCRIPTION="\
NAME
    $SCRIPT_NAME
DESCRIPTION
    ...
SYNOPSIS
    $SCRIPT_NAME
    $SCRIPT_NAME -h|--help
OPTIONS
    -h|--help                Show this help
EXAMPLES
    ${SCRIPT_RELATIVE_PATH}
        ...
"

while [ $# -gt 0 ]; do
    case $1 in
        -h|--help)
            echo "$HELP_DESCRIPTION"
            exit 0
            ;;
        *)
            echo "ERROR: Unknown option: $1"
            echo ""
            echo "$HELP_DESCRIPTION"
            exit 1
            ;;
    esac
done

ENV_FILE=".env.local"
ENV_PATH="${CURRENT_WORKING_DIRECTORY_ABSOLUTE_PATH}/${ENV_FILE}"
$(sed 's/#.*$//g' $ENV_PATH | sed '/^$/d' | sed 's/^/export /g')

sudo -E "$(which npx)" northflank forward \
    addon \
    --projectId code-snippet-sharing \
    --addonId postgres-production
