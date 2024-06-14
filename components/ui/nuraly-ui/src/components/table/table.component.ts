import styles from './table.style.js';
import {LitElement, PropertyValueMap, html, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import './components/hy-table-actions';
import './components/hy-table-filter';
import './components/hy-table-pagination';
import './components/hy-table-content';
import {IHeader, SelectionMode, Sizes, SortAttribute, SortOrder, SortValue} from './table.types';

@customElement('hy-table')
export class HyTable extends LitElement {
  static override styles = styles;

  @property({type: Array}) headers!: IHeader[];
  @property({type: Array}) rows: [] = [];
  @property() size = Sizes.Normal;
  @property({type: Boolean}) withFilter = false;
  @property({type: String}) expandable: string | undefined;
  @property() selectionMode: SelectionMode | undefined;

  @state() itemPerPage = [5, 10, 15, 20];
  @state() selectedItemPerPage = this.itemPerPage[0];
  @state() displayedRows = [];
  @state() selectedItems: boolean[] = [];
  @state() currentPage!: number;
  @state() rowsCopy: [] = [];
  @state() activeSearch = false;
  @state() sortAttribute: SortAttribute = {index: -1, order: SortOrder.Default};

  override connectedCallback(): void {
    super.connectedCallback();
    this._initSelection();
  }

  override willUpdate(_changedProperties: PropertyValueMap<this>) {
    if (_changedProperties.has('sortAttribute') && this.sortAttribute.index > -1) {
      this._initPagination();
      this._initSelection();
    }
    if (_changedProperties.has('rowsCopy')) {
      if (this.activeSearch) {
        this._initPagination();
      }
    }
    if (_changedProperties.has('activeSearch')) {
      if (!this.activeSearch) {
        this.rowsCopy = [...this.rows];
        this._initPagination();
      }
    }
  }

  _initSelection() {
    if (this.selectionMode) this.selectedItems = Array(this.rows.length).fill(false);
  }
  _initPagination() {
    if (this.sortAttribute.index > -1) {
      if (this.sortAttribute.order != SortOrder.Default) this._sort();
      else this._resetSort();
    }
    this.displayedRows = this.rowsCopy.slice(0, this.selectedItemPerPage);
    this.currentPage = this.rowsCopy.length > 0 ? 1 : 0;
  }

  _handleItemPerPage(itemPerPageEvent: CustomEvent) {
    this.selectedItemPerPage = itemPerPageEvent.detail.selectedItemPerPage;
    this._initPagination();
  }

  _handleUpdatePage(updatePageEvent: CustomEvent) {
    this.currentPage = updatePageEvent.detail.page;
    this.displayedRows = this.rowsCopy.slice(
      (updatePageEvent.detail.page - 1) * this.selectedItemPerPage,
      (updatePageEvent.detail.page - 1) * this.selectedItemPerPage + this.selectedItemPerPage
    );
  }

  _handleCheckAll(checkAllEvent: CustomEvent) {
    const everyItemChecked = checkAllEvent.detail.isEveryItemChecked;
    this.selectedItems = everyItemChecked ? this.selectedItems.map(() => false) : this.selectedItems.map(() => true);
  }
  _handleCheckOne(checkOneEvent: CustomEvent) {
    const indexSelected = checkOneEvent.detail.index;
    this.selectedItems[indexSelected + (this.currentPage - 1) * this.selectedItemPerPage] = checkOneEvent.detail.value;
    this.selectedItems = [...this.selectedItems];
  }
  _handleSelectOne(selectOneEvent: CustomEvent) {
    const previousSelected = this.selectedItems.findIndex((isSelected) => isSelected);
    if (previousSelected > -1) {
      this.selectedItems[previousSelected] = false;
    }
    const indexSelected = selectOneEvent.detail.index;
    this.selectedItems[indexSelected + (this.currentPage - 1) * this.selectedItemPerPage] = true;
    this.selectedItems = [...this.selectedItems];
  }

  _handleCancelSelection() {
    this.selectedItems = this.selectedItems.map(() => false);
  }

  _handleSearch(searchEvent: CustomEvent) {
    const searchValue = searchEvent.detail.value;
    if ((searchValue as string).trim().length > 0) {
      this.activeSearch = true;
      this.rowsCopy = this.rows.filter((rowValue) => {
        return Object.values(rowValue).some((attributeValue) => {
          const stringValue = JSON.stringify(attributeValue);
          return stringValue.includes(searchValue);
        });
      }) as [];
    } else {
      this.activeSearch = false;
    }
  }

  _handleSortOrder(sortOrderEvent: CustomEvent) {
    const index = sortOrderEvent.detail.index;
    if (index != this.sortAttribute.index) {
      this.sortAttribute.index = index;
      this.sortAttribute.order = SortOrder.Ascending;
    } else {
      if (this.sortAttribute.order == SortOrder.Default) this.sortAttribute.order = SortOrder.Ascending;
      else if (this.sortAttribute.order == SortOrder.Ascending) this.sortAttribute.order = SortOrder.Descending;
      else this.sortAttribute.order = SortOrder.Default;
    }
    this.sortAttribute = {...this.sortAttribute};
  }

  _sort() {
    if (this.rowsCopy.length) {
      const sortOrder =
        this.sortAttribute.order == SortOrder.Default
          ? SortValue.Default
          : this.sortAttribute.order == SortOrder.Ascending
          ? SortValue.Ascending
          : SortValue.Descending;
      this.rowsCopy.sort((a, b) => {
        const stringifyA = JSON.stringify(a[this.headers[this.sortAttribute.index].key]);
        const stringifyB = JSON.stringify(b[this.headers[this.sortAttribute.index].key]);
        const result = stringifyA < stringifyB ? -1 : stringifyA > stringifyB ? 1 : 0;
        return result * sortOrder;
      });
    }
  }

  _resetSort() {
    this.rowsCopy.sort((copyA, copyB) => {
      const positionInOriginalArrayA = this.rows.findIndex(
        (originalA) => JSON.stringify(originalA) === JSON.stringify(copyA)
      );
      const positionInOriginalArrayB = this.rows.findIndex(
        (originalB) => JSON.stringify(originalB) === JSON.stringify(copyB)
      );
      return positionInOriginalArrayA > positionInOriginalArrayB
        ? SortValue.Ascending
        : positionInOriginalArrayA < positionInOriginalArrayB
        ? SortValue.Descending
        : SortValue.Default;
    });
  }
  override render() {
    return html`${this.selectionMode && !this.withFilter && this.selectedItems.some((isSelected) => isSelected)
        ? html`<hy-table-actions
            .selectedItems=${this.selectedItems.filter((isSelected) => isSelected).length}
            .size=${this.size}
            @cancel-selection=${this._handleCancelSelection}
          ></hy-table-actions>`
        : this.withFilter
        ? html`
            <div class="filter-container">
              <hy-table-filter @value-change=${this._handleSearch}></hy-table-filter>
            </div>
          `
        : nothing}
      <hy-table-content
        .headers=${this.headers}
        .rows=${this.displayedRows}
        .expandable=${this.expandable && !this.selectionMode ? this.expandable : nothing}
        .selectionMode=${this.selectionMode && !this.withFilter ? this.selectionMode : nothing}
        .selectedItems=${this.selectedItems}
        .currentPage=${this.currentPage}
        .itemPerPage=${this.selectedItemPerPage}
        .sortAttribute=${this.sortAttribute}
        .size=${this.size}
        @check-all=${this._handleCheckAll}
        @check-one=${this._handleCheckOne}
        @select-one=${this._handleSelectOne}
        @update-sort=${this._handleSortOrder}
      ></hy-table-content>

      <hy-table-pagination
        .numberOfItems=${this.rowsCopy.length}
        .currentPage=${this.currentPage}
        .itemPerPage=${this.itemPerPage}
        .selectedItemPerPage=${this.selectedItemPerPage}
        .size=${this.size}
        @item-per-page=${this._handleItemPerPage}
        @update-page=${this._handleUpdatePage}
      ></hy-table-pagination> `;
  }
}
