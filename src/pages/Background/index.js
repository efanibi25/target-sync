import * as methods from '../../../methods/general.js';
import { upDateCal } from '../../../methods/cal.js';
import { weeks } from '../../../methods/target.js';

/*
Message Listeners
*/
chrome.runtime.onMessage.addListener(function (message) {
  console.debug('Background Message:', message);
  if (message == 'auth') {
    (async () => {
      const auth = await methods.auth();
      if (auth) {
        chrome.runtime.sendMessage({ auth: true });
      }
    })();
  } else if (message == 'check_auth') {
    methods.checkToken();
  } else if (message == 'logout') {
    methods.logout();
  } else if (message == 'getData') {
    (async () => {
      const calID = await methods.getCalID(0);
      const email = await methods.getAccountEmail(0);
      console.log('this works');
      chrome.runtime.sendMessage({ data: { email: email, calID: calID } });
    })();
  } else if (message['startSync']) {
    (async () => {
      const target_token = message['startSync'];
      let memberdata = await weeks(target_token);
      if (memberdata) {
        upDateCal(memberdata);
      }
    })();
  }
});
