import { html, css, LitElement } from 'lit';
import '@lrnwebcomponents/rpg-character/rpg-character.js';

export class WhosHere extends LitElement {
  static get tag() {
    return 'whos-here';
  }

  static get properties() {
    return {

      title: { type: String },

      ring_color: { type: String },

      userName: { type: String },

      userObj: { type: Object },

      users: { type: Array },

      timestamp: { type: String},

      customHash: { type: String, reflect: true },
      //db test stuff below
      authEndpoint: { type: String },
      auth: { type: Array },
      newUserEndpoint: { type: String },
      newTimestampEndpoint: { type: String },
      deleteUserEndpoint: { type: String },

      // usersArray: { type: Array, reflect: true },

    };
  }

  constructor() {
    super();
    this.title = 'Hey there';

    this.lastAccessed = new Date();
    this.timestamp = 0;

    //later make random usernames
    this.userName = 'xiaojie'
    this.userObj = {username: `${this.userName}`, lastTime: `${this.timestamp}`};
   
    //Later, we will get users from database to fill array.
    this.users = [];

    this.users.push(this.userObj);

    this.userObj2 = {username: 'xxx', lastTime: `5`};
    this.userObj3 = {username:'sss', lastTime: `5`};
    this.users.push(this.userObj2);
    this.users.push(this.userObj3);

    //db test stuff below
    this.auth = {};
    this.authEndpoint = '/api/auth';
    this.newUserEndpoint = '/api/addUser';
    this.newTimestampEndpoint = '/api/changeTimestamp';
    this.getLastAccessed = '/api/lastAccessed';
    this.deleteUserEndpoint = '/api/deleteUser';

    // this.customHash = ;

    this.activiteTime();
    this.seed = null;
    this.birthday = null; //birthday timestamp
  }

  //Hashes username (+ IP address?) into a color for ring color
  //https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
  hashCode(str) { 
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var c = (hash & 0x00FFFFFF)
    .toString(16)
    .toUpperCase();

  return "00000".substring(0, 6 - c.length) + c;
  } 

  seedEncode(str1, str2) {
    let ip = str1;
    let birthday = str2.substring(14,19);
    let lasttwo = str1.substring(10,12) + str2.substring(17,19);
    let seed = BigInt(1);

    for (let i=0; i< ip.length; i++) {
      //console.log(basicip.charCodeAt(i));
      for (let j=0; j< birthday.length; j++) {
        if (i<64) {
          seed = BigInt(seed) * BigInt(ip.charCodeAt(i));
        }
        if (j<34) {
          seed = BigInt(seed) + BigInt(birthday.charCodeAt(j));
        }
      }
      seed = BigInt(seed)-BigInt(lasttwo);

    }
    seed = BigInt(seed).toString();
    return seed.substring(str1.substring(11,12),32);
  }

  update(changedProperties) {
    console.log(changedProperties)
    //console.log(this.timestamp)
    //this.seedEncode();
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'userName' && this[propName]) {
        console.log("assignNew")
        Object.assign(this.userObj, { username: this.userName});
        super.update(changedProperties);
        
      } else if(propName === 'timestamp' && this[propName]){
        
        Object.assign(this.userObj, { lastTime: this.timestamp});
        super.update(changedProperties);

        this.activiteTime();
        

      }

