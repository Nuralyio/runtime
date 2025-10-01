import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styles } from './table-filter.style.js';
import { EMPTY_STRING } from '../table.types.js';

@customElement('nr-table-filter')
export class HyTableFilter extends LitElement {
  @property({reflect: true, type: Boolean})
  showInput = false;

  @state()
  value = EMPTY_STRING;

  override updated() {
    if (this.showInput) {
      this.shadowRoot?.querySelector('input')?.focus();
    }
  }

  _handleInput() {
    this.showInput = !this.showInput;
  }

  _onChange(inputChangeEvent: Event) {
    this.value = (inputChangeEvent.target as HTMLInputElement).value;
    this.dispatchEvent(new CustomEvent('value-change', {detail: {value: this.value}, bubbles: true, composed: true}));
  }
  override render() {
    return html`
      <div class="filter-container">
        ${this.showInput
          ? html` <nr-icon name="search" class="search-icon"></nr-icon>
              <input
                type="text"
                placeholder="search"
                @blur=${!this.value.trim() ? this._handleInput : nothing}
                @input=${this._onChange}
              />`
          : html`<div class="icon-container" @click=${this._handleInput}>
              <nr-icon name="search"></nr-icon>
            </div> `}
      </div>
    `;
  }
  static override styles = styles;
}
