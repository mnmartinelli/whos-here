import { html, css, LitElement } from 'lit';
import '@lrnwebcomponents/rpg-character/rpg-character.js';

export class WhosHere extends LitElement {
  static get tag() {
    return 'whos-here';
  }

  static get properties() {
    return {
      title: { type: String },
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
    this.users = [];
    //db test stuff below
    this.authEndpoint = '/api/auth';
    this.newUserEndpoint = '/api/addNewUser';
    this.newTimestampEndpoint = '/api/changeTimestamp';
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'users' && this[propName]) {
        const evt = new CustomEvent('users-changed', {
          // send the event up in the HTML document
          bubbles: true,
          // move up out of custom tags (that have a shadowRoot) and regular HTML tags
          composed: true,
          // other developers / code is allowed to tell this event to STOP going up in the DOM
          cancelable: true,

          detail: {
            value: this.users,
          },
        });

        this.dispatchEvent(evt);
      }
    });
  }

  addUser() {
    let display = this.shadowRoot.querySelector('#display_users');
    display.innerHTML = '';

    const base = document.createElement('div');
    console.log(base);
    base.className = 'base';

    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip';
    tooltip.innerHTML = 'info';
    base.appendChild(tooltip);

    const rpgChar = document.createElement('rpg-character');
    rpgChar.className = 'rpg';
    const style = document.createElement('style');
    rpgChar.appendChild(style);
    base.appendChild(rpgChar);

    const background = document.createElement('img');
    background.setAttribute('src', '/images/white-background.svg');
    background.className = 'backing';
    base.appendChild(background);

    const ring = document.createElement('div');
    ring.className = 'ring-color';
    const colors = ['#ff0000', '#00ff00', '#0000ff'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    ring.style.border = `5px solid${randomColor}`;

    base.appendChild(ring);

    const container = document.createElement('slot');
    container.className = 'container';
    container.appendChild(base);

    this.users.push(container);

    // Adds each user from users array to display div.
    this.users.forEach(user => {
      display = this.shadowRoot.querySelector('#display_users');
      display.append(user);
    });
  }

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



  static get styles() {
    return css`
      .container {
        width: 20%;
        height: 20%;
      }
      .container .base {
        float: left;
        height: 142px;
        width: 113px;
        border: 1px;
        border-color: white;
        position: relative;
      }
      .container .base .ring-color {
        position: absolute;
        border-radius: 100%;
        height: 83px;
        width: 83px;
        left: 10px;
        top: 0%;
        z-index: 2;
      }
      .container .base .backing {
        z-index: 1;
      }
      .container .base .rpg {
        position: absolute;
        z-index: -1;
      }
      .container .base .tooltip {
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

      .container .base .tooltip::after {
        content: ' ';
        position: absolute;
        bottom: 100%; /* At the bottom of the tooltip */
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: transparent transparent gray transparent;
      }

      .container .base:hover .tooltip {
        visibility: visible;
      }
    `;
  }

  render() {
    return html`
      <!-- <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 105 105">
  <defs>
  <style>.cls-1{fill:none;stroke:#000;stroke-miterlimit:10;stroke-width:4px;} 
</style>
</defs>
  <g id="Layer_2" data-name="Layer 2">
  <g id="Layer_1-2" data-name="Layer 1">
  <circle class="cls-1" cx="48" cy="48" r="46"/>
</g></g>
</svg> -->

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
