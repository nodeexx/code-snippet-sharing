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

DOCKER_IMAGE_NAME=$SCRIPT_DIRECTORY_NAME
DOCKER_IMAGE_FULL_NAME="${PROJECT_NAME}--${DOCKER_IMAGE_NAME}"

HELP_DESCRIPTION="\
NAME
    $SCRIPT_NAME - Build $DOCKER_IMAGE_FULL_NAME related Docker images
SYNOPSIS
    $SCRIPT_NAME
    $SCRIPT_NAME -h|--help
    $SCRIPT_NAME [-- <docker-image-build-options>]
OPTIONS
    -h|--help               Show this help
    --                      All options following this option will be sent
                            to \`docker image build\` command
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

DOCKER_IMAGE_BUILD_ARGUMENTS=
if [ "$#" -gt 0 ]; then
    DOCKER_IMAGE_BUILD_ARGUMENTS="$@"
fi

# if [ -n "$(git status -s)" ]; then
#     echo "ERROR: Git working directory is not clean"
#     exit 1
# fi

# BUILT_DOCKER_IMAGE_SOURCE=https://github.com/node-ex/project-based-web-dev-learning
# BUILT_DOCKER_IMAGE_DESCRIPTION="Docker image for ${DOCKER_IMAGE_FULL_NAME} service"
# BUILT_DOCKER_IMAGE_AUTHORS="pavel.balashov1@gmail.com"
# BUILT_DOCKER_IMAGE_CREATED_DATE=$(date -u +'%Y%m%dT%H%M%SZ')
# BUILT_DOCKER_IMAGE_SOURCE_COMMIT=$(git rev-parse HEAD)
# BUILT_DOCKER_IMAGE_TITLE=$DOCKER_IMAGE_FULL_NAME
# BUILT_DOCKER_IMAGE_LICENCES="MIT"
# LATEST_IMAGE_ID=$(docker image ls --format "{{.ID}}" "${DOCKER_IMAGE_FULL_NAME}:latest")

# DOCKER_IMAGE_BUILD_ARGS=(
#     "--build-arg=IMAGE_SOURCE=${BUILT_DOCKER_IMAGE_SOURCE}"
#     "--build-arg=IMAGE_DESCRIPTION=${BUILT_DOCKER_IMAGE_DESCRIPTION}"
#     "--build-arg=IMAGE_TITLE=${BUILT_DOCKER_IMAGE_TITLE}"
#     "--build-arg=IMAGE_NAME=${DOCKER_IMAGE_NAME}"
#     "--build-arg=IMAGE_AUTHORS=${BUILT_DOCKER_IMAGE_AUTHORS}"
#     "--build-arg=IMAGE_SOURCE_COMMIT=${BUILT_DOCKER_IMAGE_SOURCE_COMMIT}"
#     "--build-arg=IMAGE_LICENCES=${BUILT_DOCKER_IMAGE_LICENCES}"
# )
# NOTE: The following line will always change the image ID
# --build-arg "IMAGE_CREATED_DATE=${BUILT_DOCKER_IMAGE_CREATED_DATE}" \

docker image build \
    --file "${CURRENT_WORKING_DIRECTORY_ABSOLUTE_PATH}/docker/${DOCKER_IMAGE_NAME}/Dockerfile" \
    --tag "${DOCKER_IMAGE_FULL_NAME}:latest-build" \
    $DOCKER_IMAGE_BUILD_ARGUMENTS \
    ./
# "${DOCKER_IMAGE_BUILD_ARGS[@]}" \

# LATEST_BUILD_IMAGE_ID=$(docker image ls --format "{{.ID}}" ${DOCKER_IMAGE_FULL_NAME}:latest-build)

# if [ "$LATEST_IMAGE_ID" != "" ] && [ "$LATEST_IMAGE_ID" = "$LATEST_BUILD_IMAGE_ID" ]; then
#     echo "ERROR: Image $DOCKER_IMAGE_FULL_NAME:latest is unchanged"
#     exit 1
# fi

docker image tag \
    ${DOCKER_IMAGE_FULL_NAME}:latest-build \
    ${DOCKER_IMAGE_FULL_NAME}:latest

docker image build \
    --file "${CURRENT_WORKING_DIRECTORY_ABSOLUTE_PATH}/docker/${DOCKER_IMAGE_NAME}/Dockerfile" \
    --target migrate \
    --tag "${DOCKER_IMAGE_FULL_NAME}:latest-migrate" \
    ./

# MAINTENANCE_DOCKER_IMAGE_BUILD_ARGS=(
#     "--build-arg=IMAGE_SOURCE=${BUILT_DOCKER_IMAGE_SOURCE}"
#     "--build-arg=IMAGE_DESCRIPTION=\"Docker image for ${DOCKER_IMAGE_FULL_NAME} service in maintenance mode\""
#     "--build-arg=IMAGE_TITLE=${BUILT_DOCKER_IMAGE_TITLE}-maintenance"
#     "--build-arg=IMAGE_NAME=${DOCKER_IMAGE_NAME}"
#     "--build-arg=IMAGE_AUTHORS=${BUILT_DOCKER_IMAGE_AUTHORS}"
#     "--build-arg=IMAGE_SOURCE_COMMIT=${BUILT_DOCKER_IMAGE_SOURCE_COMMIT}"
#     "--build-arg=IMAGE_LICENCES=${BUILT_DOCKER_IMAGE_LICENCES}"
# )
docker image build \
    --file "${CURRENT_WORKING_DIRECTORY_ABSOLUTE_PATH}/docker/${DOCKER_IMAGE_NAME}/Dockerfile" \
    --build-arg "MAINTENANCE_MODE=true" \
    --tag "${DOCKER_IMAGE_FULL_NAME}:latest-maintenance" \
    ./
# "${MAINTENANCE_DOCKER_IMAGE_BUILD_ARGS[@]}" \

# # Add a date tag
# BUILT_DOCKER_IMAGE_FULL_NAME="${DOCKER_IMAGE_FULL_NAME}:build-${BUILT_DOCKER_IMAGE_CREATED_DATE}"
# docker image tag \
#     ${DOCKER_IMAGE_FULL_NAME}:latest \
#     ${BUILT_DOCKER_IMAGE_FULL_NAME}

# # Add a date tag
# MIGRATE_DOCKER_IMAGE_FULL_NAME="${DOCKER_IMAGE_FULL_NAME}:migrate-${BUILT_DOCKER_IMAGE_CREATED_DATE}"
# docker image tag \
#     ${DOCKER_IMAGE_FULL_NAME}:latest-migrate \
#     ${MIGRATE_DOCKER_IMAGE_FULL_NAME}

# # Add a date tag
# MAINTENANCE_DOCKER_IMAGE_FULL_NAME="${DOCKER_IMAGE_FULL_NAME}:maintenance-${BUILT_DOCKER_IMAGE_CREATED_DATE}"
# docker image tag \
#     ${DOCKER_IMAGE_FULL_NAME}:latest-maintenance \
#     ${MAINTENANCE_DOCKER_IMAGE_FULL_NAME}

echo "Built Docker image: ${DOCKER_IMAGE_FULL_NAME}:latest"
echo "Built Docker image: ${DOCKER_IMAGE_FULL_NAME}:latest-migrate"
echo "Built Docker image: ${DOCKER_IMAGE_FULL_NAME}:latest-maintenance"
# echo "Built Docker image: ${BUILT_DOCKER_IMAGE_FULL_NAME}"
# echo "Built Docker image: ${MIGRATE_DOCKER_IMAGE_FULL_NAME}"
# echo "Built Docker image: ${MAINTENANCE_DOCKER_IMAGE_FULL_NAME}"
