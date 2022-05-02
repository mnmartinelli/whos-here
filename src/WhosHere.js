import { html, css, LitElement } from 'lit';
import '@lrnwebcomponents/rpg-character/rpg-character.js';

export class WhosHere extends LitElement {
  static get tag() {
    return 'whos-here';
  }

  static get properties() {
    return {

      userObj: { type: Object },

      users: { type: Array },

      timestamp: { type: Number},

      customHash: { type: String, reflect: true },
      //db test stuff below
      authEndpoint: { type: String },
      auth: { type: Array },
      newUserEndpoint: { type: String },
      updateHash: { type: String },
      updateLastAccessed: { type: String },
      deleteUserEndpoint: { type: String },

      // usersArray: { type: Array, reflect: true },

    };
  }

  constructor() {
    super();

    //Later, we will get users from database to fill array.
    this.users = [];
    this.userObj;

    this.lastAccessedUnmodded = new Date();
    this.lastAccessed = new Date().toISOString().slice(0, 19).replace('T', ' ');

    this.userObj2 = {username: 'xxx', lastTime: `5`};
    this.userObj3 = {username:'sss', lastTime: `5`};
    this.users.push(this.userObj2);
    this.users.push(this.userObj3);

    //db test stuff below
    this.auth = {};
    this.authEndpoint = '/api/auth';
    this.newUserEndpoint = '/api/addUser';
    this.updateLastAccessed = '/api/lastAccessed';
    this.deleteUserEndpoint = '/api/deleteUser';

    this.customHash;
    
    this.newUserActivities();


  }

  //For ring color
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

