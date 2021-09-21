import secrets from 'secrets';

/*
Chrome local storage command, but with promises
*/
const readLocalStorage = async (key) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], function (result) {
        console.log("Reading from storage",result)
        if
         (result[key] === undefined) {
          resolve(null);
        } else if(result[key]!=undefined) {
          resolve(result[key]);
        }
        else{
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
      console.log("Setting Storage",obj)
        resolve(obj)
      });
    });
  };


 /*
 Checks if authenticated if not, allows user to login.
 */
  const AuthFetch= async(url,options)=>{
   let resp=await fetch(url,options)
   if(resp.status!=401){
     return resp
   }
   if(await auth()){
    let resp=await fetch(url,options)
    return resp
   }
  

 }


function auth(obj) {
  return new Promise((resolve, reject) => {
    let authURL = "https://accounts.google.com/o/oauth2/auth";
    const redirectURL = chrome.identity.getRedirectURL();
    const scopes = ["https://www.googleapis.com/auth/calendar"];
    authURL += `?client_id=${secrets.clientid}`;
    authURL += `&response_type=token`;
    authURL += `&redirect_uri=${encodeURIComponent(redirectURL)}`;
    authURL += `&scope=${encodeURIComponent(scopes.join(' '))}`;
    chrome.identity.launchWebAuthFlow({ "interactive": true, "url": authURL }, function (token) {
      var path = new URL(token)
      let hash = path.hash
      hash = hash.split("&")[0].split("=")[1]
      setLocalStorage({ "token": hash })
      chrome.runtime.sendMessage({ "auth": true });
      return true
    })
  });
};

export {setLocalStorage,readLocalStorage,AuthFetch,auth}