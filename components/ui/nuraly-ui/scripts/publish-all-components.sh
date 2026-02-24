#!/usr/bin/env bash

set -euo pipefail

# Publish all components under dist/components using publish-if-not-published
# - Uses registry https://registry.npmjs.org/
# - Publishes with tag "latest" and access "public"
# - Supports OTP via NPM_OTP env var (but note OTP is single-use and time-bound)
#
# Usage:
#   # Option 1: Use Automation token (recommended; no OTP prompts for publishes)
#   NPM_TOKEN=xxxxx ./scripts/publish-all-components.sh
#
#   # Option 2: Logged-in user with 2FA (provide fresh OTP for each publish)
#   # You can export NPM_OTP=123456 but it will only be valid for one publish.
#   npm login
#   NPM_OTP=123456 ./scripts/publish-all-components.sh

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
COMPONENTS_DIR="$ROOT_DIR/dist/components"

if [ ! -d "$COMPONENTS_DIR" ]; then
  echo "dist/components not found. Please run: npm run build && npm run roll"
  exit 1
fi

# Ensure helper is available; install globally if it's not
if ! command -v publish-if-not-published >/dev/null 2>&1; then
  echo "Installing publish-if-not-published globally..."
  npm install -g publish-if-not-published
fi

echo "Publishing components from $COMPONENTS_DIR..."

REGISTRY="${NPM_REGISTRY:-https://registry.npmjs.org/}"
echo "Using registry: $REGISTRY"

PUBLISH_ARGS=(--access=public --tag=latest --registry="$REGISTRY" --always-auth=true)
if [ "${NPM_OTP:-}" != "" ]; then
  echo "Using OTP from NPM_OTP environment variable"
  PUBLISH_ARGS+=(--otp="$NPM_OTP")
fi

# If a token is provided, pass it explicitly as a CLI config to avoid relying on ~/.npmrc
if [ "${NPM_TOKEN:-}" != "" ]; then
  # Extract host from registry URL (drop scheme and trailing slash)
  REGISTRY_HOST=${REGISTRY#*://}
  REGISTRY_HOST=${REGISTRY_HOST%/}
  echo "Using auth token for //$REGISTRY_HOST/"
  PUBLISH_ARGS+=(--"//${REGISTRY_HOST}/:_authToken=${NPM_TOKEN}")
fi

# Iterate all component folders
while IFS= read -r dir; do
  name=$(basename "$dir")

  if [ -f "$dir/package.json" ]; then
    echo "\n— Publishing $name —"
    # Attempt publish; don't stop the whole script on a single failure
    if (cd "$dir" && publish-if-not-published -- "${PUBLISH_ARGS[@]}"); then
      echo "✔ Published or already up-to-date: $name"
    else
      echo "✖ Failed to publish: $name (continuing)"
    fi
  else
    echo "Skipping $name (missing package.json)"
  fi
done < <(find "$COMPONENTS_DIR" -mindepth 1 -maxdepth 1 -type d | sort)

echo "\nDone."
