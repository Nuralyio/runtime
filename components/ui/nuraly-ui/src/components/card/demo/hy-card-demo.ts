import {css, html, LitElement} from 'lit';
import '../card.component';
import {customElement} from 'lit/decorators.js';
import '../../button/demo/hy-buttons-demo';

@customElement('hy-card-demo')
export class HyCardDemo extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 25%;
    }
  `;
  override render() {
    return html`
      Default
      <hy-card .header=${'welcome'}>
        <p slot="content">hello</p>
      </hy-card>
      <br />
      Small

      <hy-card .size=${'small'} .header=${'welcome small'}>
        <p slot="content">hello</p>
      </hy-card>
      <br />

      Large

      <hy-card .size=${'large'} .header=${'welcome large'}>
        <p slot="content">hello</p>
      </hy-card>
    `;
  }
}
