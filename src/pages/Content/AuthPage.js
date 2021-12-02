import React, { Fragment, useContext, useEffect, useRef } from 'react';
import './content.css';
import { Button } from '@material-ui/core';

import Grid from '@material-ui/core/Grid';
import { Card } from '@material-ui/core';
import CardContent from '@material-ui/core/CardContent';
import { dataContext } from '../Popup/Popup';

const AuthPage = () => {
  const buttonref = useRef(null);
  const data = useContext(dataContext);
  let auth = data.auth;

  useEffect(() => {
    buttonref.current.addEventListener('click', handleAuth);
  }, []);
  function handleAuth(event) {
    event.preventDefault();
    chrome.runtime.sendMessage('auth');
  }

  return (
    <Fragment>
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        style={{ height: '100%' }}
      >
        <Card>
          <CardContent>
            Authentication Needed to Sync to Google Calendar
            <br></br>
          </CardContent>
        </Card>
        <Button variant="contained" color="primary" ref={buttonref}>
          Authenticate
        </Button>
      </Grid>
    </Fragment>
  );
};

export default AuthPage;
