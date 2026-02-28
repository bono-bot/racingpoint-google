const { google } = require('googleapis');
const { Readable } = require('stream');

function getDrive(auth) {
  return google.drive({ version: 'v3', auth });
}

async function listFiles({ auth, query, folderId, maxResults = 20 }) {
  const drive = getDrive(auth);

  let q = 'trashed = false';
  if (folderId) q += ` and '${folderId}' in parents`;
  if (query) q += ` and name contains '${query}'`;

  const res = await drive.files.list({
    q,
    pageSize: maxResults,
    fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink)',
    orderBy: 'modifiedTime desc',
  });

  return res.data.files || [];
}

async function uploadFile({ auth, name, mimeType, body, folderId }) {
  const drive = getDrive(auth);

  const fileMetadata = { name };
  if (folderId) fileMetadata.parents = [folderId];

  const media = {
    mimeType,
    body: Buffer.isBuffer(body) ? Readable.from(body) : body,
  };

  const res = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id, name, webViewLink',
  });

  return {
    id: res.data.id,
    name: res.data.name,
    webViewLink: res.data.webViewLink,
  };
}

async function getShareableLink({ auth, fileId }) {
  const drive = getDrive(auth);

  await drive.permissions.create({
    fileId,
    requestBody: { type: 'anyone', role: 'reader' },
  });

  const res = await drive.files.get({
    fileId,
    fields: 'webViewLink',
  });

  return res.data.webViewLink;
}

module.exports = { listFiles, uploadFile, getShareableLink };
