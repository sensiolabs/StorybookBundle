#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset

SCRIPTS_DIR="$(dirname "$(realpath "${0}")")"
APP_DIR="${SCRIPTS_DIR}/../sandbox"

cd "${APP_DIR}";

declare -rA SYMFONY_SERVER=(
  ["color"]="magenta"
  ["name"]="Symfony"
  ["command"]="${SCRIPTS_DIR}/serve-sandbox.sh"
);

declare -rA STORYBOOK=(
  ["color"]="blue"
  ["name"]="Storybook"
  ["command"]="npm run build-storybook -- --quiet && npx http-server storybook-static --proxy http://localhost:8000 --port 6006 --silent"
)

declare -rA TEST_RUNNER=(
  ["color"]="green"
  ["name"]="Test Runner"
  ["command"]="npx wait-on --timeout 60000 tcp:localhost:8000 tcp:127.0.0.1:6006 && npm run test-storybook -- --stories-json --excludeTags will-fail"
)

npx concurrently -k -s first \
  -n "${SYMFONY_SERVER["name"]},${STORYBOOK["name"]},${TEST_RUNNER["name"]}" \
  -c "${SYMFONY_SERVER["color"]},${STORYBOOK["color"]},${TEST_RUNNER["color"]}" \
  "${SYMFONY_SERVER["command"]}" \
  "${STORYBOOK["command"]}" \
  "${TEST_RUNNER["command"]}"
