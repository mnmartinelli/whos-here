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

    };
  }

  constructor() {
    super();
    this.title = 'Hey there';

    this.lastAccessed = new Date();
    this.timestamp = 0;

    //custom hash = username
    this.customHash = 'hello'
    this.userObj = {username: `${this.customHash}`, lastTime: this.timestamp/60000};
   
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
    this.updateUsername = '/api/changeUsername';
    this.updateLastAccessed = '/api/lastAccessed';
    this.deleteUserEndpoint = '/api/deleteUser';


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
      if (propName === 'customHash' && this[propName]) {
        this.getAllData();
        super.update(changedProperties);
        
      } else if(propName === 'timestamp' && this[propName]){
        
        Object.assign(this.userObj, { lastTime: this.timestamp/60000});
        super.update(changedProperties);

        //This will get newest version of timestamps 
        this.getAllData();

        //Initates timer again
        this.activiteTime();
        

      }

      // if (propName === 'customHash' && this[propName]) {
      //   console.log('customhash prop changed');

      //   //get all db data
      //   // const auth = await fetch(`${this.authEndpoint}`).then(res => res.json());
      //   // let result1 = auth;
      //   // result1.forEach(node => {
      //   //   console.log(`ID: ${node.id} Last Accessed: ${node.last_accessed} Custom Hash: ${node.custom_hash}`);
      //   // });
      //   this.getAllData();
      //   this.addNewUser();
        

      //   //run function to add new user
        
      // }
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
    const request = await fetch(`${this.newUserEndpoint}?last_accessed=${currentTime}&custom_hash=${this.customHash}`).then(res => res.json());
    let result2 = request;
    console.log(`Added new user. ID: ${result2.id} Last Accessed: ${result2.last_accessed} Custom Hash: ${result2.custom_hash}`);

  }

  async getAllData() {

    //Reset users data
    this.users = [];

    const auth = await fetch(`${this.authEndpoint}`).then(res => res.json());
    let result1 = auth;
    result1.forEach(node => {
      console.log(`ID: ${node.id} Last Accessed: ${node.last_accessed} Custom Hash: ${node.custom_hash}`);

      //60000ms = 1 min
      let minute_timestamp = (new Date() - node.last_accessed) / 60000;
      this.users.push({username: node.custom_hash, lastTime: minute_timestamp});

    });

    

  }

  //test function for the add new user endpoint with db
  async addNewUser() {
    // let currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    // let currentTime = new Date();

    const request = await fetch(`${this.newUserEndpoint}?last_accessed=${this.lastAccessed}&custom_hash=${this.customHash}`).then(res => res.json());
    let result2 = request;
    console.log(`Added new user. ID: ${result2.id} Last Accessed: ${result2.last_accessed} Custom Hash: ${result2.custom_hash}`);
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


    let result3 = testRequest;
    console.log(result3);
  }

  async updateLast_Accessed() {

    let testHash = "hello";

    let changed_hash;

    const auth = await fetch(`${this.authEndpoint}`).then(res => res.json());
    let result1 = auth;
    result1.forEach(node => {
        if(testHash === node.custom_hash){
          changed_hash = node.custom_hash;
            console.log(`change this: ${changed_hash}`);
        }
    });

    const testRequest = await fetch(`${this.updateLastAccessed}?last_accessed=${this.lastAccessed}&custom_hash=${changed_hash}`).then(res => res.json());


    let result4 = testRequest;
    console.log(result4);
  }

  

  newUserName (){

    // //old hash
    // this.userName;

    // //new hash
    // this.newUserName = this.shadowRoot.querySelector("#inputUsername").value;
    
    //old hash
    let testHash = "hello";

    // new hash
    let testNewHash = "hello1";

    let changed_hash;

    const auth = await fetch(`${this.authEndpoint}`).then(res => res.json());
    let result1 = auth;
    result1.forEach(node => {
        if(testHash === node.custom_hash){
          changed_hash = node.custom_hash;
            console.log(`change this: ${changed_hash}`);
        }
    });

    const testRequest = await fetch(`${this.updateUsername}?custom_hash=${changed_hash}&new_hash=${testNewHash}`).then(res => res.json());
    
    //Once username is changed in database, this will fire update to update users list
    this.customHash = testNewHash;


    let result4 = testRequest;
    console.log(result4);
    

  }

  activiteTime() {

      //Keep scope in setTimeout: https://snippets.aktagon.com/snippets/396-how-to-keep-the-scope-when-calling-settimeout-setinterval-in-javascript
      var self = this;

      // Status will be true once mouse movement is detected
      this.status = false;

      // Will check for mouse mouvement within the 5 minutes  = 300sec (test: 5 sec)
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
      this.updateLast_Accessed();

      // Starting over timestamp cannot equal 0 or else update won't work
      this.timestamp = 5;

      console.log("Active, start over timestamp:  " + this.timestamp)

      // If status is false, timestamp is still less than 30 minutes = 1800sec (test: 20 sec)
    } else if(this.timestamp < 20 * 1000){

      // Use lastAccessed time to update new timestamp, and update is triggered
      this.timestamp = new Date() - this.lastAccessed;
      console.log("Not active, timestamp:  " + this.timestamp)

    }
    else {

      console.log("deleted from database")
      this.deleteUser();

    }

}



  changeRPGSize(){

    this.currentSize = this.shadowRoot.querySelector("rpg-character").getAttribute("height")
   
    this.currentSize = this.currentSize === "100" ? "70" : "100";
  
    this.shadowRoot.querySelector("rpg-character").setAttribute("height", this.currentSize)
   
  }

  static styles = css`
       .base {
        float: left;
        height: 113px;
        width: 100px;
        margin-top: 10px;
        position: relative;
      }
       .base .ring-color {
        position: absolute;
        border-radius: 100%;
        height: 60px;
        width: 60px;
        left: 21px;
        top: 0%;
        z-index: 2;
        border: 5px solid;
      }
       .base .backing {
        width: auto;  
        max-height: 105px;  
        left: 17px;
        z-index: 1;
        position: relative;
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
      user => this.customHash == user.username ? html`

      <div class="base">
        <div class = "ring-color"  @click=${this.changeRPGSize} style = "border-color: #${this.hashCode(user.username)};"></div>
        <rpg-character height = "100" class = "rpg" seed = ${user.username}></rpg-character>

        <span class = "tooltip">
          
          <input id="inputUsername" type = "text" size = "8" value = '${user.username}'>
          <button class="changeButton" @click=${this.newUserName}>change</button><br>
          Last Accessed: ${user.lastTime} minute(s) ago

        </span>
        <img src = "/images/white-background.svg" class = "backing">       
      
      </div>

      ` : html`

      <script type="text/javascript"> console.log('n') </script>
      <div class="base">
        <div class = "ring-color" style = "border-color: red;"></div>

        <rpg-character height = "100" class = "rpg" seed = ${user.username}></rpg-character>
        <rpg-character class = "rpg" seed = ${this.seed}></rpg-character> //might have issue
        <span class = "tooltip"> ${user.username}, Last Accessed: ${user.lastTime} minute(s) ago
          

        </span>
        <img src = "/images/white-background.svg" class = "backing">       
      
      </div>
      
      `
      )}

      <div id="display_users"></div>

      <div class="testDBBtns">
      <button class="dbtestBtn" @click=${this.newUserName}>change user</button>
      <button class="dbtestBtn" @click=${this.updateLast_Accessed}>delete user</button>
      <button class="dbtestBtn" @click=${this.deleteUser}>delete user</button>
        <button class="dbtestBtn" @click=${this.getAllData}>Auth Test</button>
        <button class="dbtestBtn" @click=${this.addNewUser}>Post new user</button>
        <!--<button class="dbtestBtn" @click=${this.testNewTimestampEndpoint}>Change Timestamp</button>-->
      </div>
    `;
  }
}

window.customElements.define(WhosHere.tag, WhosHere);
