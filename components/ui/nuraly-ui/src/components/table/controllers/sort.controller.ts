/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { BaseTableController } from './base.controller.js';
import { SortOrder, SortValue } from '../table.types.js';

/**
 * Sort controller manages column sorting logic
 */
export class TableSortController extends BaseTableController {
  /**
   * Handle column sort order change
   */
  handleSortOrderChange(index: number): void {
    try {
      if (index !== this.host.sortAttribute.index) {
        this.host.sortAttribute.index = index;
        this.host.sortAttribute.order = SortOrder.Ascending;
      } else {
        if (this.host.sortAttribute.order === SortOrder.Default) {
          this.host.sortAttribute.order = SortOrder.Ascending;
        } else if (this.host.sortAttribute.order === SortOrder.Ascending) {
          this.host.sortAttribute.order = SortOrder.Descending;
        } else {
          this.host.sortAttribute.order = SortOrder.Default;
        }
      }
      
      this.host.sortAttribute = { ...this.host.sortAttribute };
      this.requestUpdate();
    } catch (error) {
      this.handleError(error as Error, 'handleSortOrderChange');
    }
  }

  /**
   * Sort rows based on current sort attribute
   */
  sort(): void {
    try {
      if (!this.host.rowsCopy.length) {
        return;
      }

      const sortOrder =
        this.host.sortAttribute.order === SortOrder.Default
          ? SortValue.Default
          : this.host.sortAttribute.order === SortOrder.Ascending
          ? SortValue.Ascending
          : SortValue.Descending;

      this.host.rowsCopy.sort((a, b) => {
        const key = this.host.headers[this.host.sortAttribute.index].key;
        const stringifyA = JSON.stringify(a[key]);
        const stringifyB = JSON.stringify(b[key]);
        const result = stringifyA < stringifyB ? -1 : stringifyA > stringifyB ? 1 : 0;
        return result * sortOrder;
      });

      this.dispatchEvent(
        new CustomEvent('onSort', {
          bubbles: true,
          composed: true,
          detail: { value: this.host.rowsCopy }
        })
      );

      this.requestUpdate();
    } catch (error) {
      this.handleError(error as Error, 'sort');
    }
  }

  /**
   * Reset sort to original row order
   */
  resetSort(): void {
    try {
      this.host.rowsCopy.sort((copyA, copyB) => {
        const positionInOriginalArrayA = this.host.rows.findIndex(
          (originalA) => JSON.stringify(originalA) === JSON.stringify(copyA)
        );
        const positionInOriginalArrayB = this.host.rows.findIndex(
          (originalB) => JSON.stringify(originalB) === JSON.stringify(copyB)
        );
        return positionInOriginalArrayA > positionInOriginalArrayB
          ? SortValue.Ascending
          : positionInOriginalArrayA < positionInOriginalArrayB
          ? SortValue.Descending
          : SortValue.Default;
      });

      this.requestUpdate();
    } catch (error) {
      this.handleError(error as Error, 'resetSort');
    }
  }

  /**
   * Check if sorting is active
   */
  isSortActive(): boolean {
    return this.host.sortAttribute.index > -1;
  }

  /**
   * Check if sort order is default
   */
  isSortDefault(): boolean {
    return this.host.sortAttribute.order === SortOrder.Default;
  }
}
