import secrets from 'secrets';
import icon from '../src/assets/img/icon128.png';

/*
Chrome sync storage command, but with promises
*/
const readLocalStorage = async (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], function (result) {
      console.debug('Reading from storage', result);
      if (Object.keys(result).length === 0) {
        resolve(null);
      }
      if (result[key] === null) {
        resolve(null);
      } else if (result[key] != null) {
        resolve(result[key]);
      } else {
        reject(null);
      }
    });
  });
};

/*
Chrome local sync command, but with promises
*/

const setLocalStorage = async (obj) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(obj, function (result) {
      console.debug('Setting Storage', obj);
      resolve(obj);
    });
  });
};

/*
Fetch URL
Checks if authenticated if not, allows user to login.
*/
const AuthFetch = async (url, options, count) => {

  let resp = await fetch(url, options);
  console.debug('Validating Token:', resp, count);
  if (resp.status != 401 && resp.status != 404) {
    return resp;
  }
  if (count >= 2) {
    return;
  }
  else {
    let token = await auth();
    await setLocalStorage({ "token": token });
    options['headers'] = new Headers({ authorization: `Bearer ${token}` })
    AuthFetch(url, options, count + 1);
  }
};

function auth() {
  return new Promise((resolve, reject) => {
    let authURL = 'https://accounts.google.com/o/oauth2/auth';
    const redirectURL = chrome.identity.getRedirectURL();
    const scopes = [
      'https://www.googleapis.com/auth/calendar.app.created',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];
    authURL += `?client_id=${secrets.clientid}`;
    authURL += `&response_type=token`;
    authURL += `&redirect_uri=${encodeURIComponent(redirectURL)}`;
    authURL += `&scope=${encodeURIComponent(scopes.join(' '))}`;
    chrome.identity.launchWebAuthFlow(
      { interactive: true, url: authURL },
      function (token) {
        var path = new URL(token);
        let hash = path.hash;
        hash = hash.split('&')[0].split('=')[1];
        console.debug('New Hash:', hash);
        resolve(hash);
      }
    );
  });
}

async function getAccountID(count) {
  let token = await readLocalStorage('token');
  const options = {
    method: 'GET',
    headers: new Headers({ authorization: `Bearer ${token}` }),
  };
  let url = `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`;

  let resp = await fetch(url, options);
  console.debug('Get Account ID', resp, count);

  if (resp.status != 401) {
    let data = await resp.json();
    console.debug(data);
    return data['id'];
  }
  if (count >= 4) {
    return;
  }

  else {
    let token = await auth();
    await setLocalStorage({ token: token });
    getAccountID(count + 1);
  }
}

async function getAccountEmail(count) {
  let token = await readLocalStorage('token');
  const options = {
    method: 'GET',
    headers: new Headers({ authorization: `Bearer ${token}` }),
  };
  let url = `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`;

  let resp = await fetch(url, options);
  console.debug('Get Account Email', resp, count);

  if (resp.status != 401) {
    let data = await resp.json();
    console.debug(data);
    return data['email'];
  }
  if (count >= 4) {
    return;
  }

  else {
    let token = await auth();
    setLocalStorage({ token: token });
    getAccountEmail(count + 1);
  }
}

async function getCalID() {
  let account = await getAccountID();
  if (account !== null) {
    let key = `calid${account}`;
    console.debug('Calendar ID', key);
    return await readLocalStorage(key);
  }
}

async function logout() {
  let token = await readLocalStorage('token');
  let logout = await fetch(
    `https://accounts.google.com/o/oauth2/revoke?token=${token}`
  );
  await setLocalStorage({ token: null });
  console.debug('Logout:', logout);
  await chrome.runtime.sendMessage({ auth: false });
}

/*
Grant Permission For Calendar API
*/
async function checkToken() {
  let token = await readLocalStorage('token');
  console.debug('Initial Token', token);
  if (token != null) {
    await chrome.runtime.sendMessage({ auth: true });
  } else {
    await chrome.runtime.sendMessage({ auth: false });
  }
}

/*
print Notification
*/
async function printNotif(notif, title) {
  chrome.notifications.create(
    'null',
    { message: notif, title: title, type: 'basic', iconUrl: icon },
    (id) => {
      console.debug('Created Notification:', id);
    }
  );
}

export {
  setLocalStorage,
  readLocalStorage,
  AuthFetch,
  auth,
  logout,
  checkToken,
  getAccountID,
  getCalID,
  getAccountEmail,
  printNotif,
};
