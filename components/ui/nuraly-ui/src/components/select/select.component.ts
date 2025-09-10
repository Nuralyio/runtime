/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, nothing } from 'lit';
import { property, customElement, query } from 'lit/decorators.js';
import { styles } from './select.style.js';
import { map } from 'lit/directives/map.js';
import { choose } from 'lit/directives/choose.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';

// Import types
import { 
  SelectOption, 
  SelectType,
  SelectSize,
  SelectStatus
} from './select.types.js';

// Import controllers
import {
  SelectSelectionController,
  SelectKeyboardController,
  SelectDropdownController,
  SelectFocusController,
  SelectValidationController
} from './controllers/index.js';

// Import interfaces
import { SelectHost } from './interfaces/index.js';

/**
 * Advanced select component with multiple selection modes, validation, and accessibility features.
 * 
 * Supports single and multiple selection, custom rendering, validation states, keyboard navigation,
 * and various display types including default, inline, button, and slot-based configurations.
 * 
 * @example
 * ```html
 * <!-- Basic select -->
 * <hy-select placeholder="Choose an option">
 *   <option value="1">Option 1</option>
 *   <option value="2">Option 2</option>
 * </hy-select>
 * 
 * <!-- Multiple selection -->
 * <hy-select multiple placeholder="Choose multiple options"></hy-select>
 * 
 * <!-- With validation -->
 * <hy-select required status="error"></hy-select>
 * 
 * <!-- Button style -->
 * <hy-select type="button"></hy-select>
 * 
 * <!-- With search functionality -->
 * <hy-select searchable search-placeholder="Search options..."></hy-select>
 * ```
 * 
 * @fires nr-change - Selection changed
 * @fires nr-focus - Component focused  
 * @fires nr-blur - Component blurred
 * @fires nr-dropdown-open - Dropdown opened
 * @fires nr-dropdown-close - Dropdown closed
 * @fires nr-validation - Validation state changed
 * 
 * @slot label - Select label content
 * @slot helper-text - Helper text below select
 * @slot trigger - Custom trigger content (slot type only)
 * 
 * @cssproperty --select-border-color - Border color
 * @cssproperty --select-background - Background color
 * @cssproperty --select-text-color - Text color
 * @cssproperty --select-focus-color - Focus indicator color
 * @cssproperty --select-dropdown-shadow - Dropdown shadow
 * @cssproperty --select-no-options-color - No options message text color
 * @cssproperty --select-no-options-icon-color - No options icon color
 * @cssproperty --select-no-options-padding - Padding for no options message
 * @cssproperty --select-no-options-gap - Gap between icon and text
 * @cssproperty --select-search-border - Search input border
 * @cssproperty --select-search-background - Search input background
 * @cssproperty --select-search-padding - Search input padding
 */
@customElement('hy-select')
export class HySelectComponent extends NuralyUIBaseMixin(LitElement) implements SelectHost {
  static override styles = styles;
  
  // Temporarily disable dependency validation
  override requiredComponents = [];

  // === Properties ===
  
  /** Array of options to display in the select dropdown */
  @property({ type: Array }) 
  options: SelectOption[] = [];
  
  /** Default selected values (for initialization) */
  @property({ type: Array, attribute: 'default-value' }) 
  defaultValue: string[] = [];
  
  /** Placeholder text shown when no option is selected */
  @property({ type: String }) 
  placeholder: string = 'Select an option';
  
  /** Disables the select component */
  @property({ type: Boolean, reflect: true }) 
  disabled: boolean = false;
  
  /** Select display type (default, inline, button, slot) */
  @property({ type: String, reflect: true }) 
  type: SelectType = SelectType.Default;
  
  /** Enables multiple option selection */
  @property({ type: Boolean, attribute: 'multiple' }) 
  multiple: boolean = false;
  
  /** Controls dropdown visibility */
  @property({ type: Boolean, reflect: true }) 
  show: boolean = false;
  
  /** Validation status (default, warning, error, success) */
  @property({ type: String, reflect: true }) 
  status: SelectStatus = SelectStatus.Default;
  
  /** Select size (small, medium, large) */
  @property({ type: String, reflect: true }) 
  size: SelectSize = SelectSize.Medium;
  
  /** Makes the select required for form validation */
  @property({ type: Boolean, reflect: true }) 
  required: boolean = false;
  
