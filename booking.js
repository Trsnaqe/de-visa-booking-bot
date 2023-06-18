
const axios = require('axios');
const dswh = require('./windowhandler');

async function GetBooking() {
  try {
    const requestToken = dswh.utils.generateNewRequestToken();
    const windowId = dswh.utils.generateNewWindowId();
    console.log('New request token:', requestToken);
    console.log("new window id is:", windowId);
    // Task 2: Send request and set cookies
    const task2Response = await axios.get('https://otv.verwalt-berlin.de/ams/TerminBuchen/wizardng?sprachauswahl=de', {
      headers: {
        Cookie: ` dsrwid-${requestToken}=${windowId}; HttpOnly; Secure;`
      }
    });
    console.log('Request sent and cookies set successfully.');
  
    // Task 3: Send request with parameters and cookies
    const params = new URLSearchParams();
    params.append('dswid', windowId);
    params.append('dsrid', requestToken);
    params.append('sprachauswahl', 'de');
  
    const task3Response = await axios.get(`https://otv.verwalt-berlin.de/ams/TerminBuchen/wizardng?${params.toString()}`, {
      headers: {
        Cookie: `dsrwid-${requestToken}=${windowId}; Path=/; Secure; HttpOnly;`
      }
    });
  
    // Extract and save the value of ANTON.CORE.processId
    const regex = /ANTON\.CORE\.processId = "(.*?)";/;
    const match = regex.exec(task3Response.data);
    if (match) {
      const processId = match[1];
      console.log('ANTON.CORE.processId:', processId);
      // Task 5: Send request to the final URL
      const task4Response = await axios.get("https://otv.verwalt-berlin.de/plugin?name=ValidationServlet&processid=$"+processId+"&status=datezms&clusterId=20&anzahlterminslots=1&standortId=3200");
        if(task4Response.data.length==0){
          console.log("no appointments available")
          return null;
        }
        else {
          console.log("appointments available")
          return task4Response.data;
        }
    }
  } catch (error) {
    console.log("error happened")
  }
}

module.exports = GetBooking