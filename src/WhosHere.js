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
      timePassed: { type: Number},

      userObj: { type: Object },

      users: { type: Array },
      //db test stuff below
      authEndpoint: { type: String },
      auth: { type: Object },
      newUserEndpoint: { type: String },
      newTimestampEndpoint: { type: String },
    };
  }

  constructor() {
    super();
    this.title = 'Hey there';
    this.activiteTime(); 

    //later make random usernames
    this.userName = 'xiaojie'
    this.lastAccessed = new Date();
    this.timePassed = 0;
    
    this.userObj = {username: `${this.userName}`, lastTime: `${this.timePassed}`};
   
    //Later, we will get users from database to fill array.
    this.users = [];

    this.users.push(this.userObj);

    this.userObj2 = {username: 'xxx', lastTime: `5`};
    this.userObj3 = {username:'sss', lastTime: `5`};
    this.users.push(this.userObj2);
    this.users.push(this.userObj3);

    //db test stuff below
    this.authEndpoint = '/api/auth';
    this.newUserEndpoint = '/api/addNewUser';
    this.newTimestampEndpoint = '/api/changeTimestamp';
  }


  update(changedProperties) {
    console.log("update")
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'userName' && this[propName]) {
        console.log("assignNew")
        Object.assign(this.userObj, { username: this.userName});
        super.update(changedProperties);
        
      } else if(propName === 'timePassed' && this[propName]){
        
        

      }
    });
  }

  activiteTime() {
    console.log("activeTime")
    var time;
    let interval

    //https://hackthestuff.com/article/how-to-check-if-user-is-active-or-inactive-in-webpage-using-javascript-or-jquery
    // Will fire when mouse is active.
    window.onmousemove = active; 

    function active() {

        clearTimeout(time);

        // If inactive for more than 30 seconds (test: 5 secconds)
        time = setTimeout(timer, 1000 * 5); //5 sec
        
    }

    function timer() {
      console.log("inactive first 5 sec")
          
      // Update lastAccessed to current time when user becomes inactive
      // Used for time tracking purpose
      this.lastAccessed = new Date();

      // Will keep updating timePassed every 5 minutes (test: 5 seconds)
     interval = setInterval(function(){

      console.log("5 sec interval start")
      
        // Update timePassed => update will fire
        this.timePassed = new Date() - this.lastAccessed
        console.log(this.timePassed)

        // if time inactive is greater than 1 hour (test: 30 seconds), then user is deleted from database
        if (this.timePassed > 1000 * 30){
          
          //Delete user from database
          alert("User is inactive.");
          clearInterval(interval)

        } 

      }, 1000 * 5);
    
      window.addEventListener("mousemove", function () {
        //Sets timePassed to 0 and fires update because user is active
        this.timePassed = 0;
        console.log(this.timePassed)
      });
    
    }
      
    

};

// run the function


  async authTest() {
    const auth = await fetch(`${this.authEndpoint}`).then(res => res.json());
    console.log(auth);
  }

  // test function for the add new user endpoint with db
  async testAddNewUser() {
    let currentTime = Date.now();

    const testRequest = await fetch(`${this.newUserEndpoint}?last_accessed=${currentTime}?custom_hash=1abcdefg`).then(res => res.json());
    console.log(testRequest);
  }


  // test function for the new timestamp endpoint with db
  async testNewTimestampEndpoint() {
    let userID = 0;
    let oldTimestamp = '';

    const getTimestamp = await fetch(`${this.authEndpoint}`).then(res => res.json()).then(json => oldTimestamp = json[userID].last_accessed);

    let newTimestamp = Date.now();

    const testRequest = await fetch(`${this.newTimestampEndpoint}?oldTimestamp=${oldTimestamp}?newTimestamp=${newTimestamp}`).then(res => res.json());
    console.log(testRequest);
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

    // ring_color = this.shadowRoot.querySelector(".pants")
    // console.log(ring_color)

    return html`
      ${this.users.map(
      
      // can only edit their own usernames
      user => this.userName == user.username ? html`

      <div class="base">
        <div class = "ring-color" style = "border-color: red;"></div>
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
        <button class="dbtestBtn" @click=${this.authTest}>Auth Test</button>
        <button class="dbtestBtn" @click=${this.testAddNewUser}>Post new user</button>
        <button class="dbtestBtn" @click=${this.testNewTimestampEndpoint}>Change Timestamp</button>
      </div>
    `;
  }
}

window.customElements.define(WhosHere.tag, WhosHere);