  /** Form field name */
  @property({ type: String }) 
  name: string = '';
  
  /** Current selected value(s) */
  @property({ type: String }) 
  value: string | string[] = '';
  
  /** Message to display when no options are available */
  @property({ type: String, attribute: 'no-options-message' })
  noOptionsMessage: string = 'No options available';
  
  /** Icon to display with the no options message */
  @property({ type: String, attribute: 'no-options-icon' })
  noOptionsIcon: string = 'circle-info';
  
  /** Enable search/filter functionality */
  @property({ type: Boolean, reflect: true })
  searchable: boolean = false;
  
  /** Placeholder text for the search input */
  @property({ type: String, attribute: 'search-placeholder' })
  searchPlaceholder: string = 'Search options...';
  
  /** Current search query */
  @property({ type: String })
  searchQuery: string = '';

  // === Query selectors ===
  
  /** Options dropdown container element */
  @query('.options') 
  optionsElement!: HTMLElement;
  
  /** Main wrapper element */
  @query('.wrapper') 
  wrapper!: HTMLElement;
  
  /** Search input element */
  @query('.search-input')
  searchInput?: HTMLInputElement;

  // === Controller instances ===
  
  /** Handles option selection logic */
  private selectionController = new SelectSelectionController(this);
  
  /** Manages dropdown visibility and positioning */
  private dropdownController = new SelectDropdownController(this);
  
  /** Handles keyboard navigation */
  private keyboardController = new SelectKeyboardController(this, this.selectionController, this.dropdownController);
  
  /** Manages focus states */
  private focusController = new SelectFocusController(this);
  
  /** Handles validation logic */
  private validationController = new SelectValidationController(this, this.selectionController);

  // === Lifecycle methods ===
  
  /**
   * Component connected to DOM - initialize base functionality
   */
  override connectedCallback(): void {
    super.connectedCallback();
    // Window click listener is setup only when dropdown opens for better performance
  }

