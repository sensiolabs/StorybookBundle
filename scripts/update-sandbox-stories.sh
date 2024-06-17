#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset

TEMP_DIR=$(mktemp -d /tmp/storybook-bundle.XXXXXXX)

cleanup() {
  echo "Removing temporary files..."
  rm -rf "${TEMP_DIR}";
}

trap cleanup EXIT

APP_DIR="$(realpath "$(dirname "${0}")/../sandbox")"
TEMPLATE_STORES_DIR="${APP_DIR}/template-stories"

STORYBOOK_REPOSITORY_URL="https://github.com/storybookjs/storybook.git"
STORYBOOK_VERSION=${1:-$(npm view @storybook/cli version)}

echo "Updating template stories for Storybook ${STORYBOOK_VERSION}"

ARCHIVE_ZIP_URL="${STORYBOOK_REPOSITORY_URL%.git}/archive/refs/tags/v${STORYBOOK_VERSION}.zip"

echo "Fetching archive from ${ARCHIVE_ZIP_URL}...";

curl -L -o "${TEMP_DIR}/storybook.zip"  "${ARCHIVE_ZIP_URL}"

# Extract preview-api stories
unzip "${TEMP_DIR}/storybook.zip" "storybook-${STORYBOOK_VERSION}/code/lib/preview-api/template/stories/*" -d "${TEMP_DIR}"
rm -rf "${TEMPLATE_STORES_DIR}/lib/preview-api"
cp "${TEMP_DIR}/storybook-${STORYBOOK_VERSION}/code/lib/preview-api/template/stories"/* "${TEMPLATE_STORES_DIR}/lib/preview-api"

# Extract essentials addons stories
ESSENTIALS_ADDONS=(actions backgrounds controls docs interactions links toolbars viewport)
unzip "${TEMP_DIR}/storybook.zip" "storybook-${STORYBOOK_VERSION}/code/addons/*/template/stories/*" -d "${TEMP_DIR}"
for addon in "${ESSENTIALS_ADDONS[@]}"; do
  rm -rf "${APP_DIR}/template-stories/addons/${addon}"
  cp -r "${TEMP_DIR}/storybook-${STORYBOOK_VERSION}/code/addons/${addon}/template/stories" "${TEMPLATE_STORES_DIR}/addons/${addon}"
done;

echo "Template stories successfully updated!"
echo ""
echo ""
echo "Now review files in ${TEMPLATE_STORES_DIR} and re-run the test suite."

exit 0
