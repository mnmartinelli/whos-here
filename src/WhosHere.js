import { html, css, LitElement } from 'lit';
import '@lrnwebcomponents/rpg-character/rpg-character.js';
import { UserIP } from './UserIP.js';

export class WhosHere extends LitElement {
  static get tag() {
    return 'whos-here';
  }

  static get properties() {
    return {

      userObj: { type: Object },

      timestamp: { type: Number},

      customHash: { type: String, reflect: true },

      checkForUsers: { type: Boolean },

      startCounter: { type: Boolean },
      //db test stuff below
      authEndpoint: { type: String },
      auth: { type: Array },
      newUserEndpoint: { type: String },
      updateHash: { type: String },
      updateLastAccessed: { type: String },
      deleteUserEndpoint: { type: String },
      deleteAllUsersEndpoint: { type: String },
      ip: { type: String},
      ipTest: { type: String},


    };
  }

  constructor() {
    super();
    this.UserIpInstance = new UserIP();
    // window.addEventListener("beforeunload", () => this.deleteUser());
    // window.addEventListener('beforeunload', (e) => {
    //   this.deleteUser();
    //   e.returnValue = '';
    // });
    this.anonyNames = ['Alligator', 'Anteater', 'Armadillo', 'Auroch', 'Axolotl', 'Badger', 'Bat', 'Bear', 'Beaver', 'Blobfish',
    'Buffalo', 'Camel', 'Chameleon', 'Cheetah', 'Chipmunk', 'Chinchilla', 'Chupacabra', 'Cormorant', 'Coyote', 'Crow', 'Dingo',
    'Dinosaur', 'Dog', 'Dolphin', 'Dragon', 'Duck', 'Octopus', 'Elephant', 'Ferret', 'Fox', 'Frog', 'Giraffe', 'Goose', 'Gopher',
    'Grizzly', 'Hamster', 'Hedgehog', 'Hippo', 'Hyena', 'Jackal', 'Jackalope', 'Ibex', 'Ifrit', 'Iguana', 'Kangaroo', 'Kiwi', 'Koala', 'Kraken',
    'Lemur', 'Leopard', 'Liger', 'Lion', 'Llama', 'Manatee', 'Mink', 'Monkey', 'Moose', 'Narwhal', 'Nyan cat', 'Orangutan', 'Otter', 'Panda', 'Penguin',
    'Platypus', 'Python', 'Pumpkin', 'Quagga', 'Quokka', 'Rabbit', 'Raccoon', 'Rhino', 'Sheep', 'Shrew', 'Skunk', 'Slow Loris', 'Squirrel', 'Tiger', 'Turtle',
    'Unicorn', 'Walrus', 'Wolf', 'Wolverine', 'Wombat'];

    //Later, we will get users from database to fill array.
    this.users = [];
    this.oldUsers = [];

    this.lastAccessedUnmodded = new Date();
    this.lastAccessed = new Date().toISOString().slice(0, 19).replace('T', ' ');

    this.checkForUsers = false;
    this.startCounter = false;

    //db test stuff below
    this.authEndpoint = '/api/auth';
    this.newUserEndpoint = '/api/addUser';
    this.updateLastAccessed = '/api/lastAccessed';
    this.deleteUserEndpoint = '/api/deleteUser';
    this.deleteAllUsersEndpoint = '/api/deleteAllUsers';

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
    let lasttwo =  str2.substring(17,19);
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

    changedProperties.forEach((oldValue, propName) => {
     if(propName === 'timestamp' && this[propName]){
        
        super.update(changedProperties);

        this.activiteTime();     

      }

      if (propName === 'startCounter' && this[propName]) {
        //alright so this one will poll every 30 seconds and find whos here
        //the duplicate code below in checkforusers is needed to load immediately.
        //dont be mad
        //sometimes the shitty code is the best code ;) 

        //one problem: you youself are not loaded until 30 seconds have passed
        setInterval(() => 
        {
          this.oldUsers = this.users;
          
          this.getAllData();
          
          console.log(this.users);
          //this.checkForUsers = true;
          setTimeout(() => {
            if(this.oldUsers === this.users) {
              //does nothing
            }
            else {
              let usersArea = this.shadowRoot.querySelector('#display_users');

              usersArea.innerHTML = '';

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
                let spanContent = document.createTextNode(`Anonymous ${this.getRandomUsername()}, Last Accessed: ${user.last_accessed}`);
                span.appendChild(spanContent);

                let img = document.createElement('img');

                img.setAttribute('class', 'backing');

                newUserDiv.appendChild(div);
                newUserDiv.appendChild(newRpg);
                newUserDiv.appendChild(span);
                newUserDiv.appendChild(img);

                usersArea.appendChild(newUserDiv);
              })
            }
          }, 1000);
        }
        , 30000);

      }
      

      if (propName === 'customHash' && this[propName]) {

        console.log(this.customHash)
        super.update(changedProperties);

        console.log('customhash prop changed');

        this.addNewUser().then(this.getAllData());

      }

      if(propName === 'checkForUsers' && this[propName]){
        //this is the duplicate code. WELCOME.
        if(this.checkForUsers === true){

          let usersArea = this.shadowRoot.querySelector('#display_users');

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
            let spanContent = document.createTextNode(`Anonymous ${this.getRandomUsername()}, Last Accessed: ${user.last_accessed}`);
            span.appendChild(spanContent);

            let img = document.createElement('img');
            img.setAttribute('class', 'backing');

            newUserDiv.appendChild(div);
            newUserDiv.appendChild(newRpg);
            newUserDiv.appendChild(span);
            newUserDiv.appendChild(img);

            usersArea.appendChild(newUserDiv);
          })

          , 1000);

