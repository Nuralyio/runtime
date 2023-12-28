/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';

@customElement('hy-toast-demo')
export class ElMeenuElement extends LitElement {
  @state()
  toast : any ;

  @state()
  _showOptions = false;

  @state()
  _message = "";
  
  override firstUpdated() {
    // Get lit-toast referece to save multiple DOM access
    this.toast = this.shadowRoot!.querySelector('hy-toast');
    console.log(this.toast);
    // If 'path' or 'composedPath()' unavailable, don't show options
    this.addEventListener('click', (event:any) => {
      this._showOptions = event.path || event.composedPath();
    });

    this.click();
  }

  _callToast() {
    this.toast.show(this._message)
  }
  _updateMessage(event:any) {
    let path = event.path || event.composedPath();
    if (path) {
      this._message = path[0].value;
    }
  }

  _updatePadding(event:any) {
    let path = event.path || event.composedPath();
    if (path) {
      this._padding = path[0].value;
      this.toast.style.setProperty('--lt-padding', this._padding);
    }
  }

  _updateBottom(event:any) {
    let path = event.path || event.composedPath();
    if (path) {
      this._bottom = path[0].value;
      this.toast.style.setProperty('--lt-bottom', this._bottom);
    }
  }

  _updateZIndex(event:any) {
    let path = event.path || event.composedPath();
    if (path) {
      this._zIndex = path[0].value;
      this.toast.style.setProperty('--lt-z-index', this._zIndex);
    }
  }

  _updateFontSize(event:any) {
    let path = event.path || event.composedPath();
    if (path) {
      this._fontSize = path[0].value;
      this.toast.style.setProperty('--lt-font-size', this._fontSize);
    }
  }

  _updateBorderRadius(event:any) {
    let path = event.path || event.composedPath();
    if (path) {
      this._borderRadius = path[0].value;
      this.toast.style.setProperty('--lt-border-radius', this._borderRadius);
    }
  }

  _updateBorder(event:any) {
    let path = event.path || event.composedPath();
    if (path) {
      this._border = path[0].value;
      this.toast.style.setProperty('--lt-border', this._border);
    }
  }
@state()
  _color = "";
  @state()
  _backgroundColor = "";
  @state()
  _fontFamily = "";
  @state()
  _borderRadius = "";
  @state()
  _border = "";
  @state()
  _zIndex = "";
  @state()
  _fontSize = "";
  @state()
  _padding = "";
  @state()
  _bottom = "";

  _updateColor(event:any) {
    let path = event.path || event.composedPath();
    if (path) {
      this._color = path[0].value;
      this.toast.style.setProperty('--lt-color', this._color);
    }
  }

  _updateBackgroundColor(event:any) {
    let path = event.path || event.composedPath();
    if (path) {
      this._backgroundColor = path[0].value;
      this.toast.style.setProperty(
        '--lt-background-color',
        this._backgroundColor
      );
    }
  }

  _updateFontFamily(event:any) {
    let path = event.path || event.composedPath();
    if (path) {
      this._fontFamily = path[0].value;
      this.toast.style.setProperty('--lt-font-family', this._fontFamily);
    }
  }

