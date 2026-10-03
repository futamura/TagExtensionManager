# Chrome Web Store API Setup Guide

## Overview

This guide explains how to set up Chrome Web Store API access for automated extension publishing.

The release workflow (`.github/workflows/release.yml`) calls the [Chrome Web Store API v2](https://developer.chrome.com/docs/webstore/api/reference/rest) through `.github/scripts/chrome-webstore.sh`. On a `v*.*.*` tag it uploads the package and submits it for review; the new version goes live as soon as the review passes.

## Prerequisites

- Google Cloud Console access
- Chrome Web Store Developer Account
- Extension already published on Chrome Web Store

## Step 1: Enable Chrome Web Store API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Navigate to **APIs & Services > Library**
4. Search for "Chrome Web Store API"
5. Click on it and press **Enable**

## Step 2: Create OAuth2 Credentials

1. Navigate to **APIs & Services > Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Configure the OAuth consent screen if prompted, and set its publishing status to **In production** (refresh tokens issued while it is in **Testing** expire after 7 days)
4. Choose **Desktop app** as the application type
5. Click **Create**
6. Note down the **Client ID** and **Client Secret**

The client and refresh token belong to the Google account, not to a single extension, so the same credentials work for every extension of the same publisher.

## Step 3: Generate Refresh Token

```bash
npx chrome-webstore-upload-keys
```

Enter the **Client ID** and **Client Secret**, sign in with the account that manages the extension, and copy the printed **Refresh token**. The token is issued with the `https://www.googleapis.com/auth/chromewebstore` scope.

Google OAuth2 Playground fails with `redirect_uri_mismatch` for Desktop app clients.

## Step 4: Get Publisher ID and Extension ID

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Copy the **Publisher ID** from **Publisher > Settings**
3. Find your extension and copy the **Extension ID** (32 letters a-p) from the URL or extension details

## Step 5: Configure GitHub Secrets

Add the following secrets to your GitHub repository:

1. Go to your repository > **Settings** > **Secrets and variables** > **Actions**
2. Add the following secrets:
   - `CHROME_CLIENT_ID`: Your OAuth2 Client ID
   - `CHROME_CLIENT_SECRET`: Your OAuth2 Client Secret
   - `CHROME_REFRESH_TOKEN`: Your Refresh Token
   - `CHROME_PUBLISHER_ID`: Your Publisher ID
   - `CHROME_EXTENSION_ID`: Your Extension ID

## Step 6: Verify the Setup

Run the **Chrome Web Store Check** workflow (**Actions > Chrome Web Store Check > Run workflow**). It obtains an access token and reads the item status without uploading anything. Pushes that change `.github/scripts/chrome-webstore.sh` or the check workflow also run it.

## Troubleshooting

The upload step prints which request failed (OAuth2 token, fetchStatus, upload or publish) and the likely cause.

### invalid_grant

- The refresh token expired or was revoked (unused for 6 months, or 7 days while the OAuth consent screen is in **Testing**)
- Generate a new one (Step 3) and update `CHROME_REFRESH_TOKEN`

### invalid_client

- `CHROME_CLIENT_ID` / `CHROME_CLIENT_SECRET` do not match a **Desktop app** OAuth client

### 403 Forbidden

- Ensure Chrome Web Store API is enabled in the Google Cloud project of the OAuth client
- Ensure the refresh token was issued with the `https://www.googleapis.com/auth/chromewebstore` scope
- Ensure the account that issued the token can manage this publisher

### 404 Not Found

- Check `CHROME_PUBLISHER_ID` (Publisher > Settings) and `CHROME_EXTENSION_ID` in the Developer Dashboard

### Upload Rejected

- The version must be higher than the published and submitted versions
- A submission still in review must be cancelled in the Developer Dashboard first

## Security Notes

- Never commit OAuth2 credentials to version control
- Use GitHub Secrets for all sensitive information
- Regularly rotate refresh tokens
- Monitor API usage in Google Cloud Console

## References

- [Chrome Web Store API Documentation](https://developer.chrome.com/docs/webstore/api/)
- [Chrome Web Store API v2 Reference](https://developer.chrome.com/docs/webstore/api/reference/rest)
- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
