import { html, css, LitElement } from 'lit';
import '@lrnwebcomponents/rpg-character/rpg-character.js';

export class WhosHere extends LitElement {
  static get tag() {
    return 'whos-here';
  }

  static get properties() {
    return {

      userObj: { type: Object },

      // users: { type: Array },

      timestamp: { type: Number},

      customHash: { type: String, reflect: true },

      checkForUsers: { type: Boolean },
      //db test stuff below
      authEndpoint: { type: String },
      auth: { type: Array },
      newUserEndpoint: { type: String },
      updateHash: { type: String },
      updateLastAccessed: { type: String },
      deleteUserEndpoint: { type: String },
      deleteAllUsersEndpoint: { type: String },

      // usersArray: { type: Array, reflect: true },

    };
  }

  constructor() {
    super();

    //Later, we will get users from database to fill array.
    this.users = [];
    this.alldata =[];
    this.userObj;

    this.lastAccessedUnmodded = new Date();
    this.lastAccessed = new Date().toISOString().slice(0, 19).replace('T', ' ');

    this.checkForUsers = false;
    // this.userObj2 = {username: 'xxx', lastTime: `5`};
    // this.userObj3 = {username:'sss', lastTime: `5`};
    // this.users.push(this.userObj2);
    // this.users.push(this.userObj3);

    //db test stuff below
    this.authEndpoint = '/api/auth';
    this.newUserEndpoint = '/api/addUser';
    this.updateLastAccessed = '/api/lastAccessed';
    this.deleteUserEndpoint = '/api/deleteUser';
    this.deleteAllUsersEndpoint = '/api/deleteAllUsers';

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
        
        // Object.assign(this.userObj, { lastTime: this.timestamp});
        super.update(changedProperties);

        this.activiteTime();     

      }

      if (propName === 'customHash' && this[propName]) {

        console.log(this.customHash)
        super.update(changedProperties);

        console.log('customhash prop changed');

        this.addNewUser();

        this.getAllData();

        //get all data sets 'checkForUsers' to true so users are populated
      }

      if(propName === 'checkForUsers' && this[propName]){
        if(this.checkForUsers === true){

          let usersArea = this.shadowRoot.querySelector('#display_users');

          //thinking we dont need this now
          // const backgroundImg = new URL('../images/white-background.svg', import.meta.url).href;

          usersArea.innerHTML = '';

          //updates user area after 1 second to give this.users time to retrieve data
          setTimeout(() =>

          //puts together each element of each user and appends to div in html
          this.users.forEach(user => {
            console.log(user);
            let newUserDiv = document.createElement('div');
            newUserDiv.setAttribute('class', 'base');

            let div = document.createElement('div');
            div.setAttribute('class', 'ring-color');
            div.setAttribute('style', `border-color: #${this.hashCode(user.custom_hash)};`);

            let newRpg = document.createElement('rpg-character');
            newRpg.setAttribute('class', 'rpg');
            newRpg.setAttribute('seed', `${user.custom_hash}`);
            newRpg.setAttribute('height', '50');
            newRpg.setAttribute('width', '50');

            let span = document.createElement('span');
            span.setAttribute('class', 'tooltip');
            span.setAttribute('seed', `${user.custom_hash}`);
            let spanContent = document.createTextNode(`${user.custom_hash}, Last Accessed: ${user.last_accessed}`);
            span.appendChild(spanContent);

            let img = document.createElement('img');
            //thinking we dont need this now
            // img.setAttribute('src', `${backgroundImg}`);
            img.setAttribute('class', 'backing');

            newUserDiv.appendChild(div);
            newUserDiv.appendChild(newRpg);
            newUserDiv.appendChild(span);
            newUserDiv.appendChild(img);

            usersArea.appendChild(newUserDiv);
          })

          , 750);

          this.checkForUsers  = false;
        }
      }
    });
  }

  //sets custom hash and timestamp
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
  }

  //gets all the data in database and runs 'checkForUsers' to populate screen
  async getAllData() {
    const auth = await fetch(`${this.authEndpoint}`)
      .then(res => res.json())
      .then(this.users = JSON.parse(JSON.stringify(auth)))
      .then(this.checkForUsers = true);
    auth.forEach(user => {
      console.log(`ID: ${user.id} Last Accessed: ${user.last_accessed} Custom Hash: ${user.custom_hash}`);
    });
    // this.users = JSON.parse(JSON.stringify(auth));

    // this.checkForUsers = true;
  }

  //adds a new user to db with current last accessed and custom hash
  async addNewUser() {
    const request = await fetch(`${this.newUserEndpoint}?last_accessed=${this.lastAccessed}&custom_hash=${this.customHash}`).then(res => res.json());
    let result2 = request;
    console.log(`Added new user. ID: ${result2.id} Last Accessed: ${result2.last_accessed} Custom Hash: ${result2.custom_hash}`);
  }

  // async getLastAccessedTime() {
  //   const time = await fetch(`${this.getLastAccessed}?custom_hash=${this.customHash}`).then(res => res.json());
  //   let result = time;
  //   console.log(result)
  // }

  //deletes the user from db based on the hash passed through fetch
  async deleteUser() {

    let deleted_hash;

    //gets all data
    const auth = await fetch(`${this.authEndpoint}`).then(res => res.json());
    let result1 = auth;

    //checks if there is a user in db with same hash as this user
    result1.forEach(node => {
        if(testHash === node.custom_hash){
            deleted_hash = node.custom_hash;
        }
    });

    //sends delete request
    const testRequest = await fetch(`${this.deleteUserEndpoint}?custom_hash=${deleted_hash}`).then(res => res.json());

    let result3 = testRequest;
    console.log(result3);
  }

  //delete me when dont need anymore
  async deleteAllUsers() {
    const testRequest = await fetch(`${this.deleteAllUsersEndpoint}`).then(res => res.json());
    let result4 = testRequest;
    console.log(result4);
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
      this.timestamp = (new Date() - this.lastAccessedUnmodded);

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
        height: 50px;
        width: 50px;
        object-fit: cover;
        position: relative;
      }
       .base .ring-color {
        position: absolute;
        border-radius: 100%;
        height: 40px;
        width: 40px;
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
        right: -60%
        position: absolute;
        z-index: 3;
        top: 100%;
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
      <div id="display_users"></div>

      <div class="testDBBtns">
        <button class="dbtestBtn" @click=${this.updateLast_Accessed}>delete user</button>
        <button class="dbtestBtn" @click=${this.deleteUser}>delete user</button>
        <button class="dbtestBtn" @click=${this.getAllData}>Auth Test</button>
        <button class="dbtestBtn" @click=${this.addNewUser}>Post new user</button>
        <button class="dbtestBtn" @click=${this.deleteAllUsers}>delete all users</button>
      </div>
    `;
  }
}

window.customElements.define(WhosHere.tag, WhosHere);


