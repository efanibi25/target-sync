import React, {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import './content.css';
import {
  readLocalStorage,
  setLocalStorage,
  getAccountID,
  printNotif,
} from '../../../methods/general';

import { Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { Card } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

import CardContent from '@material-ui/core/CardContent';
import { dataContext } from '../Popup/Popup';



const SyncPage = () => {
  const data = useContext(dataContext);
  const buttonref = useRef(null);
  const buttonref2 = useRef(null);
  const target_token = data.target_token;
  const auth = data.auth;
  const [email, setEmail] = useState('');

  const [calID, setCalID] = useState('');
  const countRef = useRef(0);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(function (message) {
      console.debug('Popup Message:', message);
      if (message['data']) {
        setEmail(message['data']['email']);
        setCalID(message['data']['calID']);
      }
    });

    buttonref2.current.addEventListener('click', handleLogout);




    chrome.runtime.onMessage.addListener(function (message) {
      console.debug('Sync Message:', message);

    

      if (message["alert"]&& countRef.current===0) {
        countRef.current=countRef.current+1
        alert(message["alert"]);

      }

      else if (message["calNameUpdated"]) {
        setCalID(message["calNameUpdated"])
      }

      
    });
  }, []);

  useEffect(() => {
    if (target_token) {
      buttonref.current.addEventListener('click', handleSync);
    }
  }, [target_token]);

  useEffect(() => {
    chrome.runtime.sendMessage('getData');
  }, [auth]);

  function handleSync(event) {
    countRef.current = 0;
    event.preventDefault();
    // weeks()
    chrome.runtime.sendMessage({ startSync: target_token });
  }

  function handleLogout(event) {
    chrome.runtime.sendMessage('logout');
    setEmail('');
  }



  return (
    <Fragment>
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        style={{ height: '100%' }}
      >
        <Grid item style={{ width: '100%' }}>
          <Card>
            <CardContent>
              Sync to Google Calendar
              {!target_token && (
                <h4>You must be on mytime.target.com to Sync</h4>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item style={{ width: '95%' }}>
          <Typography
            align="left"
            style={{
              color: 'white',
              fontSize: '15px',
              width: '100%',
              wordWrap: 'break-word',
              marginBottom: '3.5%',
            }}
          >
            G-Account:{email}
          </Typography>
          <Typography
            align="left"
            style={{
              color: 'white',
              fontSize: '14px',
              width: '100%',
              wordWrap: 'break-word',
            }}
            paragraph={true}
          >
            Cal-ID:{calID}
          </Typography>
        </Grid>
        <Grid item style={{ width: '100%' }}>
          {target_token && (
            <Button variant="contained" color="primary" ref={buttonref}>
              Sync
            </Button>
          )}
          <Button variant="contained" color="primary" ref={buttonref2}>
            Logout
          </Button>
        </Grid>
      </Grid>
    </Fragment>
  );
};

export default SyncPage;
