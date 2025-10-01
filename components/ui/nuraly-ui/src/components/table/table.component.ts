/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {LitElement, PropertyValueMap, html, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {NuralyUIBaseMixin} from '../../shared/base-mixin.js';
import styles from './table.style.js';
import {IHeader, SelectionMode, Sizes, SortAttribute, SortOrder, SortValue} from './table.types.js';
import './components/nr-table-actions.js';
import './components/nr-table-filter.js';
import './components/nr-table-pagination.js';
import './components/nr-table-content.js';

/**
 * Advanced table component with sorting, filtering, pagination, and selection capabilities.
 * 
 * @example
 * ```html
 * <nr-table
 *   .headers=${headers}
 *   .rows=${data}
 *   size="normal"
 *   selectionMode="multiple">
 * </nr-table>
 * ```
 * 
 * @fires onPaginate - Fired when pagination changes
 * @fires onSelect - Fired when row selection changes
 * @fires onSearch - Fired when search/filter is applied
 * @fires onSort - Fired when sorting is applied
 */
@customElement('nr-table')
export class HyTable extends NuralyUIBaseMixin(LitElement) {
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
    if (_changedProperties.has('activeSearch') || _changedProperties.has('rows')) {
      if (!this.activeSearch) {
        this.rowsCopy = [...this.rows];
        this._initPagination();
      }
    }
  }

  /**
   * Initialize selection state array based on rows length
   */
  _initSelection() {
    if (this.selectionMode) this.selectedItems = Array(this.rows.length).fill(false);
  }

  /**
   * Initialize or reset pagination state
   */
  _initPagination() {
    if (this.sortAttribute.index > -1) {
      if (this.sortAttribute.order != SortOrder.Default) this._sort();
      else this._resetSort();
    }
    this.displayedRows = this.rowsCopy.slice(0, this.selectedItemPerPage);
    this.currentPage = this.rowsCopy.length > 0 ? 1 : 0;
  }

  /**
   * Handle items per page change event
   */
  _handleItemPerPage(itemPerPageEvent: CustomEvent) {
    this.selectedItemPerPage = itemPerPageEvent.detail.selectedItemPerPage;
    this._initPagination();
  }

  /**
   * Handle page navigation event
   */
  _handleUpdatePage(updatePageEvent: CustomEvent) {
    this.currentPage = updatePageEvent.detail.page;
    this.displayedRows = this.rowsCopy.slice(
      (updatePageEvent.detail.page - 1) * this.selectedItemPerPage,
      (updatePageEvent.detail.page - 1) * this.selectedItemPerPage + this.selectedItemPerPage
    );
    this.dispatchEvent(new CustomEvent('onPaginate',{bubbles:true,composed:true,detail:{value:this.currentPage}}))

  }

  /**
   * Handle check all rows event
   */
  _handleCheckAll(checkAllEvent: CustomEvent) {
    const everyItemChecked = checkAllEvent.detail.isEveryItemChecked;
    this.selectedItems = everyItemChecked ? this.selectedItems.map(() => false) : this.selectedItems.map(() => true);
    this.dispatchEvent(new CustomEvent('onSelect', {bubbles: true, composed: true, detail: {value: this.rowsCopy.filter((_, i) => this.selectedItems[i])}}))
  }

  /**
   * Handle check single row event
   */
  _handleCheckOne(checkOneEvent: CustomEvent) {
    const indexSelected = checkOneEvent.detail.index;
    this.selectedItems[indexSelected + (this.currentPage - 1) * this.selectedItemPerPage] = checkOneEvent.detail.value;
    this.selectedItems = [...this.selectedItems];
    this.dispatchEvent(new CustomEvent('onSelect', {bubbles: true, composed: true, detail: {value: this.rowsCopy.filter((_, i) => this.selectedItems[i])}}))
  }

  /**
   * Handle select single row event (radio button mode)
   */
  _handleSelectOne(selectOneEvent: CustomEvent) {
    const previousSelected = this.selectedItems.findIndex((isSelected) => isSelected);
    if (previousSelected > -1) {
      this.selectedItems[previousSelected] = false;
    }
    const indexSelected = selectOneEvent.detail.index;
    this.selectedItems[indexSelected + (this.currentPage - 1) * this.selectedItemPerPage] = true;
    this.selectedItems = [...this.selectedItems];
    this.dispatchEvent(new CustomEvent('onSelect', {bubbles: true, composed: true, detail: {value: this.rowsCopy.filter((_, i) => this.selectedItems[i])}}))
  }

  /**
   * Handle cancel selection action
   */
  _handleCancelSelection() {
    this.selectedItems = this.selectedItems.map(() => false);
    this.dispatchEvent(new CustomEvent('onSelect', {bubbles: true, composed: true, detail: {value: this.selectedItems}}))
  }

  /**
   * Handle search/filter input
   */
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
      this.dispatchEvent(new CustomEvent('onSearch', {bubbles: true, composed: true, detail: {value: this.rowsCopy}}))
    } else {
      this.activeSearch = false;
    }
  }

  /**
   * Handle column sort order change
   */
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

  /**
   * Sort rows based on current sort attribute
   */
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
      this.dispatchEvent(new CustomEvent('onSort', {bubbles: true, composed: true, detail: {value: this.rowsCopy}}))
    }
  }

  /**
   * Reset sort to original row order
   */
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
  /**
   * Render the table component with all sub-components
   */
  override render() {
    return html`${this.selectionMode && !this.withFilter && this.selectedItems.some((isSelected) => isSelected)
        ? html`<nr-table-actions
            .selectedItems=${this.selectedItems.filter((isSelected) => isSelected).length}
            .size=${this.size}
            @cancel-selection=${this._handleCancelSelection}
          ></nr-table-actions>`
        : this.withFilter
        ? html`
            <div class="filter-container">
              <nr-table-filter @value-change=${this._handleSearch}></nr-table-filter>
            </div>
          `
        : nothing}
      <nr-table-content
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
      ></nr-table-content>

      <nr-table-pagination
        .numberOfItems=${this.rowsCopy.length}
        .currentPage=${this.currentPage}
        .itemPerPage=${this.itemPerPage}
        .selectedItemPerPage=${this.selectedItemPerPage}
        .size=${this.size}
        @item-per-page=${this._handleItemPerPage}
        @update-page=${this._handleUpdatePage}
      ></nr-table-pagination> `;
  }
}
