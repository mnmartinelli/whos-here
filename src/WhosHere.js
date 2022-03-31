import { html, css, LitElement } from 'lit';

export class WhosHere extends LitElement {
  static get tag() {
    return 'whos-here';
  }

  static get properties() {
    return {
      title: { type: String },
      users: { type: Array },
    };
  }

  constructor() {
    super();
    this.title = 'Hey there';
    this.users = [];
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

    const circle = document.createElement('div');
    circle.className = 'circle';

    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip';
    tooltip.innerHTML = 'info';

    circle.appendChild(tooltip);

    const colors = ['#ff0000', '#00ff00', '#0000ff'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    circle.style.backgroundColor = randomColor;

    this.users.push(circle);

    // Adds each user from users array to display div.
    this.users.forEach(user => {
      display = this.shadowRoot.querySelector('#display_users');
      display.append(user);
    });
  }

  static get styles() {
    return css`
      .circle {
        float: left;
        height: 50px;
        width: 50px;
        border: 1px;
        border-color: white;
        border-radius: 100%;
      }
      .circle .tooltip {
        visibility: hidden;
        width: 100px;
        background-color: gray;
        color: white;
        text-align: center;
        border-radius: 6px;
        padding: 5px;

        position: absolute;
        z-index: 1;
        top: 9%;
        margin-left: -4%;
      }

      .circle .tooltip::after {
        content: ' ';
        position: absolute;
        bottom: 100%; /* At the bottom of the tooltip */
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: transparent transparent gray transparent;
      }

      .circle:hover .tooltip {
        visibility: visible;
      }

      #display_users {
        height: 100px;
        overflow: hidden;
      }
    `;
  }

  render() {
    return html`
      <div id="display_users"></div>

      <button @click=${this.addUser}>add user</button>
    `;
  }
}

window.customElements.define(WhosHere.tag, WhosHere);