      if (propName === 'customHash' && this[propName]) {
        console.log('customhash prop changed');
        let displayUsers = document.querySelector('#display_users');
        //get all db data
        // const auth = await fetch(`${this.authEndpoint}`).then(res => res.json());
        // let result1 = auth;
        // result1.forEach(node => {
        //   console.log(`ID: ${node.id} Last Accessed: ${node.last_accessed} Custom Hash: ${node.custom_hash}`);
        // });

        let newUser = "";
        this.getAllData();

        // this.getAllData().forEach(node => {
        //   newUser = `<div class="base">
        //   <div class = "ring-color" style = "border-color: red;"></div>
        //   <rpg-character class = "rpg" seed = ${node.customHash}></rpg-character>
  
        //   <span class = "tooltip"> ${node.customHash}, Last Accessed: ${node.last_accessed}
            
  
        //   </span>
        //   <img src = "/images/white-background.svg" class = "backing">       
        
        // </div>`
        // });

        this.addNewUser();
        

        //run function to add new user
        
      }
    });
  }

  async firstUpdated(changedProperties) {
    if (super.firstUpdated) {
      super.firstUpdated(changedProperties);
    }
    //add ip
    let currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    if (this.birthday === null) {
      this.birthday = currentTime;
      console.log(this.birthday);
    }
    if (this.seed === null) {
      this.seed = this.seedEncode("192.168.2.65", this.birthday);
      console.log(this.seed);
    }
    const request = await fetch(`${this.newUserEndpoint}?last_accessed=${currentTime}&custom_hash=${this.seed}`).then(res => res.json());
    let result2 = request;
    console.log(`Added new user. ID: ${result2.id} Last Accessed: ${result2.last_accessed} Custom Hash: ${result2.custom_hash}`);

  }

  async getAllData() {
    const auth = await fetch(`${this.authEndpoint}`).then(res => res.json());
    let result1 = auth;
    result1.forEach(node => {
      console.log(`ID: ${node.id} Last Accessed: ${node.last_accessed} Custom Hash: ${node.custom_hash}`);
    });

    return result1;
  }

  //test function for the add new user endpoint with db
  async addNewUser() {
    let currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const request = await fetch(`${this.newUserEndpoint}?last_accessed=${currentTime}&custom_hash=${this.seed}`).then(res => res.json());
    let result2 = request;
    console.log(`Added new user. ID: ${result2.id} Last Accessed: ${result2.last_accessed} Custom Hash: ${result2.custom_hash}`);
  }

  async getLastAccessedTime() {
    const time = await fetch(`${this.getLastAccessed}?custom_hash=${this.customHash}`).then(res => res.json());
    let result = time;
    console.log(result)
  }

  async deleteUser() {

    let testHash = "hello";

    let deleted_hash;

    const auth = await fetch(`${this.authEndpoint}`).then(res => res.json());
    let result1 = auth;
    result1.forEach(node => {
        if(testHash === node.custom_hash){
            deleted_hash = node.custom_hash;
            console.log(`got all data... deleted hash: ${deleted_hash}`);
        }
        //console.log(`ID: ${node.id} Last Accessed: ${node.last_accessed} Custom Hash: ${node.custom_hash}`);
    });

    const testRequest = await fetch(`${this.deleteUserEndpoint}?custom_hash=${deleted_hash}`).then(res => res.json());
    // {
    //   method: 'DELETE',
    // }
    
    // .then(res => console.log(res))

    let result3 = testRequest;
    console.log(result3);
  }

  activiteTime() {

      //Keep scope in setTimeout: https://snippets.aktagon.com/snippets/396-how-to-keep-the-scope-when-calling-settimeout-setinterval-in-javascript
      var self = this;

      // Status will be true once mouse movement is detected
      this.status = false;

      // Will check for mouse mouvement within the 5 minutes (test: 5 sec)
      setTimeout(function() { self.updateStat() }, 5 * 1000)

      // Immediately deletes mouse event listener when mouse movement is detected
      window.addEventListener("mousemove", active)

      function active() {

          self.status = true;
          window.removeEventListener("mousemove", active)

      }
        
    }
      

  updateStat(){

    if(this.status){

      // LastAccessed time will be updated to database as well
      this.lastAccessed = new Date;

      // Starting over timestamp cannot equal 0 or else update won't work
      this.timestamp = 5;

      console.log("Active, start over timestamp:  " + this.timestamp)

      // If status is false, timestamp is still less than 30 minutes (test: 20 sec)
    } else if(this.timestamp < 20 * 1000){

      // Get lastAccessed from database, update new timestamp, and update is triggered
      this.timestamp = new Date() - this.lastAccessed;
      console.log("Not active, timestamp:  " + this.timestamp)

    }
    else {

      console.log("deleted from database")

    }

}
    

