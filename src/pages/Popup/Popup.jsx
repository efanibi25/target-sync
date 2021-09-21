import React,{Fragment,useState,useEffect} from 'react';
import './Popup.css';
import AuthPage from '../Content/AuthPage';
import SyncPage from '../Content/SyncPage';
const dataContext = React.createContext();

const Popup = () => {
  const [auth, setAuth] = useState(null);
  const [tab, setTab] = useState(null);  
  const [target_token, setTargetToken] = useState(null);  
  let shared={auth,setAuth,target_token}

  //Create Listeners 
  chrome.runtime.onMessage.addListener(function (message) {
    if(message.auth){   
        setAuth(true)
    }
    else if(message.auth==false){
      setAuth(true)
    }
   });
  
  function setTarget(){
    return localStorage["access_token"]
  }


 /* Check Auth for Google Calendar
 * Check if Current Tab is Target
 */
  useEffect(() => {
    chrome.runtime.sendMessage("check_auth"); 
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var activeTab = tabs[0];
      if(new URL(activeTab.url).host=="mytime.target.com"){
        setTab(activeTab.id)
      }
    }
     )
  
  }, []);

  
  useEffect(() => {
     if(tab){
      chrome.scripting.executeScript(
        {
          target: {tabId: tab},
          func:  setTarget,
        },(result) => {
         setTargetToken(result[0].result)
          
        }); 
     }
    
  }, [tab]);

 

  return (
    <Fragment>
      
    <div className="App">
    <dataContext.Provider value={shared}>
   {auth==false && <AuthPage/>}
    {auth && <SyncPage/>} 
    </dataContext.Provider>
    </div>
  
    </Fragment>
 
  );
};

export default Popup;
export {dataContext}
