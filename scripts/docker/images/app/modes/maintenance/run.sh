#!/usr/bin/env bash

set -eu

CURRENT_WORKING_DIRECTORY_ABSOLUTE_PATH=$(realpath .)
SCRIPT_ABSOLUTE_PATH=$(realpath "$0")
SCRIPT_DIRECTORY_ABSOLUTE_PATH=$(dirname "$SCRIPT_ABSOLUTE_PATH")
SCRIPT_RELATIVE_PATH="./$(realpath --relative-to="$CURRENT_WORKING_DIRECTORY_ABSOLUTE_PATH" "$SCRIPT_ABSOLUTE_PATH")"
SCRIPT_DIRECTORY_RELATIVE_PATH="$(dirname "$SCRIPT_RELATIVE_PATH")"
SCRIPT_NAME=$(basename "$SCRIPT_RELATIVE_PATH")

SCRIPT_DIRECTORY_NAME=$(basename "$SCRIPT_DIRECTORY_ABSOLUTE_PATH")

ENV_FILE=".env.local"
ENV_PATH="${CURRENT_WORKING_DIRECTORY_ABSOLUTE_PATH}/${ENV_FILE}"
$(sed 's/#.*$//g' $ENV_PATH | sed '/^$/d' | sed 's/^/export /g')

if
    [ -z "${PROJECT_NAME}" ]
then
    # This will produce "X: parameter not set" error
    exit 1
fi

DOCKER_IMAGE_NAME=app
DOCKER_IMAGE_FULL_NAME="${PROJECT_NAME}--${DOCKER_IMAGE_NAME}"

HELP_DESCRIPTION="\
NAME
    $SCRIPT_NAME - Run maintenance image of $DOCKER_IMAGE_FULL_NAME service
SYNOPSIS
    $SCRIPT_NAME
    $SCRIPT_NAME -h|--help
    $SCRIPT_NAME [-- <docker-container-run-options>]
OPTIONS
    -h|--help               Show this help
    --                      All options following this option will be sent
                            to \`docker container run\` command
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
        --)
            shift # past argument
            break
            ;;
        *)
            echo "ERROR: Unknown option"
            echo ""
            echo "$HELP_DESCRIPTION"
            exit 1
            ;;
    esac
done

DOCKER_CONTAINER_RUN_ARGUMENTS=
if [ "$#" -gt 0 ]; then
    DOCKER_CONTAINER_RUN_ARGUMENTS="$@"
fi

docker container run \
    --name "${DOCKER_IMAGE_FULL_NAME}-maintenance" \
    --interactive \
    --tty \
    --rm \
    --publish 0.0.0.0:3000:3000 \
    $DOCKER_CONTAINER_RUN_ARGUMENTS \
    "${DOCKER_IMAGE_FULL_NAME}:latest-maintenance"
