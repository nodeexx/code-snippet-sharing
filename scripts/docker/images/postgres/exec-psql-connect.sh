#!/bin/sh

set -eu

docker container exec \
    --interactive \
    --tty \
    code-snippet-sharing--postgres \
        psql \
            --host localhost \
            --port 5434 \
            --username postgres \
            --dbname postgres
