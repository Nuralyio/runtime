/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';
import { IconFilterUtils } from '../utils/index.js';
import type { IconPickerIcon, IconPickerSearchOptions } from '../icon-picker.types.js';

interface SearchHost extends ReactiveControllerHost {
  allIcons: IconPickerIcon[];
  filteredIcons: IconPickerIcon[];
  searchQuery: string;
}

export class IconPickerSearchController implements ReactiveController {
  host: SearchHost;
  private debounceTimer: number | null = null;
  private debounceDelay = 300;

  constructor(host: SearchHost, debounceDelay = 300) {
    (this.host = host).addController(this);
    this.debounceDelay = debounceDelay;
  }

  hostConnected() {
    // Initialization
  }

  hostDisconnected() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  /**
   * Perform search with debouncing
   */
  search(query: string, options?: IconPickerSearchOptions): void {
    this.host.searchQuery = query;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(() => {
      this.performSearch(query, options);
    }, this.debounceDelay);
  }

  /**
   * Perform immediate search without debounce
   */
  performSearch(query: string, options?: IconPickerSearchOptions): void {
    if (!query || query.trim() === '') {
      this.host.filteredIcons = [...this.host.allIcons];
    } else {
      this.host.filteredIcons = IconFilterUtils.searchAndRank(
        query,
        this.host.allIcons,
        options
      );
    }
    this.host.requestUpdate();
  }

  /**
   * Clear search
   */
  clearSearch(): void {
    this.host.searchQuery = '';
    this.host.filteredIcons = [...this.host.allIcons];
    this.host.requestUpdate();
  }
}
