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
      if (this.host.serverSide) {
        // Server-side: displayedRows is set directly from rows
        this.host.displayedRows = [...this.host.rows];
        this.host.currentPage = this.host.rows.length > 0 ? 1 : 0;
      } else {
        // Client-side: slice from rowsCopy
        this.host.displayedRows = this.host.rowsCopy.slice(0, this.host.selectedItemPerPage);
        this.host.currentPage = this.host.rowsCopy.length > 0 ? 1 : 0;
      }
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
      this.host.currentPage = 1; // Reset to first page

      if (this.host.serverSide) {
        // Emit event for server-side consumers to refetch
        this.dispatchEvent(
          new CustomEvent('onPaginate', {
            bubbles: true,
            composed: true,
            detail: {
              page: 1,
              limit: selectedItemPerPage,
              offset: 0
            }
          })
        );
        this.requestUpdate();
      } else {
        this.initPagination();
      }
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

      // Only slice client-side when not in server-side mode
      if (!this.host.serverSide) {
        this.host.displayedRows = this.host.rowsCopy.slice(startIndex, endIndex);
      }

      // Emit enhanced event with pagination info for server-side consumers
      this.dispatchEvent(
        new CustomEvent('onPaginate', {
          bubbles: true,
          composed: true,
          detail: {
            page: this.host.currentPage,
            limit: this.host.selectedItemPerPage,
            offset: startIndex
          }
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
    const total = this.host.serverSide
      ? this.host.totalCount
      : this.host.rowsCopy.length;
    return Math.ceil(total / this.host.selectedItemPerPage);
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
