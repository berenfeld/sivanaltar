#!/bin/bash

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

pushd ${REPO_ROOT}/docker

docker-compose down

docker-compose up --build -d

echo "Services started! Check status with: docker-compose ps"

popd