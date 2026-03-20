#!/usr/bin/env node
'use strict';

/**
 * Token refresh utility — validate and refresh Google OAuth token.
 * Usage: GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... GOOGLE_REFRESH_TOKEN=... node refresh-token.js
 */

const { getAuthClient } = require('./auth');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.error('Required environment variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN');
  process.exit(1);
}

async function main() {
  const auth = getAuthClient({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET, refreshToken: REFRESH_TOKEN });

  try {
    const response = await auth.refreshAccessToken();
    const credentials = response.credentials;

    const expiry = credentials.expiry_date
      ? new Date(credentials.expiry_date).toISOString()
      : 'unknown';

    console.log(`[${new Date().toISOString()}] Token refreshed. Expires: ${expiry}`);

    // Google rarely issues new refresh tokens, but log if it happens
    if (credentials.refresh_token && credentials.refresh_token !== REFRESH_TOKEN) {
      console.warn(`WARNING: NEW REFRESH TOKEN: ${credentials.refresh_token}`);
      console.warn('Update GOOGLE_REFRESH_TOKEN in ~/.claude/settings.json for all 4 Google MCP entries.');
    }

    process.exit(0);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Token refresh failed: ${err.message}`);
    process.exit(1);
  }
}

main();
