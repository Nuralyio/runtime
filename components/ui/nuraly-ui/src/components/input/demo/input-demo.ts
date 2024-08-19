/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../input.component';
@customElement('hy-inputs-demo')
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
      <hy-input
        placeholder="Enter your FullName"
        size="large"
        @input=${this._changeHandler}
        @focused=${this._focusHandler}
        @enter-pressed=${this.enterPressedHandler}
      >
        <span slot="label">Large input</span>
        <span slot="helper-text">helper</span>
      </hy-input>
      <br />
      <br />

      <hy-input
        placeholder="Enter your FullName"
        withCopy=${true}
        size="large"
        @input=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="label">Text input with copy</span>
        <span slot="helper-text">helper</span>
      </hy-input>
      <br />
      <br />
      <hy-input
        placeholder="Enter your FullName"
        size="medium"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="label">Medium input</span>
        <span slot="helper-text">helper</span>
      </hy-input>
      <br />
      <br />
      <hy-input
        placeholder="Enter your FullName"
        size="small"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="label">Small input</span>
        <span slot="helper-text">helper</span>
      </hy-input>
      <br />
      <br />
      <hy-input size="small" @valueChange=${this._changeHandler} @focused=${this._focusHandler}>
        <span slot="label">without placeholder</span>
      </hy-input>
      <br />
      <br />
      <hy-input
        placeholder="Enter your FullName"
        state="error"
        size="large"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="label">Error input</span>
        <span slot="helper-text">Error input helper</span>
      </hy-input>
      <br />
      <br />
      <hy-input
        placeholder="Enter your FullName"
        state="error"
        size="large"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="label">Error input without helper</span>
      </hy-input>
      <br />
      <br />
      <hy-input
        placeholder="Enter your FullName"
        state="warning"
        size="large"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="label">Warning input</span>
        <span slot="helper-text">Warning input helper</span>
      </hy-input>
      <br />
      <br />
      <hy-input
        placeholder="Enter your FullName"
        state="warning"
        size="large"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="label">Warning input without helper</span>
      </hy-input>
      <br />
      <br />
      <hy-input
        placeholder="Enter your FullName"
        disabled
        state="error"
        size="large"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="label">disabled input error </span>
        <span slot="helper-text">helper</span>
      </hy-input>
      <br />
      <br />
      <hy-input
        placeholder="Enter your FullName"
        disabled
        state="warning"
        size="large"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="label">disabled input warning </span>
        <span slot="helper-text">helper</span>
      </hy-input>
      <br />
      <br />
      <hy-input
        placeholder="Enter your FullName"
        size="large"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="helper-text">without label</span>
      </hy-input>
      <br /><br />
      <hy-input
        placeholder="Enter your FullName"
        size="large"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
      </hy-input>
      <br /><br />

      <hy-input
        ?disabled=${true}
        placeholder="Enter your FullName"
        size="large"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="label">Disabled input</span>
      </hy-input>

      <br /><br />
      <hy-input
        placeholder="Enter your FullName"
        ?disabled=${true}
        size="large"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="label">Disabled input with label and helper</span>
        <span slot="helper-text">helper</span>
      </hy-input>

      <br /><br />
      <h3>Password input</h3>

      <hy-input
        placeholder="your password please"
        size="large"
        type="password"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="label">Password input</span>
      </hy-input>
      <br /><br />
      <hy-input
        disabled
        placeholder="your password please"
        size="large"
        type="password"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="label">Password input disabled</span>
      </hy-input>
      <br /><br />
      <hy-input
        placeholder="your password please"
        size="large"
        type="password"
        state="error"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="label">Password input error</span>
      </hy-input>
      <br /><br />
      <hy-input
        placeholder="your password please"
        disabled
        size="large"
        type="password"
        state="error"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="label">Password input error disabled</span>
      </hy-input>
      <br /><br />
      <hy-input
        placeholder="your password please"
        size="large"
        type="password"
        state="warning"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="label">Password input warning </span>
      </hy-input>
      <br /><br />
      <hy-input
        placeholder="your password please"
        disabled
        size="large"
        type="password"
        state="warning"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="label">Password input warning disabled</span>
      </hy-input>
      <br /><br />
      <h3>Number input</h3>

      <hy-input
        placeholder="Enter your age"
        size="large"
        type="number"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="label">Default number input </span>
      </hy-input>

      <br /><br />
      <hy-input
        state="error"
        placeholder="Enter your age"
        size="large"
        type="number"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="label">Number input error </span>
      </hy-input>
      <br /><br />
      <hy-input
        disabled
        state="error"
        placeholder="Enter your age"
        size="large"
        type="number"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="label">Number input error disabled</span>
      </hy-input>
      <br /><br />
      <hy-input
        state="warning"
        placeholder="Enter your age"
        size="large"
        type="number"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="label">Number input warning </span>
      </hy-input>
      <br /><br />
      <hy-input
        disabled
        state="warning"
        placeholder="Enter your age"
        size="large"
        type="number"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="label">Number input warning disabled </span>
      </hy-input>
      <br /><br />
      <hy-input
        min="15"
        max="100"
        step="25"
        size="large"
        type="number"
        @valueChange=${this._changeHandler}
        @focused=${this._focusHandler}
      >
        <span slot="label">Number input with steps of 25, max 100 and min 15 </span>
      </hy-input>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-inputs-demo': ElButtonDemoElement;
  }
}
