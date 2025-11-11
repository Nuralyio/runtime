/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { classMap } from 'lit/directives/class-map.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import '@lit-labs/virtualizer';
import { grid } from '@lit-labs/virtualizer/layouts/grid.js';

// Import required components
import '../dropdown/dropdown.component.js';
import '../input/input.component.js';
import '../icon/icon.component.js';
import '../button/button.component.js';

// Import styles and types
import styles from './icon-picker.style.js';
import {
    IconPickerSize,
    IconPickerPlacement,
    IconPickerTrigger,
    IconType,
    EMPTY_STRING
} from './icon-picker.types.js';
import type { IconPickerIcon } from './icon-picker.types.js';
import {
    DEFAULT_PLACEHOLDER,
    DEFAULT_SEARCH_PLACEHOLDER,
    DEFAULT_EMPTY_MESSAGE,
    SEARCH_DEBOUNCE_DELAY
} from './icon-picker.constant.js';

// Import controllers
import {
    IconPickerSelectionController,
    IconPickerSearchController,
    IconPickerEventController
} from './controllers/index.js';

// Import utilities
import { IconLoaderUtils } from './utils/index.js';

// Import interfaces
import type { IconPickerHost } from './interfaces/index.js';

/**
 * Advanced icon picker component with search, virtual scrolling, and accessibility.
 * 
 * Uses Lucide icons (1500+ beautiful icons) and provides an intuitive selection interface with
 * search filtering, keyboard navigation, and multiple display options.
 * 
 * @example
 * ```html
 * <!-- Basic usage -->
 * <nr-icon-picker></nr-icon-picker>
 * 
 * <!-- With value -->
 * <nr-icon-picker value="heart"></nr-icon-picker>
 * 
 * <!-- Custom configuration -->
 * <nr-icon-picker
 *   value="star"
 *   size="large"
 *   placement="top"
 *   show-search
 *   show-clear>
 * </nr-icon-picker>
 * ```
 * 
 * @fires nr-icon-picker-change - Icon selection changed
 * @fires nr-icon-picker-open - Dropdown opened
 * @fires nr-icon-picker-close - Dropdown closed
 * @fires nr-icon-picker-search - Search query changed
 * @fires nr-icon-picker-clear - Selection cleared
 * 
 * @cssproperty --icon-picker-dropdown-width - Width of dropdown
 * @cssproperty --icon-picker-icon-size - Size of icon items
 * @cssproperty --icon-picker-selected-bg - Selected icon background
 * @cssproperty --icon-picker-selected-border - Selected icon border
 */
@customElement('nr-icon-picker')
export class NrIconPickerElement extends NuralyUIBaseMixin(LitElement) implements IconPickerHost {
  static override styles = styles;

  override requiredComponents = ['nr-dropdown', 'nr-input', 'nr-icon', 'nr-button'];

  // Controllers
  private selectionController = new IconPickerSelectionController(this);
  private searchController = new IconPickerSearchController(this, SEARCH_DEBOUNCE_DELAY);
  private eventController = new IconPickerEventController(this);

