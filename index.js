const { getAuthClient, getServiceAccountAuth } = require('./auth');
const gmail = require('./services/gmail');
const calendar = require('./services/calendar');
const sheets = require('./services/sheets');
const drive = require('./services/drive');

module.exports = {
  getAuthClient,
  getServiceAccountAuth,
  gmail,
  calendar,
  sheets,
  drive,
};