  /**
   * Component disconnected from DOM - cleanup event listeners
   */
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListeners();
  }

  /**
   * First render complete - setup controllers and initialize state
   */
  override firstUpdated(changedProperties: any): void {
    super.firstUpdated(changedProperties);
    
    // Configure dropdown controller with DOM element references
    if (this.optionsElement && this.wrapper) {
      this.dropdownController.setElements(this.optionsElement, this.wrapper);
    } else {
      // Retry element setup if DOM isn't ready yet
      setTimeout(() => {
        if (this.optionsElement && this.wrapper) {
          this.dropdownController.setElements(this.optionsElement, this.wrapper);
        }
      }, 100);
    }

    // Apply default selection if specified
    if (this.defaultValue.length > 0) {
      this.selectionController.initializeFromDefaultValue();
    }
  }

  // === Public API Methods ===

  /**
   * Gets the currently selected options
   * @returns Array of selected options
   */
  get selectedOptions(): SelectOption[] {
    return this.selectionController.getSelectedOptions();
  }

  /**
   * Gets the first selected option (for single selection mode)
   * @returns Selected option or undefined if none selected
   */
  get selectedOption(): SelectOption | undefined {
    return this.selectionController.getSelectedOption();
  }

  /**
   * Selects an option programmatically
   * @param option - The option to select
   */
  selectOption(option: SelectOption): void {
    this.selectionController.selectOption(option);
  }

  /**
   * Unselects an option programmatically
   * @param option - The option to unselect
   */
  unselectOption(option: SelectOption): void {
    this.selectionController.unselectOption(option);
  }

  /**
   * Clears all current selections
   */
  clearSelection(): void {
    this.selectionController.clearSelection();
  }

  /**
   * Checks if a specific option is currently selected
   * @param option - The option to check
   * @returns True if the option is selected
   */
  isOptionSelected(option: SelectOption): boolean {
    return this.selectionController.isOptionSelected(option);
  }

  /**
   * Toggles the dropdown visibility
   */
  toggleDropdown(): void {
    this.dropdownController.toggle();
  }

  /**
   * Opens the dropdown programmatically
   */
  openDropdown(): void {
    this.dropdownController.open();
  }

  /**
   * Closes the dropdown programmatically
   */
  closeDropdown(): void {
    this.dropdownController.close();
  }

  /**
   * Focuses the select component
   */
  override focus(): void {
    this.focusController.focus();
  }

  /**
   * Removes focus from the select component
   */
  override blur(): void {
    this.focusController.blur();
  }

  /**
   * Validates the current selection according to component rules
   * @returns True if valid, false otherwise
   */
  validate(): boolean {
    return this.validationController.validate();
  }

  /**
   * Checks if the current selection is valid without showing validation UI
   * @returns True if valid, false otherwise
   */
  checkValidity(): boolean {
    return this.validationController.checkValidity();
  }

  /**
   * Reports the current validation state and shows validation UI if invalid
   * @returns True if valid, false otherwise
   */
  reportValidity(): boolean {
    return this.validationController.reportValidity();
  }

  /**
   * Sets a custom validation message
   * @param message - Custom validation message (empty string to clear)
   */
  setCustomValidity(message: string): void {
    this.validationController.setCustomValidity(message);
  }

  // === Private Event Handlers ===
  
  /**
   * Handles clicks on the select trigger element
   */
  private handleTriggerClick = (event: Event): void => {
    if (this.disabled) return;
    event.preventDefault();
    event.stopPropagation(); // Prevent window click handler from interfering
    this.toggleDropdown();
  };

  /**
   * Handles clicks on individual options
   */
  private handleOptionClick = (event: Event, option: SelectOption): void => {
    event.stopPropagation();
    if (option.disabled) return;
    
    this.selectOption(option);
    
    // Auto-close dropdown for single selection mode
    if (!this.multiple) {
      this.closeDropdown();
    }
  };

  /**
   * Handles removal of selected tags in multiple selection mode
   */
  private handleTagRemove = (event: Event, option: SelectOption): void => {
    event.stopPropagation();
    this.unselectOption(option);
  };

  /**
   * Handles the clear all selections button
   */
  private handleClearAll = (event: Event): void => {
    event.stopPropagation();
    this.clearSelection();
  };

  /**
   * Handles keyboard navigation and interactions
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    this.keyboardController.handleKeyDown(event);
  };

  /**
   * Handles focus events
   */
  private handleFocus = (): void => {
    this.focusController.handleFocus();
  };

  /**
   * Handles blur events
   */
  private handleBlur = (): void => {
    this.focusController.handleBlur();
    // Dropdown closing is managed by window click handler for better UX
  };

  /**
   * Handles clicks outside the component to close dropdown
   */
  private handleWindowClick = (event: Event): void => {
    const target = event.target as Element;
    if (!this.contains(target)) {
      this.closeDropdown();
    }
  };

  /**
   * Handles search input changes
   */
  private handleSearchInput = (event: CustomEvent): void => {
    this.searchQuery = event.detail.value || '';
    this.requestUpdate();
  };

  /**
   * Handles search clear button click
   */
  private handleSearchClear = (): void => {
    this.searchQuery = '';
    this.requestUpdate();
  };

  /**
   * Handles search input key events
   */
  private handleSearchKeyDown = (event: KeyboardEvent): void => {
    // Handle navigation keys by passing them to keyboard controller
    if (['ArrowDown', 'ArrowUp', 'Enter', 'Home', 'End'].includes(event.key)) {
      // Don't stop propagation for navigation keys - let keyboard controller handle them
      this.keyboardController.handleKeyDown(event);
      return;
    }
    
    // Stop propagation for other keys to prevent them from bubbling up
    event.stopPropagation();
    
    // Handle escape to close dropdown
    if (event.key === 'Escape') {
      this.closeDropdown();
      this.focus();
    }
  };

  /**
   * Filters options based on search query
   */
  private getFilteredOptions(): SelectOption[] {
    if (!this.searchable || !this.searchQuery.trim()) {
      return this.options;
    }

    const query = this.searchQuery.toLowerCase().trim();
    return this.options.filter(option => 
      option.label.toLowerCase().includes(query) ||
      option.value.toLowerCase().includes(query) ||
      (option.description && option.description.toLowerCase().includes(query))
    );
  };

  // === Event Listener Management ===
  
  /**
   * Sets up global event listeners (called when dropdown opens)
   */
  public setupEventListeners(): void {
    window.addEventListener('click', this.handleWindowClick);
  }

  /**
   * Removes global event listeners (called on disconnect or dropdown close)
   */
  public removeEventListeners(): void {
    window.removeEventListener('click', this.handleWindowClick);
  }

  // === Main Render Method ===
  
  /**
   * Main render method that delegates to specific type renderers
   */
  protected override render() {
    return html`${choose(this.type, [
      [SelectType.Default, () => this.renderDefault()],
      [SelectType.Inline, () => this.renderInline()],
      [SelectType.Button, () => this.renderButton()],
      [SelectType.Slot, () => this.renderSlot()],
    ])}`;
  }

  // === Type-Specific Render Methods ===
  
  /**
   * Renders the default select appearance with full features
   */
  private renderDefault() {
    const selectedOptions = this.selectedOptions;
    const validationClasses = this.validationController.getValidationClasses();
    
    return html`
      <slot name="label"></slot>
      <div 
        class="${classMap({
          'wrapper': true,
          ...validationClasses
        })}"
        tabindex="0"
        role="combobox"
        aria-expanded="${this.show}"
        aria-haspopup="listbox"
        aria-labelledby="select-label"

        @click=${this.handleTriggerClick}
        @keydown=${this.handleKeyDown}
        @focus=${this.handleFocus}
        @blur=${this.handleBlur}
      >
        <div class="select">
          <div class="select-trigger">
            ${this.renderSelectedContent(selectedOptions)}
          </div>
          
          <div class="icons-container">
            ${this.renderStatusIcon()}
            ${this.renderClearButton(selectedOptions)}
            <hy-icon 
              name="angle-down" 
              class="arrow-icon"
              aria-hidden="true"
            ></hy-icon>
          </div>
          
          <div 
            class="options"
            role="listbox"
            aria-multiselectable="${this.multiple}"
          >
            ${this.searchable ? this.renderSearchInput() : nothing}
            ${this.renderSelectOptions()}
          </div>
        </div>
      </div>
      
      ${this.renderValidationMessage()}
      <slot name="helper-text"></slot>
    `;
  }

  /**
   * Renders inline select with integrated label and helper text
   */
  private renderInline() {
    return html`
      <slot name="label"></slot>
      ${this.renderDefault()}
      <slot name="helper-text"></slot>
    `;
  }

  /**
   * Renders select as a button-style component
   */
  private renderButton() {
    const selectedOptions = this.selectedOptions;
    return html`
      <button
        class="select-button"
        ?disabled=${this.disabled}
        @click=${this.handleTriggerClick}
        @keydown=${this.handleKeyDown}
      >
        ${selectedOptions.length > 0 ? selectedOptions[0].label : this.placeholder}
        <hy-icon name="angle-down" class="arrow-icon"></hy-icon>
      </button>
      
      <div class="options" role="listbox">
        ${this.searchable ? this.renderSearchInput() : nothing}
        ${this.renderSelectOptions()}
      </div>
    `;
  }

  /**
   * Renders select with custom trigger content via slots
   */
  private renderSlot() {
    return html`
      <slot name="trigger" @click=${this.handleTriggerClick}></slot>
      <div class="options" role="listbox">
        ${this.searchable ? this.renderSearchInput() : nothing}
        ${this.renderSelectOptions()}
      </div>
    `;
  }

  // === Helper Render Methods ===
  
  /**
   * Renders the selected content in the trigger area
   */
  private renderSelectedContent(selectedOptions: SelectOption[]) {
    if (selectedOptions.length === 0) {
      return html`<span class="placeholder" aria-hidden="true">${this.placeholder}</span>`;
    }

    if (this.multiple) {
      return map(selectedOptions, (option) => html`
        <span class="tag">
          <span class="tag-label">${option.label}</span>
          <hy-icon 
            name="remove"
            class="tag-close"
            @click=${(e: Event) => this.handleTagRemove(e, option)}
            aria-label="Remove ${option.label}"
          ></hy-icon>
        </span>
      `);
    } else {
      return html`${selectedOptions[0].label}`;
    }
  }

  /**
   * Renders status/validation icons based on current status
   */
  private renderStatusIcon() {
    switch (this.status) {
      case SelectStatus.Warning:
        return html`<hy-icon name="warning" class="status-icon warning"></hy-icon>`;
      case SelectStatus.Error:
        return html`<hy-icon name="exclamation-circle" class="status-icon error"></hy-icon>`;
      case SelectStatus.Success:
        return html`<hy-icon name="check-circle" class="status-icon success"></hy-icon>`;
      default:
        return nothing;
    }
  }

  /**
   * Renders the clear all selections button when applicable
   */
  private renderClearButton(selectedOptions: SelectOption[]) {
    if (selectedOptions.length === 0 || this.disabled) {
      return nothing;
    }

    return html`
      <hy-icon
        name="remove"
        class="clear-icon"
        @click=${this.handleClearAll}
        aria-label="Clear selection"
        tabindex="-1"
      ></hy-icon>
    `;
  }

  /**
   * Renders all available options in the dropdown
   */
  private renderSelectOptions() {
    const filteredOptions = this.getFilteredOptions();
    
    // Show "no options" message when no options are available (original array empty)
    if (!this.options || this.options.length === 0) {
      return html`
        <div class="no-options" role="option" aria-disabled="true">
          <div class="no-options-content">
            <hy-icon 
              name="${this.noOptionsIcon}" 
              class="no-options-icon"
              aria-hidden="true">
            </hy-icon>
            <span class="no-options-text">${this.noOptionsMessage}</span>
          </div>
        </div>
      `;
    }
    
    // Show "no results" message when search returns no results
    if (this.searchable && this.searchQuery.trim() && filteredOptions.length === 0) {
      return html`
        <div class="no-options" role="option" aria-disabled="true">
          <div class="no-options-content">
            <hy-icon 
              name="search" 
              class="no-options-icon"
              aria-hidden="true">
            </hy-icon>
            <span class="no-options-text">No results found for "${this.searchQuery}"</span>
          </div>
        </div>
      `;
    }
    
    // Cache the focused option to avoid multiple controller accesses
    const focusedOption = this.keyboardController.focusedOption;
    
    return map(filteredOptions, (option) => {
      const isSelected = this.isOptionSelected(option);
      const isFocused = focusedOption && focusedOption.value === option.value;
      
      return html`
        <div
          class="${classMap({
            'option': true,
            'selected': isSelected,
            'focused': isFocused,
            'disabled': Boolean(option.disabled)
          })}"
          role="option"
          aria-selected="${isSelected}"
          aria-disabled="${Boolean(option.disabled)}"
          data-value="${option.value}"
          @click=${(e: Event) => this.handleOptionClick(e, option)}
          style=${styleMap(option.style ? { style: option.style } : {})}
          title="${option.title || ''}"
        >
          <div class="option-content">
            ${option.icon ? html`<hy-icon name="${option.icon}" class="option-icon"></hy-icon>` : nothing}
            <div class="option-text">
              ${option.htmlContent ? html`<div .innerHTML=${option.htmlContent}></div>` : option.label}
              ${option.description ? html`<div class="option-description">${option.description}</div>` : nothing}
            </div>
          </div>
          
          ${isSelected ? html`<hy-icon name="check" class="check-icon" aria-hidden="true"></hy-icon>` : nothing}
          
          ${option.state && option.message ? html`
            <div class="option-message ${option.state}">
              <hy-icon name="${option.state === 'error' ? 'exclamation-circle' : 'warning'}"></hy-icon>
              <span>${option.message}</span>
            </div>
          ` : nothing}
        </div>
      `;
    });
  }

  /**
   * Renders the search input when searchable is enabled
   */
  private renderSearchInput() {
    return html`
      <div class="search-container">
        <nr-input
          type="text"
          class="search-input"
          placeholder="${this.searchPlaceholder}"
          .value="${this.searchQuery}"
          allowClear
          @nr-input="${this.handleSearchInput}"
          @nr-clear="${this.handleSearchClear}"
          @keydown="${this.handleSearchKeyDown}"
          @click="${(e: Event) => e.stopPropagation()}"
        >
          <hy-icon 
            name="search" 
            class="search-icon" 
            slot="prefix"
            aria-hidden="true">
          </hy-icon>
        </nr-input>
      </div>
    `;
  }

  /**
   * Renders validation message when present
   */
  private renderValidationMessage() {
    const validationMessage = this.validationController.validationMessage;
    if (!validationMessage) return nothing;

    return html`
      <div class="validation-message ${this.status}" id="validation-message">
        ${validationMessage}
      </div>
    `;
  }
}