          this.checkForUsers  = false;
        }
      }
    });
  }
  
  //sets custom hash and timestamp
  async newUserActivities(){
    
    this.birthday = null;
    console.log('2');
    const IPClass = new UserIP();
    const userIPData = IPClass.updateUserIP();
    setTimeout(() =>
    {
      console.log(IPClass.ip);
    }, 1000);
    this.ipTest = IPClass.ip;
    let currentTime = this.lastAccessed;
    if (this.birthday === null) {
      this.birthday = currentTime;
      console.log(this.birthday);
    }
    let num = Math.floor(Math.random() * 192168113343474589) + 753272641578;
    let txt = num.toString(16);
    console.log(txt);
    setTimeout(() =>
    {
      this.customHash = this.seedEncode(IPClass.ip, this.birthday);
      console.log(this.customHash);
    }, 1000);
    this.timestamp = 1;
  }
  //gets all the data in database and runs 'checkForUsers' to populate screen
  async getAllData() {
    const auth = await fetch(`${this.authEndpoint}`).then(res => res.json());

    this.users = JSON.parse(JSON.stringify(auth));
    console.log(this.users);

    this.checkForUsers = true;
    this.startCounter = true;
  }

  //adds a new user to db with current last accessed and custom hash
  async addNewUser() {
    const request = await fetch(`${this.newUserEndpoint}?last_accessed=${this.lastAccessed}&custom_hash=${this.customHash}`).then(res => res.json());
    let result2 = request;
    console.log(`Added new user. ID: ${result2.id} Last Accessed: ${result2.last_accessed} Custom Hash: ${result2.custom_hash}`);
  }

  //just to test adding new users with button
  //still have to wait 30 seconds to see people
  async postNewUserTest() {
    this.birthday = null;
    console.log('2');

    let currentTime = this.lastAccessed;
    if (this.birthday === null) {
      this.birthday = currentTime;
      console.log(this.birthday);
    }
    let num = Math.floor(Math.random() * 192168113343474589) + 753272641578;
    let txt = num.toString(16);
    console.log(txt);

    let testCustomHash = this.seedEncode(txt, this.birthday);
    console.log(testCustomHash);

    const request = await fetch(`${this.newUserEndpoint}?last_accessed=${this.lastAccessed}&custom_hash=${testCustomHash}`).then(res => res.json());
    let result2 = request;
    console.log(`Added new user. ID: ${result2.id} Last Accessed: ${result2.last_accessed} Custom Hash: ${result2.custom_hash}`);

    this.getAllData();
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
        if(this.customHash === node.custom_hash){
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

  getRandomUsername() {
    let anonyUsername;
    anonyUsername = this.anonyNames[Math.floor(Math.random() * this.anonyNames.length)];
    return anonyUsername;
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

      console.log('deleted from database');
      this.deleteUser();

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
        position: absolute;
        z-index: 3;
        top: 70%;
        margin-left: -2%;
      }

      .base .tooltip::after {
        content: '';
        position: absolute;
        bottom: 100%; /* At the bottom of the tooltip */
        left: 20%;
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
        <button class="dbtestBtn" @click=${this.deleteUser}>delete user</button>
        <button class="dbtestBtn" @click=${this.getAllData}>Auth Test</button>
        <button class="dbtestBtn" @click=${this.postNewUserTest}>Post new user</button>
        <button class="dbtestBtn" @click=${this.deleteAllUsers}>delete all users</button>
      </div>
    `;
  }
}

window.customElements.define(WhosHere.tag, WhosHere);


