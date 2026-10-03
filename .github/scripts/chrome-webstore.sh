#!/usr/bin/env bash
# Chrome Web Store API v2 client for the release workflows
# (https://developer.chrome.com/docs/webstore/api/reference/rest)
#
# Usage:
#   chrome-webstore.sh check          Check the credentials and print the item status
#   chrome-webstore.sh publish <zip>  Upload the package and submit it for review;
#                                     it goes live as soon as the review passes
#
# Environment: CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, PUBLISHER_ID, EXTENSION_ID
set -euo pipefail

API="https://chromewebstore.googleapis.com"
DASHBOARD="https://chrome.google.com/webstore/devconsole/"
# Upload processing is asynchronous; poll fetchStatus for up to 5 minutes
POLL_INTERVAL=10
POLL_ATTEMPTS=30

HTTP_STATUS=""
RESPONSE=""

error() {
  if [ -n "${GITHUB_ACTIONS:-}" ]; then
    echo "::error::$1"
  else
    echo "❌ $1" >&2
  fi
}

require_env() {
  local missing=0
  for name in CLIENT_ID CLIENT_SECRET REFRESH_TOKEN PUBLISHER_ID EXTENSION_ID; do
    if [ -z "${!name:-}" ]; then
      error "${name} is not set (repository secret CHROME_${name})"
      missing=1
    fi
  done
  if [ "$missing" -ne 0 ]; then
    echo "   Set it in Settings > Secrets and variables > Actions"
    echo "   CHROME_PUBLISHER_ID is shown in the Developer Dashboard under Publisher > Settings: ${DASHBOARD}"
    exit 1
  fi

  if [[ ! "$EXTENSION_ID" =~ ^[a-p]{32}$ ]]; then
    error "CHROME_EXTENSION_ID is not a valid extension ID (32 letters a-p, got ${#EXTENSION_ID} characters)"
    echo "   Copy it from the item's URL in the Developer Dashboard: ${DASHBOARD}"
    exit 1
  fi

  ITEM="publishers/${PUBLISHER_ID}/items/${EXTENSION_ID}"
}

# Sends a request and stores the HTTP status and body in HTTP_STATUS / RESPONSE
request() {
  local body
  body=$(mktemp)
  HTTP_STATUS=$(curl -sS -o "$body" -w '%{http_code}' -H "Authorization: Bearer ${ACCESS_TOKEN}" "$@")
  RESPONSE=$(cat "$body")
  rm -f "$body"
}

get_access_token() {
  local response
  response=$(curl -sS -X POST \
    -d "client_id=${CLIENT_ID}" \
    -d "client_secret=${CLIENT_SECRET}" \
    -d "refresh_token=${REFRESH_TOKEN}" \
    -d "grant_type=refresh_token" \
    "https://oauth2.googleapis.com/token")
  ACCESS_TOKEN=$(echo "$response" | jq -r '.access_token // empty')

  if [ -z "$ACCESS_TOKEN" ]; then
    error "Failed to obtain an OAuth2 access token"
    echo "   Response: ${response}"
    echo "   Secret lengths: client ID ${#CLIENT_ID}, client secret ${#CLIENT_SECRET}, refresh token ${#REFRESH_TOKEN}"
    echo "   invalid_grant: the refresh token expired or was revoked (unused for 6 months, or 7 days"
    echo "   while the OAuth consent screen is in 'Testing'). Re-issue it with"
    echo "   'npx chrome-webstore-upload-keys' and update CHROME_REFRESH_TOKEN"
    echo "   invalid_client: CHROME_CLIENT_ID / CHROME_CLIENT_SECRET do not match a 'Desktop app' OAuth client"
    exit 1
  fi
  if [ -n "${GITHUB_ACTIONS:-}" ]; then
    echo "::add-mask::${ACCESS_TOKEN}"
  fi
  echo "✅ OAuth2 access token obtained"
}

explain_api_error() {
  echo "   HTTP ${HTTP_STATUS}: ${RESPONSE}"
  case "$HTTP_STATUS" in
    401)
      echo "   The access token was rejected. Re-issue the refresh token with 'npx chrome-webstore-upload-keys'"
      ;;
    403)
      echo "   Check that the Chrome Web Store API is enabled in the Google Cloud project of the OAuth client,"
      echo "   that the refresh token was issued with the https://www.googleapis.com/auth/chromewebstore scope,"
      echo "   and that the account that issued it can manage this publisher"
      ;;
    404)
      echo "   No item ${ITEM}. Check CHROME_PUBLISHER_ID (Publisher > Settings) and CHROME_EXTENSION_ID"
      echo "   in the Developer Dashboard: ${DASHBOARD}"
      ;;
  esac
}

