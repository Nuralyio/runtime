import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';

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
      <h3>Sizes with check</h3>

      <hy-checkbox checked>Medium checkbox (default)</hy-checkbox>
      <hy-checkbox size="small" checked>Small checkbox</hy-checkbox>
      <hy-checkbox size="large" checked>large checkbox</hy-checkbox>
      <hy-checkbox checked disabled>Medium checkbox (default)</hy-checkbox>
      <hy-checkbox size="small" checked disabled>Small checkbox</hy-checkbox>
      <hy-checkbox size="large" checked disabled>large checkbox</hy-checkbox>
      <hr />
      <h3>Sizes with indeterminate</h3>
      <hy-checkbox indeterminate>Medium checkbox (default)</hy-checkbox>
      <hy-checkbox size="small" indeterminate>Small checkbox</hy-checkbox>
      <hy-checkbox size="large" indeterminate>large checkbox</hy-checkbox>
      <hy-checkbox indeterminate disabled>Medium checkbox (default)</hy-checkbox>
      <hy-checkbox size="small" indeterminate disabled>Small checkbox</hy-checkbox>
      <hy-checkbox size="large" indeterminate disabled>large checkbox</hy-checkbox>
      <hr />
      <h3>Sizes with unchecked</h3>

      <hy-checkbox>Medium checkbox (default)</hy-checkbox>
      <hy-checkbox size="small">Small checkbox</hy-checkbox>
      <hy-checkbox size="large">large checkbox</hy-checkbox>
      <hy-checkbox disabled>Medium checkbox (default)</hy-checkbox>
      <hy-checkbox size="small" disabled>Small checkbox</hy-checkbox>
      <hy-checkbox size="large" disabled>large checkbox</hy-checkbox>
    `;
  }
}
