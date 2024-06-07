import {LitElement, css, html} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('hy-icon-demo')
export class HyIconDemo extends LitElement {
  static override readonly styles = css`
    #first-icon {
      --hybrid-icon-color: red;
    }
    #second-icon {
      --hybrid-icon-width: 20px;
      --hybrid-icon-height: 25px;
    }
    #third-icon {
      --hybrid-icon-width: 30px;
      --hybrid-icon-height: 35px;
      --hybrid-icon-color: green;
    }
  `;
  override render() {
    return html`
      <h3>Default icon (solid)</h3>
      <hy-icon name="envelope"></hy-icon>
      <h3>Icon with overriden color</h3>
      <hy-icon id="first-icon" name="check"></hy-icon>
      <h3>Icon with overriden size</h3>
      <hy-icon id="second-icon" name="warning"></hy-icon>
      <h3>Icon with overriden size and color</h3>
      <hy-icon id="third-icon" name="bug"></hy-icon>
      <h3>Regular icon</h3>
      <hy-icon name="envelope" type="regular"></hy-icon>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hy-icon-demo': HyIconDemo;
  }
}
