/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, PropertyValueMap, html, nothing } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';
import styles from './table.style.js';
import { IHeader, SelectionMode, Sizes, SortAttribute, SortOrder, EMPTY_STRING } from './table.types.js';

// Import required components
import '../select/select.component.js';
import '../icon/icon.component.js';
import '../radio/radio.component.js';

// Import controllers
import {
  TableSelectionController,
  TablePaginationController,
  TableSortController,
  TableFilterController
} from './controllers/index.js';

// Import interfaces
import { TableHost } from './interfaces/index.js';

// Import templates
import {
  renderPaginationTemplate,
  renderContentTemplate,
  renderActionsTemplate,
  renderFilterTemplate
} from './templates/index.js';

/**
 * Advanced table component with sorting, filtering, pagination, selection, and fixed columns.
 * 
 * @example
 * ```html
 * <!-- Basic table with fixed header -->
 * <nr-table
 *   .headers=${headers}
 *   .rows=${data}
 *   size="normal"
 *   selectionMode="multiple"
 *   fixedHeader
 *   .scrollConfig=${{ y: 400 }}>
 * </nr-table>
 * 
 * <!-- Table with fixed columns -->
 * <nr-table
 *   .headers=${[
 *     { name: 'ID', key: 'id', fixed: 'left', width: 80 },
 *     { name: 'Name', key: 'name', fixed: 'left', width: 150 },
 *     { name: 'Email', key: 'email' },
 *     { name: 'Status', key: 'status' }
 *   ]}
 *   .rows=${data}
 *   .scrollConfig=${{ x: 800 }}>
 * </nr-table>
 * ```
 * 
 * @fires onPaginate - Fired when pagination changes
 * @fires nr-select - Fired when row selection changes
 * @fires onSearch - Fired when search/filter is applied
 * @fires onSort - Fired when sorting is applied
 */
@customElement('nr-table')
export class HyTable extends NuralyUIBaseMixin(LitElement) implements TableHost {
  static override styles = styles;

  @property({ type: Array }) headers!: IHeader[];
  @property({ type: Array }) rows: any[] = [];
  @property({ type: String }) size: Sizes = Sizes.Normal;
  @property({ type: Boolean }) withFilter = false;
  @property({ type: String }) expandable: string | undefined;
  @property({ type: String }) selectionMode: SelectionMode | undefined;
  @property({ type: Boolean }) fixedHeader = false;
  @property({ type: Object }) scrollConfig: { x?: number | string; y?: number | string } | undefined;

  @state() itemPerPage = [5, 10, 15, 20];
  @state() selectedItemPerPage = this.itemPerPage[0];
  @state() displayedRows: any[] = [];
  @state() selectedItems: boolean[] = [];
  @state() currentPage!: number;
  @state() rowsCopy: any[] = [];
  @state() activeSearch = false;
  @state() sortAttribute: SortAttribute = {index: -1, order: SortOrder.Default};
  @state() expand: boolean[] = [];
  @state() showFilterInput = false;
  @state() filterValue = EMPTY_STRING;
  @state() columnFilters: Map<string, string | number> = new Map();
  @state() activeFilterColumn: string | null = null;

  @query('#global-check')
  globalCheck?: HTMLElement;

  override requiredComponents = ['nr-select', 'nr-icon', 'nr-checkbox', 'nr-radio'];

  // Controllers
  private selectionController = new TableSelectionController(this);
  private paginationController = new TablePaginationController(this);
  private sortController = new TableSortController(this);
  private filterController = new TableFilterController(this);

  override connectedCallback(): void {
    super.connectedCallback();
    this.selectionController.initSelection();
  }

