import React,{Fragment,useEffect,useState} from 'react';
import TextField from '@material-ui/core/TextField';


import {setLocalStorage,readLocalStorage} from "../../../methods/general"

import "./Options.css"
import { apikey } from '../Content/apikey';

 function Options() {


  const [team, setTeam] = useState(null);  
  const [store, setStore] = useState(null);  
  const [ready, setReady] = useState(false);  
  let api=apikey["key"]
 

//load values
  useEffect(() => {
    initValues()  
 }, []);
//render textfields once all values loaded
 useEffect(() => {
  if(team!=null&&store!=null&&api!=null){
    setReady(true)
  }
}, [team,store,api]);

 async function initValues(){
   let team= await readLocalStorage("team") || ""
   setTeam(team)
   let store= await readLocalStorage("store") || ""
   setStore(store)
 }

  function onChangeTeam(event){
    setLocalStorage({"team":event.target.value})

  }
  function onChangeStore(event){
    setLocalStorage({"store":event.target.value})

    
  }


if(ready){
  return(
    <Fragment>
<form  noValidate autoComplete="off">

<TextField  id="team_member" label="team number" variant="outlined" onChange={onChangeTeam} defaultValue={team}  />
<br></br>
<TextField  id="store_number" label="store number" variant="outlined" onChange={onChangeStore} defaultValue={store}    />
<br></br>
<TextField  id="api" label="API" variant="outlined" value={api} inputProps={{readOnly:true}} />
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
export {apikey}