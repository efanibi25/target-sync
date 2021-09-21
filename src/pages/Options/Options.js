import React,{Fragment,useEffect,useState} from 'react';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import { Button } from '@material-ui/core';

import {setLocalStorage,readLocalStorage} from "../../../methods/methods"

import "./Options.css"

 function Options() {


  const [team, setTeam] = useState(null);  
  const [store, setStore] = useState(null);  
  const [api, setAPI] = useState(null);  
  const [ready, setReady] = useState(false);  

//load values
  useEffect(() => {
    initValues()  
 }, []);
//render textfields once all values loaded
 useEffect(() => {
   console.log("team:",team!=null,"store:",store!=null,"api",api!=null,"check values for textfields")
  if(team!=null&&store!=null&&api!=null){
    setReady(true)
  }
}, [team,store,api]);

 async function initValues(){
   let team= await readLocalStorage("team") || ""
   setTeam(team)
   let store= await readLocalStorage("store") || ""
   setStore(store)
   let api= await readLocalStorage("api") || ""
   setAPI(api)
 
 }

  function onChangeTeam(event){
    setLocalStorage({"team":event.target.value})

  }
  function onChangeStore(event){
    setLocalStorage({"store":event.target.value})

    
  }
  function onChangeAPI(event){
    setLocalStorage({"api":event.target.value})
  }

if(ready){
  return(
    <Fragment>
<form  noValidate autoComplete="off">

<TextField  id="team_member" label="team number" variant="outlined" onChange={onChangeTeam} defaultValue={team}  />
<br></br>
<TextField  id="store_number" label="store number" variant="outlined" onChange={onChangeStore} defaultValue={store}    />
<br></br>
<TextField  id="api" label="API" variant="outlined" onChange={onChangeAPI} defaultValue={api} />
<br></br>


</form>
  
    </Fragment>
  )

}

if(!ready){
  return(
    <Fragment>
    </Fragment>
  )

}

       
    
}





export default Options;