  override updated(_changedProperties: PropertyValueMap<this> | Map<PropertyKey, unknown>): void {
    if (this.globalCheck && (_changedProperties.has('selectedItems') || _changedProperties.has('currentPage') || _changedProperties.has('displayedRows'))) {
      const checkbox = this.globalCheck as any;
      
      // Get the selection state for the current page only
      const startIndex = (this.currentPage - 1) * this.selectedItemPerPage;
      const endIndex = Math.min(startIndex + this.displayedRows.length, this.selectedItems.length);
      const currentPageSelections = this.selectedItems.slice(startIndex, endIndex);
      
      if (currentPageSelections.length > 0 && currentPageSelections.every((isSelected) => isSelected)) {
        checkbox.checked = true;
        checkbox.indeterminate = false;
      } else if (currentPageSelections.some((isSelected) => isSelected)) {
        checkbox.checked = false;
        checkbox.indeterminate = true;
      } else {
        checkbox.checked = false;
        checkbox.indeterminate = false;
      }
    }
    if (this.showFilterInput && _changedProperties.has('showFilterInput')) {
      this.shadowRoot?.querySelector('input')?.focus();
    }
  }

  override willUpdate(_changedProperties: PropertyValueMap<this>) {
    if (_changedProperties.has('rows')) {
      this.expand = Array(this.rows.length).fill(false);
    }
    if (_changedProperties.has('sortAttribute') && this.sortController.isSortActive()) {
      this._initPagination();
      this.selectionController.initSelection();
    }
    if (_changedProperties.has('rowsCopy')) {
      if (this.filterController.isSearchActive()) {
        this._initPagination();
      }
    }
    if (_changedProperties.has('activeSearch') || _changedProperties.has('rows')) {
      if (!this.filterController.isSearchActive()) {
        this.rowsCopy = [...this.rows];
        this._initPagination();
      }
    }
  }

  /**
   * Initialize or reset pagination state
   */
  private _initPagination() {
    if (this.sortController.isSortActive()) {
      if (!this.sortController.isSortDefault()) {
        this.sortController.sort();
      } else {
        this.sortController.resetSort();
      }
    }
    this.paginationController.initPagination();
  }

  /**
   * Handle items per page change event
   */
  _handleItemPerPage(itemPerPageEvent: CustomEvent) {
    const value = itemPerPageEvent.detail.value || itemPerPageEvent.detail.selectedItemPerPage;
    this.paginationController.handleItemPerPageChange(Number(value));
  }

  /**
   * Handle page navigation event
   */
  _handleUpdatePage(updatePageEvent: CustomEvent) {
    this.paginationController.handlePageChange(updatePageEvent.detail.page);
  }

  /**
   * Handle check all rows event
   */
  _handleCheckAll(checkAllEvent: CustomEvent) {
    this.selectionController.handleCheckAll(checkAllEvent.detail.isEveryItemChecked);
  }

  /**
   * Handle check single row event
   */
  _handleCheckOne(checkOneEvent: CustomEvent) {
    this.selectionController.handleCheckOne(checkOneEvent.detail.index, checkOneEvent.detail.value);
  }

  /**
   * Handle select single row event (radio button mode)
   */
  _handleSelectOne(selectOneEvent: CustomEvent) {
    this.selectionController.handleSelectOne(selectOneEvent.detail.index);
  }

  /**
   * Handle cancel selection action
   */
  _handleCancelSelection() {
    this.selectionController.cancelSelection();
  }

  /**
   * Handle search/filter input
   */
  _handleSearch(searchEvent: CustomEvent) {
    this.filterController.handleSearch(searchEvent.detail.value);
  }

  /**
   * Handle column sort order change
   */
  _handleSortOrder(sortOrderEvent: CustomEvent) {
    this.sortController.handleSortOrderChange(sortOrderEvent.detail.index);
  }

  /**
   * Toggle expanded content for a row
   */
  private _showExpandedContent(index: number) {
    this.expand[index] = !this.expand[index];
    this.requestUpdate();
  }

  /**
   * Toggle filter input visibility
   */
  private _toggleFilterInput() {
    this.showFilterInput = !this.showFilterInput;
  }

  /**
   * Handle filter input change
   */
  private _handleFilterInputChange(event: Event) {
    this.filterValue = (event.target as HTMLInputElement).value;
    this.filterController.handleSearch(this.filterValue);
  }

