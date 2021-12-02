import React, { Fragment, useContext, useEffect, useRef, useState } from 'react';
import './content.css';
import { readLocalStorage, getAccountEmail, setLocalStorage, getAccountID, printNotif,getCalID } from "../../../methods/general"

import { Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { Card } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

import CardContent from '@material-ui/core/CardContent';
import { dataContext, } from '../Popup/Popup';
import { apikey } from './apikey';




const SyncPage = () => {
    const data = useContext(dataContext);
    const buttonref = useRef(null);
    const buttonref2 = useRef(null);
    const buttonref3 = useRef(null);
    const target_token = data.target_token
    const auth = data.auth
    const [email, setEmail] = useState("");

    const [calID, setCalID] = useState("");
    const count=useRef(0)


    useEffect(() => {

        chrome.runtime.onMessage.addListener(function (message) {
            console.debug("Popup Message:", message)
            if (message["data"]) {
              setEmail(message["data"]["email"])
              setCalID(message["data"]["calID"])
            }
          });

        buttonref2.current.addEventListener("click", handleLogout)
        buttonref3.current.addEventListener("click", handleUnset)


    }, []);



    useEffect(() => {
        if (target_token) {
            buttonref.current.addEventListener("click", handleSync)

        }

    }, [target_token]);





    useEffect(() => {
        chrome.runtime.sendMessage("getData")


    }, [auth]);

    //beginning of weeks
    function getSundays() {
        let sundays = []
        for (let i = 0; i < 3; i++) {
            var today = new Date();
            var day = today.getDay();
            today.setHours((-24 * day) + (7 * i * 24));
            today = today.toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })
            sundays.push(today)
        }


        return sundays
    }
    //end of weeks
    function getSatdays() {
        let saturdays = []
        for (let i = 0; i < 3; i++) {
            var today = new Date();
            var day = today.getDay();
            let dif = 6 - day
            today.setHours(24 * ((dif) + (7 * i)));
            today = today.toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })
            saturdays.push(today)
        }


        return saturdays
    }


    async function weeks() {
        let sundays = getSundays()
        let saturdays = getSatdays()
        console.log("This is saturday",saturdays)
        console.log("This is sunday",sundays)

        let temp = await calandarSync()
        let memberdata = []


        for (let i = 0; i < 3; i++) {
            let sunday = sundays[i]
            let saturday = saturdays[i]
            let result = await temp(sunday, saturday)
            console.log("this is stemp",i,result)
            if (result == false) {
                continue
            }
            memberdata.push(result)
        }
        if (memberdata.length > 0) {
            chrome.runtime.sendMessage({ "sync": memberdata });
        }


    }

    function calandarSync() {
        return async function workhours(sunday, saturday) {
            if(count.current>0){
                return
            }
            let team_member_number = await readLocalStorage("team") || ""
            let location_id = await readLocalStorage("store") || ""
            let api = apikey["key"]
            if (team_member_number.lenth == 0 || location_id.length == 0) {
                count.current=count.current+1
                alert("You must Enter your Team Member Number and Location ID into Options")
                return
            }


            let url = `https://api.target.com/wfm_schedules/v1/weekly_schedules?team_member_number=00${team_member_number}&start_date=${sunday}&end_date=${saturday}&location_id=${location_id}&key=${api}`
            console.debug("Target API URL:",url)
            const options = {
                method: 'GET',
                headers: new Headers({ 'authorization': `${target_token}` }),
            }
            let wkdata = await fetch(url, options)
            wkdata = await wkdata.json()
            if (!wkdata["team_member_number"]) {
                count.current=count.current+1
                alert(" There was an error during Sync\n ErrorText:" + wkdata["message"])
                return false
            }
            wkdata = JSON.stringify(wkdata)
            return wkdata

        }

    }






    function handleSync(event) {
        count.current=0
        event.preventDefault()
        // weeks()
        chrome.runtime.sendMessage({"startSync":target_token});

    }

    function handleLogout(event) {
        chrome.runtime.sendMessage("logout");
        setEmail("")
    }



    async function handleUnset(event) {
        let account = await getAccountID(0)
        let key = `calid${account}`
        console.debug(key)
        await setLocalStorage({ [key]: null })
        await readLocalStorage(key)
        printNotif("Target Calendar Unset\n Delete Old Target Calendar if Not Done Previously", "Target Calendar Deleted")

    }




    return (
        <Fragment>
            <Grid container justifyContent="center" alignItems="center" style={{ "height": "100%" }}>
                <Grid item style={{ "width": "100%" }}>
                    <Card>
                        <CardContent>
                            Sync to Google Calendar
                            {!target_token && <h4>You must be on mytime.target.com to Sync</h4>}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item style={{ "width": "95%" }}>
                    <Typography align="left" style={{ "color": "white", "fontSize": "15px","width":"100%","wordWrap": "break-word","marginBottom":"3.5%"  }}>
                        G-Account:{email}
                    </Typography>
                    <Typography  align="left" style={{ "color": "white", "fontSize": "14px","width":"100%","wordWrap": "break-word" }} paragraph={true}>
                        Cal-ID:{calID}
                    </Typography>


                </Grid>
                <Grid item style={{ "width": "100%" }}>
                    {target_token && <Button variant="contained" color="primary" ref={buttonref}>Sync</Button>}
                    <Button variant="contained" color="primary" ref={buttonref3}>Unset T-Cal</Button>
                    <Button variant="contained" color="primary" ref={buttonref2}>Logout</Button>


                </Grid>

            </Grid>


        </Fragment>

    )


};



export default SyncPage;
