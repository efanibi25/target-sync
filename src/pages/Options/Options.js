import React, { Fragment, useEffect, useState, useRef } from 'react';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';

import InfoIcon from '@material-ui/icons/Info';
import IconButton from '@material-ui/core/IconButton';
import WarningIcon from '@material-ui/icons/Warning';

import { setLocalStorage, readLocalStorage, getAccountID, getCalID, v } from '../../../methods/general';

import './Options.css';
import { apikey } from '../Content/apikey';

function Options() {
  const [team, setTeam] = useState(null);
  const [store, setStore] = useState(null);
  const [ready, setReady] = useState(false);
  const [calID, setCalID] = useState(false);
  const [auth, setAuth] = useState(null);

  let api = apikey['key'];
  const calKey = useRef()
  const text =
    <Fragment>
      <p>{"To Find Calendar ID"}</p>
      <p>{"Go to calendar.google.com"}</p>
      <p>{"My Calendars on the SideBar"}</p>
      <p>{"Three Dots on Desired Calendar"}</p>
      <p>{"Settings and Sharing and then CTRL-F Integrate Calendar"}</p>
      <p>{"Copy the Calendar ID"}</p>
      <p>{"Syncing will Delete All Events Not on your work Schedule.A Secondary Calendar is Highly Recommended"}</p>
      <p>{"Note: Because of Permission Issues only Calendars made by the extension will Work"}</p>
      <p>{"Other Calendars Made by Other programs, Sharing, or By You will not work at the moment"}</p>






    </Fragment>






  chrome.runtime.onMessage.addListener(function (message) {
    console.debug("Options", message)
    if (message["auth"] === true) {
      setAuth(true)
    }
    else if (message["auth"] === false) {
      setAuth(false)
    }
    else if (message["calNameUpdated"]) {
      window.location.reload()

    }
  });


  //load values
  useEffect(() => {
    initValues();
    chrome.runtime.sendMessage("check_auth");


  }, []);


  useEffect(() => {
    async function setKey() {
      let id = await getAccountID(4)
      calKey.current = `calid${id}`
    }

    async function setID() {
      let id = await getCalID(4)
      setCalID(id)
    }
    if (auth === true) {
      setKey()
      setID()

    }
    if (auth === false) {

      calKey.current = null
      setCalID('')
    }


  }, [auth]);





  //render textfields once all values loaded
  useEffect(() => {
    if (team !== null && store !== null && api !== null && calID !== false) {
      setReady(true);
    }
  }, [team, store, api, calID])










  async function initValues() {
    let team = (await readLocalStorage('team')) || '';
    setTeam(team);
    let store = (await readLocalStorage('store')) || '';
    setStore(store);
  }



  function onChangeTeam(event) {
    setLocalStorage({ team: event.target.value });
  }
  function onChangeStore(event) {
    setLocalStorage({ store: event.target.value });
  }

  function onChangeCalID(event) {

    if (calKey.current != null) {
      setLocalStorage({ [calKey.current]: event.target.value });
    }

  }
  if (ready) {
    return (
      <Fragment>
        <form noValidate autoComplete="off">
          <TextField
            style={{ "marginBottom": "15px" }}
            id="api"
            label="API"
            variant="outlined"
            value={api}
            inputProps={{ readOnly: true }}
          />
          <TextField
            style={{ "marginBottom": "15px" }}
            id="team_member"
            label="team number"
            variant="outlined"
            onChange={onChangeTeam}
            defaultValue={team}
          />
          <br></br>
          <TextField
            style={{ "marginBottom": "15px" }}

            id="store_number"
            label="store number"
            variant="outlined"
            onChange={onChangeStore}
            defaultValue={store}
          />

          {auth === true ?
            <Fragment>

              <Grid container>
                <Grid item>
                  <IconButton aria-label="info">
                    <WarningIcon style={{ color: "red" }} />
                  </IconButton>
                </Grid>
                <Grid item>
                  <p> Warning Enter A Target Specific Calendar</p>
                </Grid>
              </Grid>

              <Grid container>
                <Grid item>
                  <TextField
                    style={{ "marginBottom": "15px" }}
                    id="calKey"
                    label="Calendar ID"
                    variant="outlined"
                    defaultValue={calID}
                    onChange={onChangeCalID}
                  />
                </Grid>
                <Tooltip title={text}>
                  <IconButton aria-label="info">
                    <InfoIcon />
                  </IconButton>

                </Tooltip>
              </Grid>








            </Fragment>
            :
            <Fragment>



              <p> Sign in To Enter Calendar ID</p>
              <TextField
                style={{ "marginBottom": "15px" }}
                disabled
                id="calKey"
                label="Calendar ID"
                variant="outlined"
              />
            </Fragment>

          }



        </form>


      </Fragment>

    );
  }

  if (!ready) {
    return <Fragment></Fragment>;
  }
}

export default Options;
export { apikey };