    changedProperties.forEach((oldValue, propName) => {
     if(propName === 'timestamp' && this[propName]){
        
        Object.assign(this.userObj, { lastTime: this.timestamp});
        super.update(changedProperties);

        this.activiteTime();     

      }

      if (propName === 'customHash' && this[propName]) {

        console.log(this.customHash)
        super.update(changedProperties);

        console.log('customhash prop changed');

        this.getAllData();

      }
    });
  }

  async newUserActivities(){
    //add ip
    this.birthday = null;


    let currentTime = this.lastAccessed;
    if (this.birthday === null) {
      this.birthday = currentTime;
      console.log(this.birthday);
    }
    
    this.customHash = this.seedEncode("192.168.2.65", this.birthday);  

    this.timestamp = 1;
    this.userObj = {username: `${this.customHash}`, lastTime: `${this.timestamp}`};
    this.users.push(this.userObj);
    
  
    const request = await fetch(`${this.newUserEndpoint}?last_accessed=${currentTime}&custom_hash=${this.customHash}`).then(res => res.json());
    let result2 = request;
    console.log(`Added new user. ID: ${result2.id} Last Accessed: ${result2.last_accessed} Custom Hash: ${result2.custom_hash}`);
    this.getAllData();
    console.log(this.getAllData());
    console.log(this.users);
  }


  async getAllData() {
    const auth = await fetch(`${this.authEndpoint}`).then(res => res.json());
    this.users = auth;
    console.log(this.users);
    return auth;
  }

  //test function for the add new user endpoint with db
  async addNewUser() {

    const request = await fetch(`${this.newUserEndpoint}?last_accessed=${this.lastAccessed}&custom_hash=${this.customHash}`).then(res => res.json());
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
  
    // hashChange (){
    //   // let new_username = this.shadowRoot.querySelector("#inputUsername").value;
  
    //   let testHash = "hello";
  
  
    //   // Check if previous username is in database, if yes, new Date() can be used to change custome_hash 
    //   // const auth = await fetch(`${this.authEndpoint}`).then(res => res.json());
    //   // let result1 = auth;
    //   // result1.forEach(node => {
    //   //     if(testHash === node.custom_hash){
    //   //       this.customHash = this.seedEncode("192.168.2.65", new Date().toISOString().slice(0, 19).replace('T', ' ')); 
  
    //       // Update custom hash in database as well
    //       // const testRequest = await fetch(`${this.updateHash}?custom_hash=${changed_hash}&new_hash=${testNewHash}`).then(res => res.json());
  
    //   //         console.log(`change this: ${this.customHash}`);
    //   //     }
    //   // });
  
  
    //   this.customHash = this.seedEncode("192.168.2.65", new Date().toISOString().slice(0, 19).replace('T', ' ')); 
    //   console.log(`change this: ${this.customHash}`);
  
    // }

  activiteTime() {

      //Keep scope in setTimeout: https://snippets.aktagon.com/snippets/396-how-to-keep-the-scope-when-calling-settimeout-setinterval-in-javascript
      var self = this;

      // Status will be true once mouse movement is detected
      this.status = false;

      // Will check for mouse mouvement within the 5 minutes (test: 5 sec)
      setTimeout(function() { self.updateStat() }, 5 * 1000)

      // Immediately deletes mouse event listener when mouse movement is detected
      window.addEventListener("mousemove", active)
      window.addEventListener("click", active)


      function active() {

          self.status = true;
          window.removeEventListener("mousemove", active)
          window.removeEventListener("click", active)

      }
        
    }
      

  updateStat(){

    if(this.status){
      // LastAccessed time will be updated to database as well
      
      // Set new lastAccessed here to database.
      this.lastAccessed = new Date().toISOString().slice(0, 19).replace('T', ' ');

      // Restarting timestamp twice in a row should not have the same timestamp or else, update won't fire.
      this.timestamp = this.randomTimestamp(this.timestamp);

      console.log(this.status + ": " + this.timestamp)

      // If status is false, timestamp is still less than 30 minutes (test: 20 sec)
    } else if(this.timestamp < 20 * 1000){

      // Update new timestamp, and update is triggered
      this.timestamp = (new Date() - this.lastAccessedUnmodded).toISOString().slice(0, 19).replace('T', ' ');

      console.log(this.status + ": " + this.timestamp)

    }
    else {

      console.log("deleted from database")

    }

}
    
// Will ensure we get different timestamp 
// https://stackoverflow.com/questions/40056297/random-number-which-is-not-equal-to-the-previous-number
 randomTimestamp(prev){
  var min = 0;
  var max = 4;
  var next;
  
  next = Math.floor(Math.random() * (max - min)) + min;
  
  if (next===prev) {
    next = this.randomTimestamp(prev); //recursive
  }
  
  return next;
};

changeRPGSize(){

  this.currentSize = this.shadowRoot.querySelector("rpg-character").getAttribute("height")
 
  this.currentSize = this.currentSize === "100" ? "70" : "100";

  this.shadowRoot.querySelector("rpg-character").setAttribute("height", this.currentSize)
 
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
    const backgroundImg = new URL('../images/white-background.svg', import.meta.url).href;
    return html`
      ${this.users.map(
      
      // can only edit their own usernames
      user => this.customHash == user.username ? html`

      <div class="base">
        <div class = "ring-color" @click=${this.changeRPGSize}  style = "border-color: #${this.hashCode(user.username)};"></div>
        <rpg-character class = "rpg" seed = ${user.username}></rpg-character>

        <span class = "tooltip">
          
          <p id="inputUsername" size = "8">${user.username}</p>
          <button class="changeButton" @click=${this.hashChange}>change</button><br>
          Last Accessed: ${user.lastTime}

        </span>
        <img src = "${backgroundImg}" class = "backing">       
      
      </div>

      ` : html`

      <script type="text/javascript"> console.log('n') </script>
      <div class="base">
        <div class = "ring-color" style = "border-color: #${this.hashCode(user.username)};"></div>
        <rpg-character class = "rpg" seed = ${user.userName}></rpg-character>

        <span class = "tooltip"> ${user.username}, Last Accessed: ${user.lastTime}
          
        </span>
        <img src = "/images/white-background.svg" class = "backing">       
      
      </div>
      
      `
      )}

      <div id="display_users"></div>

      <div class="testDBBtns">
       <button class="dbtestBtn" @click=${this.updateLast_Accessed}>delete user</button>
      <button class="dbtestBtn" @click=${this.deleteUser}>delete user</button>
        <button class="dbtestBtn" @click=${this.getAllData}>Auth Test</button>
        <button class="dbtestBtn" @click=${this.addNewUser}>Post new user</button>
      </div>
    `;
  }
}

window.customElements.define(WhosHere.tag, WhosHere);


