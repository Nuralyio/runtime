/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '../checkbox.component.js';

@customElement('nr-checkbox-demo')
export class CheckBoxDemo extends LitElement {
  override render() {
    return html`
      <h3>Default checkbox</h3>

      <nr-checkbox indeterminate>Default: indeterminate</nr-checkbox>
      <nr-checkbox checked>Default: checked</nr-checkbox>
      <nr-checkbox>Default (unchecked)</nr-checkbox>
      <nr-checkbox disabled>Checkbox disabled</nr-checkbox>
      <nr-checkbox disabled indeterminate>Checkbox disabled and indeterminate</nr-checkbox>
      <nr-checkbox disabled checked>Checkbox disabled and checked</nr-checkbox>
      <hr />

      <h3>Theme Support</h3>
      <p>The checkbox component now supports automatic theme detection and management through the NuralyUIBaseMixin, using data-theme attributes like the button component.</p>
      <div data-theme="light" style="padding: 10px; border: 1px solid #ccc; margin: 10px 0; background-color: #ffffff; color: #000000;">
        <p>Light theme context (data-theme="light"):</p>
        <nr-checkbox checked>Light theme checkbox</nr-checkbox>
        <nr-checkbox indeterminate>Light theme indeterminate</nr-checkbox>
        <nr-checkbox>Light theme unchecked</nr-checkbox>
        <nr-checkbox disabled checked>Light theme disabled</nr-checkbox>
      </div>
      <div data-theme="dark" style="padding: 10px; border: 1px solid #666; margin: 10px 0; background-color: #2a2a2a; color: white;">
        <p>Dark theme context (data-theme="dark"):</p>
        <nr-checkbox checked>Dark theme checkbox</nr-checkbox>
        <nr-checkbox indeterminate>Dark theme indeterminate</nr-checkbox>
        <nr-checkbox>Dark theme unchecked</nr-checkbox>
        <nr-checkbox disabled checked>Dark theme disabled</nr-checkbox>
      </div>
      <hr />
      
      <h3>Form Integration</h3>
      <form @submit=${this.handleSubmit}>
        <nr-checkbox name="terms" value="accepted" @nr-change=${this.handleChange}>I accept the terms and conditions</nr-checkbox>
        <nr-checkbox name="newsletter" value="subscribed" @nr-change=${this.handleChange}>Subscribe to newsletter</nr-checkbox>
        <nr-checkbox name="marketing" value="opted-in" indeterminate @nr-change=${this.handleChange}>Marketing communications (some selected)</nr-checkbox>
        <br><br>
        <button type="submit">Submit Form</button>
      </form>
      <hr />

      <h3>Sizes with check</h3>

      <nr-checkbox checked>Medium checkbox (default)</nr-checkbox>
      <nr-checkbox size="small" checked>Small checkbox</nr-checkbox>
      <nr-checkbox size="large" checked>Large checkbox</nr-checkbox>
      <nr-checkbox checked disabled>Medium checkbox (default)</nr-checkbox>
      <nr-checkbox size="small" checked disabled>Small checkbox</nr-checkbox>
      <nr-checkbox size="large" checked disabled>Large checkbox</nr-checkbox>
      <hr />
      
      <h3>Sizes with indeterminate</h3>
      <nr-checkbox indeterminate>Medium checkbox (default)</nr-checkbox>
      <nr-checkbox size="small" indeterminate>Small checkbox</nr-checkbox>
      <nr-checkbox size="large" indeterminate>Large checkbox</nr-checkbox>
      <nr-checkbox indeterminate disabled>Medium checkbox (default)</nr-checkbox>
      <nr-checkbox size="small" indeterminate disabled>Small checkbox</nr-checkbox>
      <nr-checkbox size="large" indeterminate disabled>Large checkbox</nr-checkbox>
      <hr />
      
      <h3>Sizes with unchecked</h3>

      <nr-checkbox>Medium checkbox (default)</nr-checkbox>
      <nr-checkbox size="small">Small checkbox</nr-checkbox>
      <nr-checkbox size="large">Large checkbox</nr-checkbox>
      <nr-checkbox disabled>Medium checkbox (default)</nr-checkbox>
      <nr-checkbox size="small" disabled>Small checkbox</nr-checkbox>
      <nr-checkbox size="large" disabled>Large checkbox</nr-checkbox>
      <hr />

      <h3>Event Handling Demo</h3>
      <nr-checkbox @nr-change=${this.handleChange}>Click me to see event details</nr-checkbox>
      <p id="event-output">Event output will appear here...</p>
      <hr />

      <h3>Size Validation Demo</h3>
      <nr-checkbox size=${'invalid-size' as any}>This checkbox will use default size (check console for warning)</nr-checkbox>
      <nr-checkbox size="small">Valid small size</nr-checkbox>
      <nr-checkbox size="medium">Valid medium size</nr-checkbox>
      <nr-checkbox size="large">Valid large size</nr-checkbox>
    `;
  }

  handleChange(event: CustomEvent) {
    const target = event.target as any;
    const output = this.shadowRoot?.querySelector('#event-output');
    if (output) {
      output.textContent = `Event: nr-change, Checked: ${event.detail.value}, Name: ${target.name || 'N/A'}, Value: ${target.value || 'N/A'}`;
    }
    console.log('Checkbox changed:', {
      checked: event.detail.value,
      name: target.name,
      value: target.value,
      size: target.size
    });
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    console.log('Form submitted:', Object.fromEntries(formData));
    alert('Form submitted! Check console for form data.');
  }
}
