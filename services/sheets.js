const { google } = require('googleapis');

function getSheets(auth) {
  return google.sheets({ version: 'v4', auth });
}

function extractSpreadsheetId(input) {
  // Accept full URL or raw ID
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : input;
}

async function readRange({ auth, spreadsheetId, range }) {
  const sheets = getSheets(auth);
  const id = extractSpreadsheetId(spreadsheetId);

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: id,
    range,
  });

  return res.data.values || [];
}

async function writeRange({ auth, spreadsheetId, range, values, append = false }) {
  const sheets = getSheets(auth);
  const id = extractSpreadsheetId(spreadsheetId);

  if (append) {
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId: id,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    return {
      updatedRows: res.data.updates.updatedRows,
      updatedColumns: res.data.updates.updatedColumns,
      updatedCells: res.data.updates.updatedCells,
    };
  }

  const res = await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });

  return {
    updatedRows: res.data.updatedRows,
    updatedColumns: res.data.updatedColumns,
    updatedCells: res.data.updatedCells,
  };
}

module.exports = { readRange, writeRange, extractSpreadsheetId };
