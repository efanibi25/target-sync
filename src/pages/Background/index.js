import * as methods from "../../../methods/methods.js"
import secrets from 'secrets';
import { setLocalStorage } from "../../../methods/methods.js";
const getUuid = require('uuid-by-string')

//New Events
async function createDict(data) {
  let joblist = []
  let key = await methods.readLocalStorage("key")

  for (let index in data["schedules"]) {
    let slots = data["schedules"][index]
    //Some Workers May have Split Work Days
    for (let times in slots["display_segments"]) {
      let start = slots["display_segments"][times]["segment_start"]
      let end = slots["display_segments"][times]["segment_end"]
      let name =slots["display_segments"][times]["job_name"]
      start = new Date(start).toISOString()
      end = new Date(end).toISOString()
      let id = key+getUuid(end).replace(/-/g, '')
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
      joblist.push(body)
    }
  }
  let added=await addEvents(joblist)
  return added
}

async function addEvents(dict) {
  let calendarid = await methods.readLocalStorage("calendarid")
  let token = await methods.readLocalStorage("token")
  let added={}
  for (let index in dict) {
    
    let url = `https://www.googleapis.com/calendar/v3/calendars/${calendarid}/events`
    const options = {
      method: 'POST',
      headers:new Headers({ 'authorization': `Bearer ${token}` }) ,
      body: JSON.stringify(dict[index])
    }
    let resp= await methods.AuthFetch(url, options);
    let data = await resp.json()
    added[dict[index]["id"]]=dict[index]
    console.log(resp,data,"addevents")
    
  }
  return added
}

//Sync Changes
async function checkEvents(added,start,end){

  let calendarid = await methods.readLocalStorage("calendarid")
  start=new Date(`${start} 00:00`).toISOString() 
  end=new Date(`${end} 24:00`).toISOString() 
  let token = await methods.readLocalStorage("token")
  let url = `https://www.googleapis.com/calendar/v3/calendars/${calendarid}/events?timeMax=${end}&timeMin=${start}&showDeleted=true`
  const options = {
    method: 'GET',
    headers:new Headers({ 'authorization': `Bearer ${token}` })
  }
  let resp= await methods.AuthFetch(url, options)
  let data = await resp.json()
  console.log(resp,data,"Sync Changes Between Calendars")
  for(let index in data["items"]){
    let item=data["items"][index]
    if(!added[item["id"]]){
      removeEvent(item["id"])
    }
    if(item["status"]=="cancelled"){
      let summary=added[item["id"]]["summary"]
      updateEvent(item,summary)
    }
     

   
  }
 

}

async function removeEvent(id){
  let calendarid = await methods.readLocalStorage("calendarid")
  let token = await methods.readLocalStorage("token")
  let url = `https://www.googleapis.com/calendar/v3/calendars/${calendarid}/events/${id}`
 const options = {
   method: 'DELETE',
   headers:new Headers({ 'authorization': `Bearer ${token}` }),
 }
 let resp=await methods.AuthFetch(url,options)
 console.log(resp,"Remove Event")

}


async function updateEvent(event,summary){
  
  let calendarid = await methods.readLocalStorage("calendarid")
  let token = await methods.readLocalStorage("token")
  let url = `https://www.googleapis.com/calendar/v3/calendars/${calendarid}/events/import`
  const options = {
    method: 'POST',
    headers:new Headers({ 'authorization': `Bearer ${token}` }),
    body: JSON.stringify({
      start:event.start,
      end:event.end,
      id:event.id,
      iCalUID:event.iCalUID,
      summary:summary,
      status:"confirmed"
    })
  }
  let resp = await methods.AuthFetch(url, options)
  let data= await resp.json()
  console.log(resp,data,event,summary,"Restored Canceled")
}


// Calendar Check

async function checkCal(){
  let calendarid = await methods.readLocalStorage("calendarid")
  let token = await methods.readLocalStorage("token")
  let url=`https://www.googleapis.com/calendar/v3/users/me/calendarList/${calendarid}`
  const options = {
    method: 'GET',
    headers:new Headers({ 'authorization': `Bearer ${token}` }),
  }
  let resp = await methods.AuthFetch(url, options)
  if(resp.status==404){
    await createCal()
  }
  let data= await resp.json()
  if (data["deleted"]==true){
    await createCal()
  }

  
}


async function createCal(){
    let url = `https://www.googleapis.com/calendar/v3/calendars`
    let token = await methods.readLocalStorage("token")
    const options = {
      method: 'POST',
      headers:new Headers({ 'authorization': `Bearer ${token}` }),
      body: JSON.stringify({"summary":"target"})
    }
    let resp = await methods.AuthFetch(url, options)
    let data = await resp.json()
    console.log(resp,data,"createCal")

    let key=Math.random().toString(20).substr(2, 8)
    key = getUuid(key).replace(/-/g, '')
    await methods.setLocalStorage({"key":key})
    await methods.setLocalStorage({ "calendarid": data["id"] })   
}





//General
async function checkToken() {
  let token = await methods.readLocalStorage("token")
  console.log("Initial Token",token)
  if (token) {
    chrome.runtime.sendMessage({ "auth": true });
  }
  else {
    chrome.runtime.sendMessage({ "auth": false });
  }
}

async function upDate(datalist){
  await checkCal()
  for(let i=0;i<3;i++){
    let data=datalist[i]
    data = JSON.parse(data)
    let added=await createDict(data)
    checkEvents(added,data["start_date"],data["end_date"])
}

}


chrome.runtime.onMessage.addListener(function (message) {
  if (message == "auth") {
    auth()
  }
  if (message == "check_auth") {
    checkToken()
  };

  if (message.sync) {
    
   upDate(message.sync)


    }

    

  });

