import * as methods from "../methods/general.js"
import * as events from "../methods/events.js"
import { key } from "../secrets.js"
const getUuid = require('uuid-by-string')



/*
Sync 'Target' Calendar Events With Work Schedule
i>3 Because only up to 3 weeks max for Target Schedules
*/
async function upDateCal(datalist) {

    await checkCal()
    let added = 0
    let updated = 0
    let removed = 0
    for (let i = 0; i < 3; i++) {
      let data = datalist[i]
      console.debug("Work Hours Array:",datalist,"index:",i)
      data = JSON.parse(data)
      if (data==null){
        continue
      }
      let targetEvents = await createEventsDict(data)
      console.debug("Hours to be Push To Calendar:", targetEvents)
      let targetStart = data["start_date"]
      let targetEnd = data["end_date"]
      let eventList = await events.getEvents(targetStart, targetEnd)
      let calKeys = eventList.reduce((prev, curr) => {
        prev.push(curr["id"])
        return prev
      }, [])
      for (let index in eventList) {
        let eventObject = eventList[index]
        let id = eventObject["id"]
        let status = eventObject["status"]
        let tarKeys = Object.keys(targetEvents)
        if (!tarKeys.includes(id) && status != "cancelled") {
          console.debug("we remove this event ID:", id)
          events.removeEvent(id)
          removed = removed + 1
        }
        else if (targetEvents[id]) {
          let summary = targetEvents[id]["summary"]
          console.debug("we should update this event ID:", id)
          events.updateEvent(eventObject, summary)
          updated = updated + 1
        }
      }
      for (let index in Object.keys(targetEvents)) {
        let id = Object.keys(targetEvents)[index]
        if (!calKeys.includes(id)) {
          console.debug("we should add this event ID:", id)
          added = added + 1
          events.addEvents(targetEvents[id])
        }
      }
    }
    let id = await methods.getCalID()
    let message= `Updated:${updated} Events\nAdded:${added} Events\nRemoved:${removed} Events\nTarget Calendar ID:${id}`
    console.debug("Target Calendar Updated:",message)
    methods.printNotif(message,"Target Calendar Updated")
  
   
  
    
  }

/*
Create Calendar Event Objects to Push To Calendar API if Needed
*/

async function createEventsDict(data) {
    let joblist = {}    
    for (let index in data["schedules"]) {
      let slots = data["schedules"][index]
      //Some Workers May have Split Work Days
      for (let times in slots["display_segments"]) {
        let start = slots["display_segments"][times]["segment_start"]
        let end = slots["display_segments"][times]["segment_end"]
        let name = slots["display_segments"][times]["job_name"]
        start = new Date(start).toISOString()
        end = new Date(end).toISOString()
        let id = key + getUuid(start).replace(/-/g, '') + getUuid(end).replace(/-/g, '')
        let body = {
          "start": {
            "dateTime": start
          },
          "end": {
            "dateTime": end
          },
          "id": id,
          "summary": `Target ${name}`
        }
        joblist[id] = body
      }
    }
    return joblist
  }




  /*
Create New Target Calendar
*/
async function createCal(account) {
    let url = `https://www.googleapis.com/calendar/v3/calendars`
    let token = await methods.readLocalStorage("token")
    let options = {
      method: 'POST',
      headers: new Headers({ 'authorization': `Bearer ${token}` }),
      body: JSON.stringify({ "summary": "target" })
    }
    let resp = await methods.AuthFetch(url, options, 0)
    let data = await resp.json()
    console.debug("createCal", resp, data,)
    let key=`calid${account}`
    await methods.setLocalStorage({ [key]: data["id"]})
  }



  /*
Check Status of Calendar
*/
async function ValidateCurrentCal(token, calendarid) {
    let url = `https://www.googleapis.com/calendar/v3/calendars/${calendarid}`
    const options = {
      method: 'GET',
      headers: new Headers({ 'authorization': `Bearer ${token}` }),
    }
    let resp = await methods.AuthFetch(url, options, 0)
    if (!resp&&resp!==null) {
      return false
    }
    else if (resp.status == 404 || resp.status == 401) {
      return false
    }
    else if (resp.status > 399) {
      return "Error"
    }
    let data = await resp.json()
    console.debug("Status of Calendar", data, resp)
    if (data["deleted"] == true) {
      return false
    }
    return true
  }


  /*
Validates Previously Set Calendar
Creates New Calender if Needed
np*/
async function checkCal() {
  let account = await methods.getAccountID(0)
  let token = await methods.readLocalStorage("token")
  let calendarid = await methods.getCalID()

  if (token != null && calendarid != null) {
    let check = await ValidateCurrentCal(token, calendarid)
    if (check == false) {
      await createCal(account)
    }

  }

  else if (token != null) {
    await createCal(account)
    // await setTargetCal()

  }
}


/*
Check for Existing Target Calendar(s)
*/
async function findTargetCal(token) {
    console.debug("Looking for Calendar Named:Target")
    let url = `https://www.googleapis.com/calendar/v3/users/me/calendarList/`
    const options = {
      method: 'GET',
      headers: new Headers({ 'authorization': `Bearer ${token}` }),
    }
    let resp = await methods.AuthFetch(url, options, 0)
    if (resp.status == 404) {
      return false
    }
  
    let list = []
    let data = await resp.json()
    for (let index in data["items"]) {
      let name = data["items"][index]["summary"]
      let id = data["items"][index]["id"]
      if (name == "target") {
        list.push(id)
      }
    }
    return list
  }


/*
Set The Target Calendar for User if Valid is Found
Create a new Target Calendar if Not
*/

async function setTargetCal() {
    //Need Additional Scopes Add later
    let token = await methods.readLocalStorage("token")
    let calendarlist = await findTargetCal(token)
    let account = methods.getAccountID(0)
    console.debug("List of IDs for Calendars with Named 'Target'", calendarlist)
    if (calendarlist.length == 0) {
      await createCal(account)
    }
    for (let index in calendarlist) {
      calendarid = calendarlist[index]
      let check = await ValidateCurrentCal(token, calendarid)
      if (check == false && index == calendarlist.length - 1) {
        await createCal(account)
  
      }
      else if (check == true) {
        break
      }
    }
  }



  export {upDateCal}