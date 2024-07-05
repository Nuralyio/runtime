import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {styles} from './checkbox.style';
import {CheckboxSize} from './checkbox.types';

@customElement('hy-checkbox')
export class HyCheckBox extends LitElement {
  static override styles = styles;
  @property({type: Boolean, reflect: true})
  checked = false;

  @property({type: Boolean, reflect: true})
  disabled = false;

  @property({type: Boolean, reflect: true})
  indeterminate = false;

  @property({reflect: true})
  size: CheckboxSize = CheckboxSize.Medium;

  override render() {
    return html`
      <input type="checkbox" .checked=${this.checked} .disabled=${this.disabled} @change=${this.onChange} />
      <slot></slot>
    `;
  }

  onChange() {
    if (this.indeterminate) {
      this.indeterminate = false;
    }
    this.checked = !this.checked;
    this.dispatchEvent(
      new CustomEvent('checkbox-changed', {
        bubbles: true,
        composed: true,
        detail: {
          value: this.checked,
        },
      })
    );
  }
}
