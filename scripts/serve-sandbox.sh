#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset

APP_DIR="$(realpath "$(dirname "${0}")/../sandbox")"

cd "${APP_DIR}";

echo "Starting Symfony server"

php -S localhost:8000 public/index.php 2> >(grep -v -P "(Accepted|Closing)$" 1>&2)
