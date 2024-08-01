import {LitElement, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {styles} from './hy-dropdown-item.style.js';

@customElement('hy-dropdown-item')
export class HyDropdownItem extends LitElement {
  static override styles = styles;
  @property({reflect: true, type: String})
  icon!: string;
  @property({reflect: true, type: Boolean})
  disabled = false;
  @property()
  label!: string;
  @property()
  value!: string;

  onClick(clickItemEvent: Event) {
    clickItemEvent.stopPropagation();
    if (!this.disabled)
      this.dispatchEvent(new CustomEvent('click-item', {detail: {value: this.value}, composed: true, bubbles: true}));
  }

  override render() {
    return html`<div @click=${this.onClick}>${
      this.icon ? html`<hy-icon name=${this.icon}></hy-icon>` : nothing
    }<span class="option-label">${this.label}<span></li>`;
  }
}
