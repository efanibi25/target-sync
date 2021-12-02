import * as methods from '../methods/general.js';

/*
Add New Calendar Evenet
*/

async function addEvents(event) {
  let calendarid = await methods.getCalID();
  let token = await methods.readLocalStorage('token');
  let url = `https://www.googleapis.com/calendar/v3/calendars/${calendarid}/events`;
  const options = {
    method: 'POST',
    headers: new Headers({ authorization: `Bearer ${token}` }),
    body: JSON.stringify(event),
  };
  let resp = await methods.AuthFetch(url, options, 0);
  let data = await resp.json();
  console.debug('Adding New Event', resp, data);
}

/*

Get List of Current Events in Calendar
*/
async function getEvents(start, end) {
  let calendarid = await methods.getCalID();
  start = new Date(`${start} 00:00`).toISOString();
  end = new Date(`${end} 24:00`).toISOString();
  let token = await methods.readLocalStorage('token');
  let url = `https://www.googleapis.com/calendar/v3/calendars/${calendarid}/events?timeMax=${end}&timeMin=${start}&showDeleted=true`;
  const options = {
    method: 'GET',
    headers: new Headers({ authorization: `Bearer ${token}` }),
  };
  let resp = await methods.AuthFetch(url, options, 0);
  let eventHist = await resp.json();
  console.debug(
    `Find List of Google Calendar Events During Week ${start}-${end}`,
    resp,
    eventHist['items']
  );
  return eventHist['items'] || [];
}
/*
 
Remove Events
*/
async function removeEvent(id) {
  let calendarid = await methods.getCalID();
  let token = await methods.readLocalStorage('token');
  let url = `https://www.googleapis.com/calendar/v3/calendars/${calendarid}/events/${id}`;
  const options = {
    method: 'DELETE',
    headers: new Headers({ authorization: `Bearer ${token}` }),
  };
  let resp = await methods.AuthFetch(url, options, 0);
  console.debug('Remove Event', resp);
}

/*
 
Update Event
*/

async function updateEvent(event, summary) {
  let calendarid = await methods.getCalID();
  let token = await methods.readLocalStorage('token');
  let url = `https://www.googleapis.com/calendar/v3/calendars/${calendarid}/events/import`;
  const options = {
    method: 'POST',
    headers: new Headers({ authorization: `Bearer ${token}` }),
    body: JSON.stringify({
      start: event.start,
      end: event.end,
      id: event.id,
      iCalUID: event.iCalUID,
      summary: summary,
      status: 'confirmed',
    }),
  };
  let resp = await methods.AuthFetch(url, options, 0);
  let data = await resp.json();
  console.debug('Updated Event', data, resp);
}

export { addEvents, removeEvent, updateEvent, getEvents };
