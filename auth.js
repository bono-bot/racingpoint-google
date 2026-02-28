const { google } = require('googleapis');

let authClient = null;

function getAuthClient({ clientId, clientSecret, refreshToken }) {
  if (authClient) return authClient;

  authClient = new google.auth.OAuth2(clientId, clientSecret);
  authClient.setCredentials({ refresh_token: refreshToken });

  return authClient;
}

let serviceAccountAuth = null;

async function getServiceAccountAuth({ keyFile, subject, scopes }) {
  if (serviceAccountAuth) return serviceAccountAuth;

  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes,
    clientOptions: { subject },
  });

  serviceAccountAuth = await auth.getClient();
  return serviceAccountAuth;
}

module.exports = { getAuthClient, getServiceAccountAuth };