  protected override render() {
    return html`
     <hy-toast></hy-toast>

      <!-- Primary Container (to center everything) -->
      <div class="container">
        <!-- Title + GitHub link -->
        <header>
          <h1>lit-toast</h1>
          <a
            href="https://github.com/Victor-Bernabe/lit-toast"
            rel="noreferrer"
            id="link-github"
            aria-label="See on GitHub"
            title="See on GitHub"
          ></a>
        </header>

        <main>
          <!-- Call Toast Button -->
          <button id="call-toast" @click="${this._callToast}">
            Call Toast
          </button>

          ${this._showOptions
            ? html`
                <!-- Panels Section -->
                <div id="panels">
                  <!-- Options Section -->
                  <section>
                    <h2>Options</h2>
                    <div class="panel panel-options">
                      <!-- Options from 1 to 5 -->
                      <div class="panel-column">
                        <div class="option">
                          <span id="padding" class="option-title">padding</span>
                          <input
                            class="input-common"
                            type="text"
                            placeholder="16px"
                            .value="${this._padding}"
                            @input="${this._updatePadding}"
                            aria-labelledby="padding"
                          />
                        </div>
                        <div class="option">
                          <span id="bottom" class="option-title">bottom</span>
                          <input
                            class="input-common"
                            type="text"
                            placeholder="40px"
                            .value="${this._bottom}"
                            @input="${this._updateBottom}"
                            aria-labelledby="bottom"
                          />
                        </div>
                        <div class="option">
                          <span id="color" class="option-title">color</span>
                          <input
                            class="input-common"
                            type="color"
                            .value="${this._color}"
                            @change="${this._updateColor}"
                            aria-labelledby="color"
                            title="${this._color}"
                          />
                        </div>
                        <div class="option">
                          <span id="z-index" class="option-title">z-index</span>
                          <input
                            class="input-common"
                            type="text"
                            placeholder="2"
                            .value="${this._zIndex}"
                            @input="${this._updateZIndex}"
                            aria-labelledby="z-index"
                          />
                        </div>
                        <div class="option">
                          <span id="font-size" class="option-title"
                            >font-size</span
                          >
                          <input
                            class="input-common"
                            type="text"
                            placeholder="1em"
                            .value="${this._fontSize}"
                            @input="${this._updateFontSize}"
                            aria-labelledby="font-size"
                          />
                        </div>
                      </div>

                      <!-- Options from 6 to 10 -->
                      <div class="panel-column">
                        <div class="option">
                          <span id="font-family" class="option-title"
                            >font-family</span
                          >
                          <select
                            class="input-common"
                            @change="${this._updateFontFamily}"
                            aria-labelledby="font-family"
                          >
                            <option value="sans-serif">sans-serif</option>
                            <option value="serif">serif</option>
                          </select>
                        </div>
                        <div class="option">
                          <span id="border-radius" class="option-title"
                            >border-radius</span
                          >
                          <input
                            class="input-common"
                            type="text"
                            placeholder="2px"
                            .value="${this._borderRadius}"
                            @input="${this._updateBorderRadius}"
                            aria-labelledby="border-radius"
                          />
                        </div>
                        <div class="option">
                          <span id="background-color" class="option-title"
                            >background-color</span
                          >
                          <input
                            class="input-common"
                            type="color"
                            .value="${this._backgroundColor}"
                            @change="${this._updateBackgroundColor}"
                            aria-labelledby="background-color"
                            title="${this._backgroundColor}"
                          />
                        </div>
                        <div class="option">
                          <span id="border" class="option-title">border</span>
                          <input
                            class="input-common input-long-text"
                            type="text"
                            placeholder="none"
                            .value="${this._border}"
                            @input="${this._updateBorder}"
                            aria-labelledby="border"
                          />
                        </div>
                        <div class="option">
                          <span id="text" class="option-title">text</span>
                          <input
                            class="input-common input-long-text"
                            type="text"
                            placeholder="Message"
                            .value="${this._message}"
                            @input="${this._updateMessage}"
                            aria-labelledby="text"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <!-- Code Section -->
                  <section>
                    <h2>Code</h2>
                    <div class="panel panel-code">
                      <span class="css-selector">#toast</span
                      ><span class="bracket">{</span><br />
                      <span class="css-property">--lt-background-color:</span>
                      <span class="css-value">${this._backgroundColor};</span
                      ><br />
                      <span class="css-property">--lt-color:</span>
                      <span class="css-value">${this._color};</span><br />
                      <span class="css-property">--lt-padding:</span>
                      <span class="css-value">${this._padding};</span><br />
                      <span class="css-property">--lt-bottom:</span>
                      <span class="css-value">${this._bottom};</span><br />
                      <span class="css-property">--lt-font-size:</span>
                      <span class="css-value">${this._fontSize};</span><br />
                      <span class="css-property">--lt-font-family:</span>
                      <span class="css-value">${this._fontFamily};</span><br />
                      <span class="css-property">--lt-border-radius:</span>
                      <span class="css-value">${this._borderRadius};</span
                      ><br />
                      <span class="css-property">--lt-border:</span>
                      <span class="css-value">${this._border};</span><br />
                      <span class="css-property">--lt-z-index:</span>
                      <span class="css-value">${this._zIndex};</span><br />
                      <span class="bracket">}</span>
                    </div>
                  </section>
                </div>
              `
            : html`
                <!-- path and composedPath() are not supported so... no options :( -->
              `}
        </main>
      </div>

    `;
  }
}


