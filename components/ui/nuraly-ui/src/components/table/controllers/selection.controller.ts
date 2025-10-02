/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { BaseTableController } from './base.controller.js';

/**
 * Selection controller manages row selection state and logic
 */
export class TableSelectionController extends BaseTableController {
  /**
   * Initialize selection state array based on rows length
   */
  initSelection(): void {
    if (this.host.selectionMode) {
      this.host.selectedItems = Array(this.host.rows.length).fill(false);
    }
  }

  /**
   * Handle check all rows event (only for current page)
   */
  handleCheckAll(isEveryItemChecked: boolean): void {
    try {
      // Calculate the range for current page
      const startIndex = (this.host.currentPage - 1) * this.host.selectedItemPerPage;
      const endIndex = Math.min(startIndex + this.host.selectedItemPerPage, this.host.selectedItems.length);
      
      // Create a copy of the selection array
      const newSelection = [...this.host.selectedItems];
      
      // Toggle only the items on the current page
      for (let i = startIndex; i < endIndex; i++) {
        newSelection[i] = !isEveryItemChecked;
      }
      
      this.host.selectedItems = newSelection;
      
      const selectedRows = this.host.rowsCopy.filter((_, i) => this.host.selectedItems[i]);
      this.dispatchEvent(
        new CustomEvent('onSelect', {
          bubbles: true,
          composed: true,
          detail: { value: selectedRows }
        })
      );
      
      this.requestUpdate();
    } catch (error) {
      this.handleError(error as Error, 'handleCheckAll');
    }
  }

  /**
   * Handle check single row event
   */
  handleCheckOne(index: number, value: boolean): void {
    try {
      const actualIndex = index + (this.host.currentPage - 1) * this.host.selectedItemPerPage;
      this.host.selectedItems[actualIndex] = value;
      this.host.selectedItems = [...this.host.selectedItems];
      
      const selectedRows = this.host.rowsCopy.filter((_, i) => this.host.selectedItems[i]);
      this.dispatchEvent(
        new CustomEvent('onSelect', {
          bubbles: true,
          composed: true,
          detail: { value: selectedRows }
        })
      );
      
      this.requestUpdate();
    } catch (error) {
      this.handleError(error as Error, 'handleCheckOne');
    }
  }

  /**
   * Handle select single row event (radio button mode)
   */
  handleSelectOne(index: number): void {
    try {
      const previousSelected = this.host.selectedItems.findIndex((isSelected) => isSelected);
      if (previousSelected > -1) {
        this.host.selectedItems[previousSelected] = false;
      }
      
      const actualIndex = index + (this.host.currentPage - 1) * this.host.selectedItemPerPage;
      this.host.selectedItems[actualIndex] = true;
      this.host.selectedItems = [...this.host.selectedItems];
      
      const selectedRows = this.host.rowsCopy.filter((_, i) => this.host.selectedItems[i]);
      this.dispatchEvent(
        new CustomEvent('onSelect', {
          bubbles: true,
          composed: true,
          detail: { value: selectedRows }
        })
      );
      
      this.requestUpdate();
    } catch (error) {
      this.handleError(error as Error, 'handleSelectOne');
    }
  }

  /**
   * Handle cancel selection action
   */
  cancelSelection(): void {
    try {
      this.host.selectedItems = this.host.selectedItems.map(() => false);
      
      this.dispatchEvent(
        new CustomEvent('onSelect', {
          bubbles: true,
          composed: true,
          detail: { value: [] }
        })
      );
      
      this.requestUpdate();
    } catch (error) {
      this.handleError(error as Error, 'cancelSelection');
    }
  }

  /**
   * Check if any items are selected
   */
  hasSelection(): boolean {
    return this.host.selectedItems.some((isSelected) => isSelected);
  }

  /**
   * Get count of selected items
   */
  getSelectedCount(): number {
    return this.host.selectedItems.filter((isSelected) => isSelected).length;
  }
}
