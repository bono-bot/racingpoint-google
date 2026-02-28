const { google } = require('googleapis');

const DEFAULT_TIMEZONE = 'Asia/Kolkata';

function getCalendar(auth) {
  return google.calendar({ version: 'v3', auth });
}

async function listEvents({ auth, calendarId = 'primary', maxResults = 10 }) {
  const calendar = getCalendar(auth);

  const res = await calendar.events.list({
    calendarId,
    timeMin: new Date().toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: 'startTime',
    timeZone: DEFAULT_TIMEZONE,
  });

  const events = res.data.items || [];

  return events.map(event => ({
    id: event.id,
    summary: event.summary || '(No title)',
    start: event.start.dateTime || event.start.date,
    end: event.end.dateTime || event.end.date,
    location: event.location || null,
    description: event.description || null,
  }));
}

async function createEvent({ auth, calendarId = 'primary', summary, start, end, description, location, attendees }) {
  const calendar = getCalendar(auth);

  const event = {
    summary,
    start: { dateTime: start, timeZone: DEFAULT_TIMEZONE },
    end: { dateTime: end, timeZone: DEFAULT_TIMEZONE },
  };

  if (description) event.description = description;
  if (location) event.location = location;
  if (attendees && attendees.length > 0) {
    event.attendees = attendees.map(email => ({ email }));
  }

  const res = await calendar.events.insert({
    calendarId,
    requestBody: event,
    sendUpdates: 'all',
  });

  return {
    id: res.data.id,
    summary: res.data.summary,
    start: res.data.start.dateTime || res.data.start.date,
    end: res.data.end.dateTime || res.data.end.date,
    htmlLink: res.data.htmlLink,
  };
}

async function deleteEvent({ auth, calendarId = 'primary', eventId }) {
  const calendar = getCalendar(auth);

  await calendar.events.delete({
    calendarId,
    eventId,
  });
}

module.exports = { listEvents, createEvent, deleteEvent };