  /**
   * Render the table component with all templates
   */
  override render() {
    const numberOfPages = Math.ceil(this.rowsCopy.length / this.selectedItemPerPage);
    const fromItem = this.currentPage > 0 
      ? this.currentPage * this.selectedItemPerPage - this.selectedItemPerPage + 1 
      : 0;
    const toItem = this.currentPage * this.selectedItemPerPage <= this.rowsCopy.length
      ? this.currentPage * this.selectedItemPerPage
      : this.rowsCopy.length;
    const enableNext = toItem < this.rowsCopy.length;
    const enablePrevious = fromItem > 1;

    return html`
      ${this.selectionMode && !this.withFilter && this.selectionController.hasSelection()
        ? renderActionsTemplate({
            selectedItems: this.selectionController.getSelectedCount(),
            size: this.size,
            onCancelSelection: () => this._handleCancelSelection()
          })
        : this.withFilter
        ? html`
            <div class="filter-container">
              ${renderFilterTemplate({
                showInput: this.showFilterInput,
                value: this.filterValue,
                onToggleInput: () => this._toggleFilterInput(),
                onChange: (e) => this._handleFilterInputChange(e)
              })}
            </div>
          `
        : nothing}

      <div class="table-content-wrapper ${this.fixedHeader ? 'fixed-header' : ''}" 
           style="${this.scrollConfig?.y ? `${this.fixedHeader ? 'height' : 'max-height'}: ${typeof this.scrollConfig.y === 'number' ? this.scrollConfig.y + 'px' : this.scrollConfig.y};` : ''}
                  ${this.scrollConfig?.x ? `${this.fixedHeader ? 'width' : 'max-width'}: ${typeof this.scrollConfig.x === 'number' ? this.scrollConfig.x + 'px' : this.scrollConfig.x};` : ''}">
        ${renderContentTemplate({
          headers: this.headers,
          rows: this.displayedRows,
          expandable: this.expandable && !this.selectionMode ? this.expandable : undefined,
          selectionMode: this.selectionMode && !this.withFilter ? this.selectionMode : undefined,
          selectedItems: this.selectedItems,
          currentPage: this.currentPage,
          itemPerPage: this.selectedItemPerPage,
          sortAttribute: this.sortAttribute,
          expand: this.expand,
          columnFilters: this.columnFilters,
          activeFilterColumn: this.activeFilterColumn,
          onCheckAll: () => {
            const startIndex = (this.currentPage - 1) * this.selectedItemPerPage;
            const endIndex = Math.min(startIndex + this.selectedItemPerPage, this.selectedItems.length);
            const currentPageItems = this.selectedItems.slice(startIndex, endIndex);
            const isEveryItemChecked = currentPageItems.every(i => i) && currentPageItems.length > 0;
            this._handleCheckAll({ detail: { isEveryItemChecked } } as CustomEvent);
          },
          onCheckOne: (e, index) => this._handleCheckOne({ detail: { index, value: (e as CustomEvent).detail.checked } } as CustomEvent),
          onSelectOne: (index) => this._handleSelectOne({ detail: { index } } as CustomEvent),
          onUpdateSort: (index) => this._handleSortOrder({ detail: { index } } as CustomEvent),
          onShowExpandedContent: (index) => this._showExpandedContent(index),
          onToggleColumnFilter: (columnKey) => this.filterController.toggleColumnFilterDropdown(columnKey),
          onApplyColumnFilter: (columnKey, value) => this.filterController.applyColumnFilter(columnKey, value),
          onClearColumnFilter: (columnKey) => this.filterController.clearColumnFilter(columnKey)
        })}
      </div>

      ${renderPaginationTemplate({
        numberOfItems: this.rowsCopy.length,
        itemPerPage: this.itemPerPage,
        selectedItemPerPage: this.selectedItemPerPage,
        currentPage: this.currentPage,
        size: this.size,
        numberOfPages,
        fromItem,
        toItem,
        enableNext,
        enablePrevious,
        onItemPerPageChange: (e) => this._handleItemPerPage(e),
        onNextPage: () => {
          this.currentPage++;
          this._handleUpdatePage({ detail: { page: this.currentPage } } as CustomEvent);
        },
        onPreviousPage: () => {
          this.currentPage--;
          this._handleUpdatePage({ detail: { page: this.currentPage } } as CustomEvent);
        }
      })}
    `;
  }
}
