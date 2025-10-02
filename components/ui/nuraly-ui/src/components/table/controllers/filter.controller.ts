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
}
