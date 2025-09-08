/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '../input.component';
@customElement('nr-inputs-demo')
export class ElButtonDemoElement extends LitElement {
  _changeHandler(_e: unknown) {
    console.log(_e);
  }

  _focusHandler(_e: unknown) {
    console.log('e', _e);
  }

  enterPressedHandler(e:CustomEvent){
    console.log('e ',e.detail.value)
  }
  override render() {
    return html` <div>
      <h3>Text input</h3>
      <nr-input
        placeholder="Enter your FullName"
        size="large"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
        @nr-enter=${this.enterPressedHandler}
      >
        <span slot="label">Large input</span>
        <span slot="helper-text">helper</span>
      </nr-input>
      <br />
      <br />

      <nr-input
        placeholder="Enter your FullName"
        ?withCopy=${true}
        size="large"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="label">Text input with copy</span>
        <span slot="helper-text">helper</span>
      </nr-input>
      <br />
      <br />
      <nr-input
        placeholder="Enter your FullName"
        size="medium"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="label">Medium input</span>
        <span slot="helper-text">helper</span>
      </nr-input>
      <br />
      <br />
      <nr-input
        placeholder="Enter your FullName"
        size="small"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="label">Small input</span>
        <span slot="helper-text">helper</span>
      </nr-input>
      <br />
      <br />
      <nr-input size="small" @nr-input=${this._changeHandler} @nr-focus=${this._focusHandler}>
        <span slot="label">without placeholder</span>
      </nr-input>
      <br />
      <br />
      <nr-input
        placeholder="Enter your FullName"
        state="error"
        size="large"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="label">Error input</span>
        <span slot="helper-text">Error input helper</span>
      </nr-input>
      <br />
      <br />
      <nr-input
        placeholder="Enter your FullName"
        state="error"
        size="large"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="label">Error input without helper</span>
      </nr-input>
      <br />
      <br />
      <nr-input
        placeholder="Enter your FullName"
        state="warning"
        size="large"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="label">Warning input</span>
        <span slot="helper-text">Warning input helper</span>
      </nr-input>
      <br />
      <br />
      <nr-input
        placeholder="Enter your FullName"
        state="warning"
        size="large"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="label">Warning input without helper</span>
      </nr-input>
      <br />
      <br />
      <nr-input
        placeholder="Enter your FullName"
        disabled
        state="error"
        size="large"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="label">disabled input error </span>
        <span slot="helper-text">helper</span>
      </nr-input>
      <br />
      <br />
      <nr-input
        placeholder="Enter your FullName"
        disabled
        state="warning"
        size="large"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="label">disabled input warning </span>
        <span slot="helper-text">helper</span>
      </nr-input>
      <br />
      <br />
      <nr-input
        placeholder="Enter your FullName"
        size="large"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="helper-text">without label</span>
      </nr-input>
      <br /><br />
      <nr-input
        placeholder="Enter your FullName"
        size="large"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
      </nr-input>
      <br /><br />

      <nr-input
        ?disabled=${true}
        placeholder="Enter your FullName"
        size="large"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="label">Disabled input</span>
      </nr-input>

      <br /><br />
      <nr-input
        placeholder="Enter your FullName"
        ?disabled=${true}
        size="large"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="label">Disabled input with label and helper</span>
        <span slot="helper-text">helper</span>
      </nr-input>

      <br /><br />
      <h3>Password input</h3>

      <nr-input
        placeholder="your password please"
        size="large"
        type="password"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="label">Password input</span>
      </nr-input>
      <br /><br />
      <nr-input
        disabled
        placeholder="your password please"
        size="large"
        type="password"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="label">Password input disabled</span>
      </nr-input>
      <br /><br />
      <nr-input
        placeholder="your password please"
        size="large"
        type="password"
        state="error"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="label">Password input error</span>
      </nr-input>
      <br /><br />
      <nr-input
        placeholder="your password please"
        disabled
        size="large"
        type="password"
        state="error"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="label">Password input error disabled</span>
      </nr-input>
      <br /><br />
      <nr-input
        placeholder="your password please"
        size="large"
        type="password"
        state="warning"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="label">Password input warning </span>
      </nr-input>
      <br /><br />
      <nr-input
        placeholder="your password please"
        disabled
        size="large"
        type="password"
        state="warning"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="label">Password input warning disabled</span>
      </nr-input>
      <br /><br />
      <h3>Number input</h3>

      <nr-input
        placeholder="Enter your age"
        size="large"
        type="number"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="label">Default number input </span>
      </nr-input>

      <br /><br />
      <nr-input
        state="error"
        placeholder="Enter your age"
        size="large"
        type="number"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="label">Number input error </span>
      </nr-input>
      <br /><br />
      <nr-input
        disabled
        state="error"
        placeholder="Enter your age"
        size="large"
        type="number"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="label">Number input error disabled</span>
      </nr-input>
      <br /><br />
      <nr-input
        state="warning"
        placeholder="Enter your age"
        size="large"
        type="number"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="label">Number input warning </span>
      </nr-input>
      <br /><br />
      <nr-input
        disabled
        state="warning"
        placeholder="Enter your age"
        size="large"
        type="number"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="label">Number input warning disabled </span>
      </nr-input>
      <br /><br />
      <nr-input
        min="15"
        max="100"
        step="25"
        size="large"
        type="number"
        @nr-input=${this._changeHandler}
        @nr-focus=${this._focusHandler}
      >
        <span slot="label">Number input with steps of 25, max 100 and min 15 </span>
      </nr-input>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-inputs-demo': ElButtonDemoElement;
  }
}
