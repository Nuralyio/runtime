import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {styles} from './card.style.js';
import {CardSize} from './card.type.js';
import {classMap} from 'lit/directives/class-map.js';

@customElement('hy-card')
export class HyCardComponent extends LitElement {
  static override styles = styles;

  @property() header!: string;
  @property() size = CardSize.Default;

  override render() {
    return html`
      <div
        class="card ${classMap({'small-card': this.size == CardSize.Small, 'large-card': this.size == CardSize.Large})}"
      >
        <div class="card-header">${this.header}</div>
        <div class="card-content">
          <slot name="content"></slot>
        </div>
      </div>
    `;
  }
}
