const { google } = require('googleapis');

function getGmail(auth) {
  return google.gmail({ version: 'v1', auth });
}

async function sendEmail({ auth, to, subject, body }) {
  const gmail = getGmail(auth);

  const raw = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    body,
  ].join('\r\n');

  const encoded = Buffer.from(raw).toString('base64url');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encoded },
  });

  return { id: res.data.id, threadId: res.data.threadId };
}

async function listInbox({ auth, maxResults = 10, query = '' }) {
  const gmail = getGmail(auth);

  const list = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    q: query || undefined,
  });

  const messages = list.data.messages || [];
  if (messages.length === 0) return [];

  const results = [];
  for (const msg of messages) {
    const detail = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
      format: 'metadata',
      metadataHeaders: ['From', 'Subject', 'Date'],
    });

    const headers = detail.data.payload.headers;
    const getHeader = (name) => headers.find(h => h.name === name)?.value || '';

    results.push({
      id: msg.id,
      from: getHeader('From'),
      subject: getHeader('Subject'),
      date: getHeader('Date'),
      snippet: detail.data.snippet,
    });
  }

  return results;
}

async function readEmail({ auth, messageId }) {
  const gmail = getGmail(auth);

  const detail = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  });

  const headers = detail.data.payload.headers;
  const getHeader = (name) => headers.find(h => h.name === name)?.value || '';

  // Extract plain text body
  let body = '';
  const payload = detail.data.payload;

  if (payload.parts) {
    const textPart = payload.parts.find(p => p.mimeType === 'text/plain');
    if (textPart && textPart.body.data) {
      body = Buffer.from(textPart.body.data, 'base64url').toString('utf-8');
    }
  } else if (payload.body && payload.body.data) {
    body = Buffer.from(payload.body.data, 'base64url').toString('utf-8');
  }

  return {
    id: messageId,
    threadId: detail.data.threadId,
    messageIdHeader: getHeader('Message-ID'),
    from: getHeader('From'),
    to: getHeader('To'),
    subject: getHeader('Subject'),
    date: getHeader('Date'),
    body: body || detail.data.snippet,
  };
}

async function markAsRead({ auth, messageId }) {
  const gmail = getGmail(auth);

  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: { removeLabelIds: ['UNREAD'] },
  });
}

module.exports = { sendEmail, listInbox, readEmail, markAsRead };
