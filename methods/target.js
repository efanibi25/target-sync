import { apikey } from '../src/pages/Content/apikey';
import { readLocalStorage, setLocalStorage } from './general';

async function weeks(target_token) {
  let sundays = getSundays();
  let saturdays = getSatdays();
  console.debug('This is saturday', saturdays);
  console.debug('This is sunday', sundays);

  let temp = await calandarSync(target_token);
  let memberdata = [];

  for (let i = 0; i < 3; i++) {
    let sunday = sundays[i];
    let saturday = saturdays[i];
    let result = await temp(sunday, saturday);
    if (result === false) {
      continue;
    }
    memberdata.push(result);
  }
  return memberdata;
}

function calandarSync(target_token) {
  return async function workhours(sunday, saturday) {
    let team_member_number = (await readLocalStorage('team')) || '';
    let location_id = (await readLocalStorage('store')) || '';
    let api = apikey['key'];
    if (team_member_number.lenth == 0 || location_id.length == 0) { 
      chrome.runtime.sendMessage({"alert":"You must Enter your Team Member Number and Location ID into Options"});   
      return false
    }      


    let url = `https://api.target.com/wfm_schedules/v1/weekly_schedules?team_member_number=00${team_member_number}&start_date=${sunday}&end_date=${saturday}&location_id=${location_id}&key=${api}`;
    console.debug('Target API URL:', url);
    const options = {
      method: 'GET',
      headers: new Headers({ authorization: `${target_token}` }),
    };
    let wkdata = await fetch(url, options);
    wkdata = await wkdata.json();
    
    if (!wkdata['team_member_number']) {
      chrome.runtime.sendMessage({"alert":wkdata['message']});

      return false;
    }
    wkdata = JSON.stringify(wkdata);
    return wkdata;
  };
}

//beginning of weeks
function getSundays() {
  let sundays = [];
  for (let i = 0; i < 3; i++) {
    var today = new Date();
    var day = today.getDay();
    today.setHours(-24 * day + 7 * i * 24);
    today = today.toLocaleString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    sundays.push(today);
  }

  return sundays;
}
//end of weeks
function getSatdays() {
  let saturdays = [];
  for (let i = 0; i < 3; i++) {
    var today = new Date();
    var day = today.getDay();
    let dif = 6 - day;
    today.setHours(24 * (dif + 7 * i));
    today = today.toLocaleString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    saturdays.push(today);
  }

  return saturdays;
}

export { weeks };
