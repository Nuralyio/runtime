/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { BaseTableController } from './base.controller.js';

/**
 * Filter controller manages search/filter logic
 */
export class TableFilterController extends BaseTableController {
  /**
   * Handle search/filter input
   */
  handleSearch(searchValue: string): void {
    try {
      if (searchValue.trim().length > 0) {
        this.host.activeSearch = true;
        this.host.rowsCopy = this.host.rows.filter((rowValue) => {
          return Object.values(rowValue).some((attributeValue) => {
            const stringValue = JSON.stringify(attributeValue);
            return stringValue.includes(searchValue);
          });
        });

        this.dispatchEvent(
          new CustomEvent('onSearch', {
            bubbles: true,
            composed: true,
            detail: { value: this.host.rowsCopy }
          })
        );
      } else {
        this.clearSearch();
      }

      this.requestUpdate();
    } catch (error) {
      this.handleError(error as Error, 'handleSearch');
    }
  }

  /**
   * Clear search/filter
   */
  clearSearch(): void {
    try {
      this.host.activeSearch = false;
      this.requestUpdate();
    } catch (error) {
      this.handleError(error as Error, 'clearSearch');
    }
  }

  /**
   * Check if search is active
   */
  isSearchActive(): boolean {
    return this.host.activeSearch;
  }

  /**
   * Get filtered row count
   */
  getFilteredCount(): number {
    return this.host.rowsCopy.length;
  }

  /**
   * Apply column filter
   */
  applyColumnFilter(columnKey: string, filterValue: string | number): void {
    try {
      if (filterValue === '' || filterValue === null || filterValue === undefined) {
        this.host.columnFilters.delete(columnKey);
      } else {
        this.host.columnFilters.set(columnKey, filterValue);
      }
      
      this.filterRows();
      this.requestUpdate();
    } catch (error) {
      this.handleError(error as Error, 'applyColumnFilter');
    }
  }

  /**
   * Clear specific column filter
   */
  clearColumnFilter(columnKey: string): void {
    try {
      this.host.columnFilters.delete(columnKey);
      this.filterRows();
      this.requestUpdate();
    } catch (error) {
      this.handleError(error as Error, 'clearColumnFilter');
    }
  }

  /**
   * Clear all column filters
   */
  clearAllColumnFilters(): void {
    try {
      this.host.columnFilters.clear();
      this.filterRows();
      this.requestUpdate();
    } catch (error) {
      this.handleError(error as Error, 'clearAllColumnFilters');
    }
  }

  /**
   * Toggle filter dropdown for a column
   */
  toggleColumnFilterDropdown(columnKey: string | null): void {
    try {
      this.host.activeFilterColumn = this.host.activeFilterColumn === columnKey ? null : columnKey;
      this.requestUpdate();
    } catch (error) {
      this.handleError(error as Error, 'toggleColumnFilterDropdown');
    }
  }

  /**
   * Filter rows based on active column filters and global search
   */
  private filterRows(): void {
    let filteredRows = [...this.host.rows];

    // Apply column filters
    if (this.host.columnFilters.size > 0) {
      filteredRows = filteredRows.filter((row) => {
        return Array.from(this.host.columnFilters.entries()).every(([columnKey, filterValue]) => {
          const cellValue = row[columnKey];
          
          if (cellValue === null || cellValue === undefined) {
            return false;
          }

          const cellString = String(cellValue).toLowerCase();
          const filterString = String(filterValue).toLowerCase();

          return cellString.includes(filterString);
        });
      });
    }

    // Apply global search if active
    if (this.host.activeSearch && this.host.filterValue) {
      filteredRows = filteredRows.filter((row) => {
        return Object.values(row).some((value) => {
          const stringValue = JSON.stringify(value).toLowerCase();
          return stringValue.includes(this.host.filterValue.toLowerCase());
        });
      });
    }

    this.host.rowsCopy = filteredRows;
    this.host.activeSearch = this.host.columnFilters.size > 0 || (this.host.filterValue?.length > 0);
  }
}