  // Public properties
  @property({ type: String, reflect: true }) value = EMPTY_STRING;
  @property({ type: String, reflect: true }) size = IconPickerSize.Medium;
  @property({ type: String }) placement: string = IconPickerPlacement.Auto;
  @property({ type: String }) trigger: string = IconPickerTrigger.Manual;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean }) readonly = false;
  @property({ type: String }) placeholder = DEFAULT_PLACEHOLDER;
  @property({ type: Array }) iconTypes: IconType[] = [IconType.Solid];
  @property({ type: Boolean, attribute: 'show-search' }) showSearch = true;
  @property({ type: Boolean, attribute: 'show-clear' }) showClear = true;
  @property({ type: Number, attribute: 'max-visible' }) maxVisible = 500;

  // Internal state
  @state() dropdownOpen = false;
  @state() allIcons: IconPickerIcon[] = [];
  @state() filteredIcons: IconPickerIcon[] = [];
  @state() searchQuery = EMPTY_STRING;
  @state() selectedIcon: IconPickerIcon | null = null;
  @state() isLoading = false;

  override connectedCallback() {
    super.connectedCallback();
    this.loadIcons();
  }

  /**
   * Load icons from Lucide library
   */
  private loadIcons(): void {
    this.isLoading = true;
    try {
      this.allIcons = IconLoaderUtils.loadIcons(this.iconTypes);
      this.filteredIcons = [...this.allIcons];
      
      // Set selected icon if value is provided
      if (this.value) {
        this.selectedIcon = this.allIcons.find(icon => icon.name === this.value) || null;
      }
    } catch (error) {
      console.error('Failed to load icons:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Handle icon selection
   */
  handleIconSelect(icon: IconPickerIcon): void {
    this.selectionController.selectIcon(icon);
    this.eventController.dispatchChangeEvent(icon.name, icon);
    this.dropdownOpen = false;
  }

  /**
   * Handle search input
   */
  private handleSearchInput(e: CustomEvent): void {
    const query = e.detail.value;
    this.searchController.search(query);
    this.eventController.dispatchSearchEvent(query);
  }

  /**
   * Handle clear button
   */
  private handleClear(e: Event): void {
    e.stopPropagation();
    this.selectionController.clearSelection();
    this.eventController.dispatchClearEvent();
    this.eventController.dispatchChangeEvent(EMPTY_STRING, null);
  }

  /**
   * Handle dropdown open
   */
  private handleDropdownOpen(): void {
    this.dropdownOpen = true;
    this.eventController.dispatchOpenEvent();
  }

  /**
   * Handle dropdown close
   */
  private handleDropdownClose(): void {
    this.dropdownOpen = false;
    this.searchController.clearSearch();
    this.eventController.dispatchCloseEvent();
  }

  /**
   * Toggle dropdown
   */
  private toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  /**
   * Render trigger button
   */
  private renderTrigger() {
    return html`
      <nr-button
        class="trigger-button"
        .disabled=${this.disabled}
        size=${this.size}
        @click=${this.toggleDropdown}
      >
        ${this.selectedIcon
          ? html`
              <nr-icon class="icon-preview" .name=${this.selectedIcon.name}></nr-icon>
              <span class="icon-name">${this.selectedIcon.name}</span>
            `
          : html`<span class="placeholder">${this.placeholder}</span>`
        }
        ${this.showClear && this.selectedIcon
          ? html`
              <nr-icon
                name="times"
                @click=${this.handleClear}
                style="margin-left: auto; cursor: pointer;"
              ></nr-icon>
            `
          : nothing
        }
      </nr-button>
    `;
  }

  /**
   * Render icon grid
   */
  private renderIconGrid() {
    if (this.isLoading) {
      return html`
        <div class="loading-state">
          <nr-icon name="spinner"></nr-icon>
          <div class="empty-message">Loading icons...</div>
        </div>
      `;
    }

    if (this.filteredIcons.length === 0) {
      return html`
        <div class="empty-state">
          <nr-icon name="search"></nr-icon>
          <div class="empty-message">${DEFAULT_EMPTY_MESSAGE}</div>
        </div>
      `;
    }

    // Limit visible icons for performance
    const visibleIcons = this.filteredIcons.slice(0, this.maxVisible);

    return html`
      <div class="dropdown-content">
        ${this.showSearch
          ? html`
              <div class="search-container">
                <nr-input
                  size="small"
                  .placeholder=${DEFAULT_SEARCH_PLACEHOLDER}
                  .value=${this.searchQuery}
                  @nr-input=${this.handleSearchInput}
                  autocomplete="off"
                >
                  <nr-icon slot="addon-before" name="search"></nr-icon>
                </nr-input>
              </div>
            `
          : nothing
        }
        <div class="icons-grid-container">
          <lit-virtualizer
            .items=${visibleIcons}
            .layout=${grid({ itemSize: '40px' })}
            .renderItem=${((icon: IconPickerIcon) => html`
              <div
                class=${classMap({
                  'icon-item': true,
                  'selected': this.selectionController.isSelected(icon)
                })}
                @click=${() => this.handleIconSelect(icon)}
                tabindex="0"
                role="button"
                aria-label="Select ${icon.name} icon"
              >
                <nr-icon .name=${icon.name}></nr-icon>
              </div>
            `) as any}
          ></lit-virtualizer>
        </div>
      </div>
    `;
  }

  override render() {
    return html`
      <nr-dropdown
        .open=${this.dropdownOpen}
        trigger="manual"
        .placement=${this.placement as any}
        .closeOnOutsideClick=${true}
        .closeOnEscape=${true}
        @nr-dropdown-open=${this.handleDropdownOpen}
        @nr-dropdown-close=${this.handleDropdownClose}
        style=${styleMap({
          '--dropdown-width': 'var(--icon-picker-dropdown-width)',
          '--dropdown-max-height': 'var(--icon-picker-dropdown-max-height)'
        })}
      >
        <div slot="trigger" class="trigger-container">
          ${this.renderTrigger()}
        </div>
        <div slot="content">
          ${this.renderIconGrid()}
        </div>
      </nr-dropdown>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-icon-picker': NrIconPickerElement;
  }
}
