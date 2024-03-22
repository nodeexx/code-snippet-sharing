#!/usr/bin/env bash

set -eu

docker container run \
    --name "graphana-k6" \
    --interactive \
    --tty \
    --rm \
    --user "root" \
    --workdir "/home/k6" \
    --volume "${PWD}:/home/k6" \
    "grafana/k6:0.49.0" \
    $@
