import {css, html, LitElement} from 'lit';
import '../canvas.component';
import {customElement} from 'lit/decorators.js';

@customElement('canvas-demo')
export class CanvasDemo extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 25%;
    }
  `;
  override render() {
    return html`
     <nodes-canvas></nodes-canvas>
    `;
  }
}