fetch_status() {
  request -X GET "${API}/v2/${ITEM}:fetchStatus"
  if [ "$HTTP_STATUS" != "200" ]; then
    error "fetchStatus failed for ${ITEM}"
    explain_api_error
    exit 1
  fi
}

print_status() {
  echo "$RESPONSE" | jq -r '
    def revision(r): if r then "\(r.state) \([r.distributionChannels[]?.crxVersion] | join(", "))" else "none" end;
    "   Published: \(revision(.publishedItemRevisionStatus))",
    "   Submitted: \(revision(.submittedItemRevisionStatus))",
    "   Last upload: \(.lastAsyncUploadState // "none")",
    "   Taken down: \(.takenDown // false), warned: \(.warned // false)"'
}

check() {
  require_env
  get_access_token
  fetch_status
  echo "✅ Chrome Web Store API v2 access works for ${ITEM}"
  print_status
}

wait_for_upload() {
  local state
  for _ in $(seq "$POLL_ATTEMPTS"); do
    sleep "$POLL_INTERVAL"
    fetch_status
    state=$(echo "$RESPONSE" | jq -r '.lastAsyncUploadState // empty')
    echo "   Upload state: ${state}"
    case "$state" in
      SUCCEEDED) return 0 ;;
      IN_PROGRESS | UPLOAD_IN_PROGRESS) ;;
      *)
        error "Upload processing ended in state ${state}"
        echo "   ${RESPONSE}"
        exit 1
        ;;
    esac
  done
  error "Upload still in progress after $((POLL_INTERVAL * POLL_ATTEMPTS)) seconds"
  echo "   Check the item in the Developer Dashboard and publish it there: ${DASHBOARD}"
  exit 1
}

publish() {
  local zip="${1:-}"
  if [ ! -f "$zip" ]; then
    error "Package not found: ${zip}"
    exit 1
  fi
  local version
  version=$(unzip -p "$zip" manifest.json | jq -r '.version')

  require_env
  get_access_token
  fetch_status
  echo "📋 Current status of ${ITEM}:"
  print_status

  echo "📤 Uploading ${zip} (version ${version}, $(du -h "$zip" | cut -f1))..."
  request -X POST -T "$zip" "${API}/upload/v2/${ITEM}:upload"
  if [ "$HTTP_STATUS" != "200" ]; then
    error "Upload failed"
    explain_api_error
    echo "   The version must be higher than the published and submitted versions. A submission still"
    echo "   in review must be cancelled first in the Developer Dashboard: ${DASHBOARD}"
    exit 1
  fi
  local upload_state
  upload_state=$(echo "$RESPONSE" | jq -r '.uploadState // empty')
  echo "   Upload state: ${upload_state}"
  case "$upload_state" in
    SUCCEEDED) ;;
    IN_PROGRESS | UPLOAD_IN_PROGRESS) wait_for_upload ;;
    *)
      error "Upload ended in state ${upload_state}"
      echo "   ${RESPONSE}"
      exit 1
      ;;
  esac
  echo "✅ Upload completed"

  echo "🚀 Submitting for review..."
  request -X POST -H "Content-Type: application/json" \
    -d '{"publishType": "DEFAULT_PUBLISH"}' \
    "${API}/v2/${ITEM}:publish"
  if [ "$HTTP_STATUS" != "200" ]; then
    error "Publish failed"
    explain_api_error
    exit 1
  fi
  echo "$RESPONSE" | jq -r '.warningInfo.warnings[]? | "⚠️ \(.reason): \(.description)"'
  local item_state
  item_state=$(echo "$RESPONSE" | jq -r '.state // empty')
  case "$item_state" in
    PENDING_REVIEW | PUBLISHED)
      echo "✅ Version ${version} submitted (state: ${item_state}); it goes live when the review passes"
      ;;
    *)
      error "Unexpected item state after publish: ${item_state}"
      echo "   ${RESPONSE}"
      exit 1
      ;;
  esac
}

case "${1:-}" in
  check) check ;;
  publish) publish "${2:-}" ;;
  *)
    echo "Usage: $0 check | publish <zip>" >&2
    exit 2
    ;;
esac
