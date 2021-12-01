import secrets from 'secrets';
import icon from "../src/assets/img/icon128.png"

/*
Chrome local storage command, but with promises
*/
const readLocalStorage = async (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], function (result) {
      console.debug("Reading from storage", result)
      if (Object.keys(result).length === 0) {
        resolve(null)
      }
      if
        (result[key] === null) {
        resolve(null);
      } else if (result[key] != null) {
        resolve(result[key]);
      }
      else {
        reject(null)
      }
    });
  });
};

/*
Chrome local storage command, but with promises
*/

const setLocalStorage = async (obj) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(obj, function (result) {
      console.debug("Setting Storage", obj)
      resolve(obj)
    });
  });
};


/*
Checks if authenticated if not, allows user to login.
*/
const AuthFetch = async (url, options, count) => {
  if (count == 2) {
    return
  }
  let resp = await fetch(url, options)
  console.debug("Validating Token:", resp, count)
  if (resp.status != 401 && resp.status != 404) {
    return resp
  }
  else {
    await auth()
    let token = await readLocalStorage("token")
    options["headers"] = new Headers({ 'authorization': `Bearer ${token}` }),
      AuthFetch(url, options, count + 1)
  }




}


function auth() {
  return new Promise((resolve, reject) => {
    let authURL = "https://accounts.google.com/o/oauth2/auth";
    const redirectURL = chrome.identity.getRedirectURL();
    const scopes = ["https://www.googleapis.com/auth/calendar.app.created", "https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"];
    authURL += `?client_id=${secrets.clientid}`;
    authURL += `&response_type=token`;
    authURL += `&redirect_uri=${encodeURIComponent(redirectURL)}`;
    authURL += `&scope=${encodeURIComponent(scopes.join(' '))}`;
    chrome.identity.launchWebAuthFlow({ "interactive": true, "url": authURL }, function (token) {
      var path = new URL(token)
      let hash = path.hash
      hash = hash.split("&")[0].split("=")[1]
      setLocalStorage({ "token": hash })
      resolve(true)
    })
  });
};



async function getAccountID(count) {
  if (count == 4) {
    return
  }
  let token = await readLocalStorage("token")
  const options = {
    method: 'GET',
    headers: new Headers({ 'authorization': `Bearer ${token}` }),
  }
  let url = `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`


  let resp = await fetch(url, options)
  console.debug("Get Account ID", resp, count)

  if (resp.status != 401) {
    let data = await resp.json()
    console.debug(data)
    return data["id"]
  }
  else {
    await auth()
    getAccountID(count + 1)
  }


};


async function getAccountEmail(count) {
  if (count == 4) {
    return
  }
  let token = await readLocalStorage("token")
  const options = {
    method: 'GET',
    headers: new Headers({ 'authorization': `Bearer ${token}` }),
  }
  let url = `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`


  let resp = await fetch(url, options)
  console.debug("Get Account Email", resp, count)

  if (resp.status != 401) {
    let data = await resp.json()
    console.debug(data)
    return data["email"]
  }
  else {
    await auth()
    getAccountEmail(count + 1)
  }


};






async function getCalID() {
  let account = await getAccountID()
  if (account !== null) {
    let key = `calid${account}`
    return await readLocalStorage(key)
  }

}



async function logout() {
  let token = await readLocalStorage("token")
  let logout = await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
  await setLocalStorage({ "token": null })
  console.debug("Logout:", logout)
  await chrome.runtime.sendMessage({ "auth": false });
}


/*
Grant Permission For Calendar API
*/
async function checkToken() {
  let token = await readLocalStorage("token")
  console.debug("Initial Token", token)
  if (token != null) {
    await chrome.runtime.sendMessage({ "auth": true });
  }
  else {
    await chrome.runtime.sendMessage({ "auth": false });
  }
}

/*
print Notification
*/
async function printNotif(notif, title) {
  chrome.notifications.create("null", { "message": notif, "title": title, "type": "basic", "iconUrl": icon }, (id) => {
    console.debug("Created Notification:", id)
  }

  )
}

export { setLocalStorage, readLocalStorage, AuthFetch, auth, logout, checkToken, getAccountID, getCalID, getAccountEmail, printNotif }