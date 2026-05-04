#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset

SCRIPTS_DIR="$(dirname "$(realpath "${0}")")"
APP_DIR="${SCRIPTS_DIR}/../sandbox"

cd "${APP_DIR}";

SYMFONY_SERVER_NAME="Symfony"
SYMFONY_SERVER_COLOR="magenta"
SYMFONY_SERVER_COMMAND="${SCRIPTS_DIR}/serve-sandbox.sh"

TEST_RUNNER_NAME="Storybook Vitest"
TEST_RUNNER_COLOR="green"
TEST_RUNNER_COMMAND="npx wait-on --timeout 180000 tcp:localhost:8000 && npm run test-storybook"

npm run build-storybook -- --quiet

npx concurrently -k -s first \
  -n "${SYMFONY_SERVER_NAME},${TEST_RUNNER_NAME}" \
  -c "${SYMFONY_SERVER_COLOR},${TEST_RUNNER_COLOR}" \
  "${SYMFONY_SERVER_COMMAND}" \
  "${TEST_RUNNER_COMMAND}"
