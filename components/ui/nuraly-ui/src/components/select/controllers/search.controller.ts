import { html, nothing, TemplateResult } from 'lit';
import { SelectOption } from '../select.types.js';
import { SearchController } from '../interfaces/index.js';
import { BaseSelectController } from './base.controller.js';

/**
 * Search controller manages search/filter functionality for the select component
 */
export class SelectSearchController extends BaseSelectController implements SearchController {
  private _searchQuery: string = '';

  /**
   * Get current search query
   */
  get searchQuery(): string {
    return this._searchQuery;
  }

  /**
   * Check if search is active
   */
  get hasSearch(): boolean {
    return this._searchQuery.trim() !== '';
  }

  /**
   * Set search query and trigger update
   */
  setSearchQuery(query: string): void {
    this._searchQuery = query;
    // Update the host's searchQuery property
    (this.host as any).searchQuery = query;
    this.host.requestUpdate();
  }

  /**
   * Search for options with given query
   */
  search(query: string): void {
    this.setSearchQuery(query);
  }

  /**
   * Clear search query
   */
  clearSearch(): void {
    this.setSearchQuery('');
  }

  /**
   * Filter options based on current search query
   */
  getFilteredOptions(options: SelectOption[]): SelectOption[] {
    if (!this.host.searchable || !this._searchQuery.trim()) {
      return options;
    }

    const query = this._searchQuery.toLowerCase().trim();
    return options.filter(option => 
      option.label.toLowerCase().includes(query) ||
      option.value.toLowerCase().includes(query) ||
      (option.description && option.description.toLowerCase().includes(query))
    );
  }

  /**
   * Handle search input changes
   */
  handleSearchInput = (event: CustomEvent): void => {
    this.setSearchQuery(event.detail.value || '');
  };

  /**
   * Handle search clear button click
   */
  handleSearchClear = (): void => {
    this.clearSearch();
  };

  /**
   * Handle search input key events
   */
  handleSearchKeyDown = (event: KeyboardEvent): void => {
    // Handle navigation keys by passing them to keyboard controller
    if (['ArrowDown', 'ArrowUp', 'Enter', 'Home', 'End'].includes(event.key)) {
      // Don't stop propagation for navigation keys - let keyboard controller handle them
      const keyboardController = (this.host as any).keyboardController;
      if (keyboardController) {
        keyboardController.handleKeyDown(event);
      }
      return;
    }
    
    // Stop propagation for other keys to prevent them from bubbling up
    event.stopPropagation();
    
    // Handle escape to close dropdown
    if (event.key === 'Escape') {
      this.host.closeDropdown();
      this.host.focus();
    }
  };

  /**
   * Render search input when searchable is enabled
   */
  renderSearchInput(): TemplateResult | typeof nothing {
    if (!this.host.searchable) {
      return nothing;
    }

    return html`
      <div class="search-container">
        <nr-input
          type="text"
          class="search-input"
          placeholder="${this.host.searchPlaceholder}"
          .value="${this._searchQuery}"
          allowClear
          @nr-input="${this.handleSearchInput}"
          @nr-clear="${this.handleSearchClear}"
          @keydown="${this.handleSearchKeyDown}"
          @click="${(e: Event) => e.stopPropagation()}"
        >
          <nr-icon 
            name="search" 
            class="search-icon" 
            slot="prefix"
            aria-hidden="true">
          </nr-icon>
        </nr-input>
      </div>
    `;
  }

  /**
   * Render "no results" message when search returns no results
   */
  renderNoResults(): TemplateResult {
    return html`
      <div class="no-options" role="option" aria-disabled="true">
        <div class="no-options-content">
          <nr-icon 
            name="search" 
            class="no-options-icon"
            aria-hidden="true">
          </nr-icon>
          <span class="no-options-text">No results found for "${this._searchQuery}"</span>
        </div>
      </div>
    `;
  }

  /**
   * Check if there are no search results
   */
  hasNoResults(options: SelectOption[]): boolean {
    return this.host.searchable && 
           this._searchQuery.trim() !== '' && 
           this.getFilteredOptions(options).length === 0;
  }

  /**
   * Get search query from the component (useful for external access)
   */
  getCurrentQuery(): string {
    return this.host.searchQuery || this._searchQuery;
  }

  /**
   * Update internal query to match host's searchQuery on updates
   */
  override hostUpdated(): void {
    super.hostUpdated();
    if (this.host.searchQuery !== this._searchQuery) {
      this._searchQuery = this.host.searchQuery;
    }
  }

  /**
   * Reset search state when component initializes
   */
  override hostConnected(): void {
    super.hostConnected();
    this._searchQuery = '';
  }
}
