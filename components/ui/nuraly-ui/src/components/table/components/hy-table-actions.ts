import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {styles} from './table-actions.style.js';
import '../../button/hy-button.component.js';
import {Sizes} from '../table.types.js';

@customElement('hy-table-actions')
export class HyTableActions extends LitElement {
  @property() selectedItems!: number;
  @property({type: Sizes, reflect: true}) size: Sizes = Sizes.Normal;

  _onCancelSelection() {
    this.dispatchEvent(new CustomEvent('cancel-selection'));
  }
  override render() {
    return html`
      <div class="actions-container">
        <span>${this.selectedItems} selected</span>
        <button @click=${this._onCancelSelection}>Cancel</button>
      </div>
    `;
  }
  static override styles = styles;
}
