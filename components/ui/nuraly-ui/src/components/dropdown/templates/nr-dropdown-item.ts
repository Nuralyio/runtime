import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './nr-dropdown-item.style.js';

@customElement('nr-dropdown-item')
export class HyDropdownItem extends LitElement {
  static override styles = styles;

  @property({ reflect: true, type: String })
  icon!: string;

  @property({ reflect: true, type: Boolean })
  disabled = false;

  @property()
  label!: string;

  @property()
  value!: string;

  @property()
  additionalData!: any;

  onClick(clickItemEvent: Event) {
    console.log(this.additionalData, 'clickItemEvent');
    clickItemEvent.stopPropagation();

    if (!this.disabled) {
      this.dispatchEvent(
        new CustomEvent('click-item', {
          detail: { value: this.value, additionalData: this.additionalData },
          composed: true,
          bubbles: true,
        })
      );
    }
  }

  override render() {
    return html`
      <div @click=${this.onClick}>
        ${this.icon ? html`<nr-icon name=${this.icon}></nr-icon>` : nothing}
        <nr-label class="option-label">${this.label}</nr-label>
      </div>
    `;
  }
}