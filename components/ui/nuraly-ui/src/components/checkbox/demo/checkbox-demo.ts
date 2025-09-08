import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../checkbox.component.js';

@customElement('hy-checkbox-demo')
export class CheckBoxDemo extends LitElement {
  override render() {
    return html`
      <h3>Default checkbox</h3>

      <hy-checkbox indeterminate>Default: indeterminate</hy-checkbox>
      <hy-checkbox checked>Default: checked</hy-checkbox>
      <hy-checkbox>Default (unchecked)</hy-checkbox>
      <hy-checkbox disabled>Checkbox disabled</hy-checkbox>
      <hy-checkbox disabled indeterminate>Checkbox disabled and indeterminate</hy-checkbox>
      <hy-checkbox disabled checked>Checkbox disabled and checked</hy-checkbox>
      <hr />
      
      <h3>Form Integration</h3>
      <form @submit=${this.handleSubmit}>
        <hy-checkbox name="terms" value="accepted" @nr-change=${this.handleChange}>I accept the terms and conditions</hy-checkbox>
        <hy-checkbox name="newsletter" value="subscribed" @nr-change=${this.handleChange}>Subscribe to newsletter</hy-checkbox>
        <hy-checkbox name="marketing" value="opted-in" indeterminate @nr-change=${this.handleChange}>Marketing communications (some selected)</hy-checkbox>
        <br><br>
        <button type="submit">Submit Form</button>
      </form>
      <hr />

      <h3>Sizes with check</h3>

      <hy-checkbox checked>Medium checkbox (default)</hy-checkbox>
      <hy-checkbox size="small" checked>Small checkbox</hy-checkbox>
      <hy-checkbox size="large" checked>Large checkbox</hy-checkbox>
      <hy-checkbox checked disabled>Medium checkbox (default)</hy-checkbox>
      <hy-checkbox size="small" checked disabled>Small checkbox</hy-checkbox>
      <hy-checkbox size="large" checked disabled>Large checkbox</hy-checkbox>
      <hr />
      
      <h3>Sizes with indeterminate</h3>
      <hy-checkbox indeterminate>Medium checkbox (default)</hy-checkbox>
      <hy-checkbox size="small" indeterminate>Small checkbox</hy-checkbox>
      <hy-checkbox size="large" indeterminate>Large checkbox</hy-checkbox>
      <hy-checkbox indeterminate disabled>Medium checkbox (default)</hy-checkbox>
      <hy-checkbox size="small" indeterminate disabled>Small checkbox</hy-checkbox>
      <hy-checkbox size="large" indeterminate disabled>Large checkbox</hy-checkbox>
      <hr />
      
      <h3>Sizes with unchecked</h3>

      <hy-checkbox>Medium checkbox (default)</hy-checkbox>
      <hy-checkbox size="small">Small checkbox</hy-checkbox>
      <hy-checkbox size="large">Large checkbox</hy-checkbox>
      <hy-checkbox disabled>Medium checkbox (default)</hy-checkbox>
      <hy-checkbox size="small" disabled>Small checkbox</hy-checkbox>
      <hy-checkbox size="large" disabled>Large checkbox</hy-checkbox>
      <hr />

      <h3>Event Handling Demo</h3>
      <hy-checkbox @nr-change=${this.handleChange}>Click me to see event details</hy-checkbox>
      <p id="event-output">Event output will appear here...</p>
      <hr />

      <h3>Size Validation Demo</h3>
      <hy-checkbox size=${'invalid-size' as any}>This checkbox will use default size (check console for warning)</hy-checkbox>
      <hy-checkbox size="small">Valid small size</hy-checkbox>
      <hy-checkbox size="medium">Valid medium size</hy-checkbox>
      <hy-checkbox size="large">Valid large size</hy-checkbox>
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
