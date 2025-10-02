/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { IHeader, SelectionMode, Sizes, SortAttribute } from '../table.types.js';

/**
 * Interface for the table host component
 */
export interface TableHost {
  headers: IHeader[];
  rows: any[];
  size: Sizes;
  withFilter: boolean;
  expandable?: string;
  selectionMode?: SelectionMode;
  
  // State
  itemPerPage: number[];
  selectedItemPerPage: number;
  displayedRows: any[];
  selectedItems: boolean[];
  currentPage: number;
  rowsCopy: any[];
  activeSearch: boolean;
  sortAttribute: SortAttribute;
  filterValue: string;
  columnFilters: Map<string, string | number>;
  activeFilterColumn: string | null;
  
  // Methods
  requestUpdate(): void;
  dispatchEvent(event: Event): boolean;
}

/**
 * Base controller interface
 */
export interface TableBaseController {
  host: TableHost;
}

/**
 * Error handler interface
 */
export interface ErrorHandler {
  handleError(error: Error, context: string): void;
}
