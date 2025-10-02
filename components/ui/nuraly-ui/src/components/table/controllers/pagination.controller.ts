/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { BaseTableController } from './base.controller.js';

/**
 * Pagination controller manages page state and navigation
 */
export class TablePaginationController extends BaseTableController {
  /**
   * Initialize or reset pagination state
   */
  initPagination(): void {
    try {
      this.host.displayedRows = this.host.rowsCopy.slice(0, this.host.selectedItemPerPage);
      this.host.currentPage = this.host.rowsCopy.length > 0 ? 1 : 0;
      this.requestUpdate();
    } catch (error) {
      this.handleError(error as Error, 'initPagination');
    }
  }

  /**
   * Handle items per page change event
   */
  handleItemPerPageChange(selectedItemPerPage: number): void {
    try {
      this.host.selectedItemPerPage = selectedItemPerPage;
      this.initPagination();
    } catch (error) {
      this.handleError(error as Error, 'handleItemPerPageChange');
    }
  }

  /**
   * Handle page navigation event
   */
  handlePageChange(page: number): void {
    try {
      this.host.currentPage = page;
      const startIndex = (page - 1) * this.host.selectedItemPerPage;
      const endIndex = startIndex + this.host.selectedItemPerPage;
      
      this.host.displayedRows = this.host.rowsCopy.slice(startIndex, endIndex);
      
      this.dispatchEvent(
        new CustomEvent('onPaginate', {
          bubbles: true,
          composed: true,
          detail: { value: this.host.currentPage }
        })
      );
      
      this.requestUpdate();
    } catch (error) {
      this.handleError(error as Error, 'handlePageChange');
    }
  }

  /**
   * Get total number of pages
   */
  getTotalPages(): number {
    return Math.ceil(this.host.rowsCopy.length / this.host.selectedItemPerPage);
  }

  /**
   * Check if next page is available
   */
  hasNextPage(): boolean {
    return this.host.currentPage < this.getTotalPages();
  }

  /**
   * Check if previous page is available
   */
  hasPreviousPage(): boolean {
    return this.host.currentPage > 1;
  }
}
