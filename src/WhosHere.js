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

    // this.customHash = ;

    this.activiteTime();
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


  update(changedProperties) {
    console.log(changedProperties)
    console.log(this.timestamp)
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

        //get all db data
        // const auth = await fetch(`${this.authEndpoint}`).then(res => res.json());
        // let result1 = auth;
        // result1.forEach(node => {
        //   console.log(`ID: ${node.id} Last Accessed: ${node.last_accessed} Custom Hash: ${node.custom_hash}`);
        // });
        this.getAllData();
        this.addNewUser();
        

        //run function to add new user
        
      }
    });
  }

  async getAllData() {
    const auth = await fetch(`${this.authEndpoint}`).then(res => res.json());
    let result1 = auth;
    result1.forEach(node => {
      console.log(`ID: ${node.id} Last Accessed: ${node.last_accessed} Custom Hash: ${node.custom_hash}`);
    });
  }

  //test function for the add new user endpoint with db
  async addNewUser() {
    let currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const request = await fetch(`${this.newUserEndpoint}?last_accessed=${currentTime}&custom_hash=${this.customHash}`).then(res => res.json());
    let result2 = request;
    console.log(`Added new user. ID: ${result2.id} Last Accessed: ${result2.last_accessed} Custom Hash: ${result2.custom_hash}`);
  }

  async getLastAccessedTime() {
    const time = await fetch(`${this.getLastAccessed}?custom_hash=${this.customHash}`).then(res => res.json());
    let result = time;
    console.log(result)
  }

  async deleteUser() {

    const testRequest = await fetch(`${this.delete}?custom_hash=hello`, {
      method: 'DELETE',
    })
    .then(res => res.json()) 
    .then(res => console.log(res))

    this.testRequest = testRequest;
    console.log(this.testRequest);
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
        <rpg-character class = "rpg" seed = ${user.username}></rpg-character>

        <span class = "tooltip"> ${user.username}, Last Accessed: ${user.lastTime}
          

        </span>
        <img src = "/images/white-background.svg" class = "backing">       
      
      </div>
      
      `
      )}

      <div id="display_users"></div>

      <div class="testDBBtns">
      <button class="dbtestBtn" @click=${this.deleteUser}>delete user</button>
        <button class="dbtestBtn" @click=${this.getAllData}>Auth Test</button>
        <button class="dbtestBtn" @click=${this.addNewUser}>Post new user</button>
        <!--<button class="dbtestBtn" @click=${this.testNewTimestampEndpoint}>Change Timestamp</button>-->
      </div>
    `;
  }
}

window.customElements.define(WhosHere.tag, WhosHere);