// run the function


  // async authTest() {
  //   const auth = await fetch(`${this.authEndpoint}`).then(res => res.json());
  //   this.auth = auth;
  //   console.log(this.auth);
    
  // }

  // test function for the add new user endpoint with db
  // async testAddNewUser() {
  //   let currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  //   let customHash = 'anonymous animal';

  //   const testRequest = await fetch(`${this.newUserEndpoint}?last_accessed=${currentTime}&custom_hash=${customHash}`).then(res => res.json());
  //   this.testRequest = testRequest;
  //   console.log(this.testRequest);
  // }


  // test function for the new timestamp endpoint with db
  async testNewTimestampEndpoint() {
    let userID = 0;
    let oldTimestamp = '';

    const getTimestamp = await fetch(`${this.authEndpoint}`).then(res => res.json());

    let newTimestamp = Date.now();

    const testRequest = await fetch(`${this.newTimestampEndpoint}?oldTimestamp=${oldTimestamp}?newTimestamp=${newTimestamp}`).then(res => res.json());
    this.testRequest = testRequest;
    console.log(this.testRequest);
  }



  newUserName (){
    this.userName = this.shadowRoot.querySelector("#inputUsername").value;
    console.log("newUserName")
  }

  refresh() {

    let allUsers = this.getAllData();
    let usersArea = document.querySelector('#display_users');

    allUsers.forEach(user => {
      usersArea.innerHTML += `<div class="base">
         <div class = "ring-color" style = "border-color: red;"></div>
         <rpg-character class = "rpg" seed = ${user.customHash}></rpg-character>

         <span class = "tooltip"> ${user.customHash}, Last Accessed: ${user.last_accessed}
          

         </span>
         <img src = "/images/white-background.svg" class = "backing">       
      
       </div>`
    });
  }

  static styles = css`
       .base {
        float: left;
        height: 142px;
        width: 113px;
        position: relative;
      }
       .base .ring-color {
        position: absolute;
        border-radius: 100%;
        height: 83px;
        width: 83px;
        left: 10px;
        top: 0%;
        z-index: 2;
        border: 5px solid;
      }
       .base .backing {
        z-index: 1;
      }
       .base .rpg {
        position: absolute;
        z-index: -1;
      }
       .base .tooltip {
        visibility: hidden;
        width: 100px;
        background-color: gray;
        color: white;
        text-align: center;
        border-radius: 6px;
        padding: 5px;

        position: absolute;
        z-index: 3;
        top: 70%;
        margin-left: -2%;
      }

       .base .tooltip::after {
        content: '';
        position: absolute;
        bottom: 100%; /* At the bottom of the tooltip */
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: transparent transparent gray transparent;
      }

       .base:hover .tooltip {
        visibility: visible;
      }
    `;
  
  render() {

    return html`
      ${this.users.map(
      
      // can only edit their own usernames
      user => this.userName == user.username ? html`

      <div class="base">
        <div class = "ring-color" style = "border-color: #${this.hashCode(user.username)};"></div>
        <rpg-character class = "rpg" seed = ${user.username}></rpg-character>

        <span class = "tooltip">
          
          <input id="inputUsername" type = "text" size = "8" value = '${user.username}'>
          <button class="changeButton" @click=${this.newUserName}>change</button><br>
          Last Accessed: ${user.lastTime}

        </span>
        <img src = "/images/white-background.svg" class = "backing">       
      
      </div>

      ` : html`

      <script type="text/javascript"> console.log('n') </script>
      <div class="base">
        <div class = "ring-color" style = "border-color: red;"></div>
        <rpg-character class = "rpg" seed = ${this.seed}></rpg-character>

        <span class = "tooltip"> ${user.username}, Last Accessed: ${user.lastTime}
          

        </span>
        <img src = "/images/white-background.svg" class = "backing">       
      
      </div>
      
      `
      )}

      <div id="display_users"></div>

      <div class="testDBBtns">
      <button class="refreshBtn" @click=${this.refresh}>refresh</button>
      <button class="dbtestBtn" @click=${this.deleteUser}>delete user</button>
        <button class="dbtestBtn" @click=${this.getAllData}>Auth Test</button>
        <button class="dbtestBtn" @click=${this.addNewUser}>Post new user</button>
        <!--<button class="dbtestBtn" @click=${this.testNewTimestampEndpoint}>Change Timestamp</button>-->
      </div>
    `;
  }
}

window.customElements.define(WhosHere.tag, WhosHere);
