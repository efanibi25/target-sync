import React,{Fragment,useContext,useEffect,useRef} from 'react';
import './content.css';
import {setLocalStorage,readLocalStorage} from "../../../methods/methods"


import { Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { Card } from '@material-ui/core';
import CardContent from '@material-ui/core/CardContent';
import { dataContext } from '../Popup/Popup';


const SyncPage = () => {
const data = useContext(dataContext);
const buttonref = useRef(null);
let target_token=data.target_token

const buttonref2 = useRef(null);
useEffect(() => {
    if(target_token){
        buttonref.current.addEventListener("click",handleClick)
    }
       
 }, [target_token]);
 //beginning of weeks
 function getSundays(){
    let sundays=[] 
    for (let i=0;i<3;i++){
    var today = new Date();
    var day = today.getDay() ; 
    today.setHours((-24 *day)+(7*i*24)); 
    today=today.toLocaleString('en-CA', {year: 'numeric', month: '2-digit', day: '2-digit'}) 
    sundays.push(today)
    }
  
  
    return sundays                           
 }
 //end of weeks
 function getSatdays(){
    let saturdays=[]
    for (let i=0;i<3;i++){
    var today = new Date();
    var day = today.getDay() ; 
    let dif=6-day
    today.setHours(24 * ((dif)+(7*i))); 
    today=today.toLocaleString('en-CA', {year: 'numeric', month: '2-digit', day: '2-digit'}) 
    saturdays.push(today)
    }
  
  
    return  saturdays                              
 }


async function  weeks(){
    let sundays=getSundays()
    let saturdays=getSatdays()
    let temp =calandarsync()
    let memberdata=[]


    for (let i=0;i<3;i++){
    let sunday=sundays[i]
    let saturday=saturdays[i]
    let result=await temp(sunday,saturday)
    if(result==false){
        break
    }
    memberdata.push(result)
    }
    if(memberdata.length>0){
        chrome.runtime.sendMessage({"sync":memberdata}); 
    }
    

}

function calandarsync(){
    return async function workhours(sunday,saturday){
        let team_member_number=await readLocalStorage("team") || ""
        let location_id=await readLocalStorage("store") || ""
        let api= await readLocalStorage("api") || ""
        
        let  url=`https://api.target.com/wfm_schedules/v1/weekly_schedules?team_member_number=00${team_member_number}&start_date=${sunday}&end_date=${saturday}&location_id=${location_id}&key=${api}`
        
        const options = {
                method: 'GET',
                headers: new Headers({'authorization': `${target_token}`}),
            }
            let wkdata=await fetch(url, options)
            wkdata=await wkdata.json()
            if (!wkdata["team_member_number"]) {
                alert(" There was an error during Sync\n ErrorText:"+ wkdata["message"])
               return false
              }
            wkdata=JSON.stringify(wkdata)
            return wkdata
               
            }
           
    }
  





 function handleClick(event){
    event.preventDefault()
    weeks()
}






    return(
        <Fragment>
<Grid container justifyContent="center" alignItems="center" style={{"height":"100%"}}>
<Grid item style={{"width":"100%"}}>
<Card>
<CardContent>
Sync to Google Calendar
{!target_token &&<h4>You must be on mytime.target.com</h4>}
</CardContent>
</Card>   
</Grid>
<Grid item style={{"width":"100%"}}>
{target_token &&<Button variant="contained" color="primary" ref={buttonref}>Sync</Button>}

</Grid>

</Grid>

      
        </Fragment>
       
    )


};



export default SyncPage;
