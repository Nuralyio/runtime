import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {styles} from './checkbox.style.js';
import {CheckboxSize} from './checkbox.types.js';

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
  get size(): CheckboxSize {
    return this._size;
  }
  set size(value: CheckboxSize) {
    const validSizes = [CheckboxSize.Small, CheckboxSize.Medium, CheckboxSize.Large];
    if (validSizes.includes(value)) {
      this._size = value;
    } else {
      console.warn(`Invalid size value: ${value}. Using default size: ${CheckboxSize.Medium}`);
      this._size = CheckboxSize.Medium;
    }
  }
  private _size: CheckboxSize = CheckboxSize.Medium;

  @property({type: String})
  name?: string;

  @property({type: String})
  value?: string;

  override render() {
    return html`
      <input 
        type="checkbox" 
        .checked=${this.checked} 
        .disabled=${this.disabled} 
        .indeterminate=${this.indeterminate}
        name=${this.name ?? ''}
        value=${this.value ?? ''}
        aria-checked=${this.indeterminate ? 'mixed' : (this.checked ? 'true' : 'false')}
        @change=${this.onChange} 
      />
      <slot></slot>
    `;
  }

  onChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (this.indeterminate) {
      this.indeterminate = false;
    }
    this.checked = target.checked;
    this.dispatchEvent(
      new CustomEvent('nr-change', {
        bubbles: true,
        composed: true,
        detail: {
          value: this.checked,
        },
      })
    );
  }
}
