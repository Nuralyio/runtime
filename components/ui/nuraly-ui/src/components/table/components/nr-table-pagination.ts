import { LitElement, PropertyValueMap, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { NuralyUIBaseMixin } from '../../../shared/base-mixin.js';
import { styles } from './table-pagination.style.js';
import { repeat } from 'lit/directives/repeat.js';
import { Sizes } from '../table.types.js';

@customElement('nr-table-pagination')
export class HyTablePagination extends NuralyUIBaseMixin(LitElement) {
  @property()
  numberOfItems!: number;
  @property()
  itemPerPage!: number[];
  @property()
  selectedItemPerPage!: number;
  @property()
  currentPage!: number;
  @property({type: Sizes, reflect: true}) size!: Sizes;

  @state()
  numberOfPages!: number;
  @state()
  fromItem!: number;
  @state()
  toItem!: number;
  @state()
  enableNext = true;
  @state()
  enablePrevious = true;

  override willUpdate(_changedProperties: PropertyValueMap<this>): void {
    this.numberOfPages = Math.ceil(this.numberOfItems / this.selectedItemPerPage);
    this.fromItem =
      this.currentPage > 0 ? this.currentPage * this.selectedItemPerPage - this.selectedItemPerPage + 1 : 0;
    this.toItem =
      this.currentPage * this.selectedItemPerPage <= this.numberOfItems
        ? this.currentPage * this.selectedItemPerPage
        : this.numberOfItems;
    this.enableNext = this.toItem < this.numberOfItems;
    this.enablePrevious = this.fromItem > 1;
  }

  _handleItemPerPageChange(itemPerPageEvent: Event) {
    this.selectedItemPerPage = +(itemPerPageEvent.target as HTMLSelectElement).value;
    this.dispatchEvent(new CustomEvent('item-per-page', {detail: {selectedItemPerPage: this.selectedItemPerPage}}));
  }

  _nextPage() {
    this.currentPage++;
    this.dispatchEvent(new CustomEvent('update-page', {detail: {page: this.currentPage}}));
  }
  _previousPage() {
    this.currentPage--;
    this.dispatchEvent(new CustomEvent('update-page', {detail: {page: this.currentPage}}));
  }

  override render() {
    return html`
      <div class="pagination-container">
        <div class="left-content">
          <span class="select-details">
            Items per page:
            <select @change=${this._handleItemPerPageChange}>
              ${repeat(this.itemPerPage, (item) => html` <option value=${item}>${item}</option> `)}
            </select>
          </span>
          <span class="items-details"> ${this.fromItem} - ${this.toItem} of ${this.numberOfItems} items</span>
        </div>

        <div class="right-content">
          <span class="page-details"> ${this.currentPage} of ${this.numberOfPages} pages </span>
          <span class="icon-container">
            <nr-icon
              class="left-arrow"
              data-enabled=${this.enablePrevious}
              name="caret-left"
              @click=${this.enablePrevious ? this._previousPage : nothing}
            ></nr-icon>

            <nr-icon
              class="right-arrow"
              data-enabled=${this.enableNext}
              name="caret-right"
              @click=${this.enableNext ? this._nextPage : nothing}
            ></nr-icon>
          </span>
        </div>
      </div>
    `;
  }
  static override styles = styles;
}
