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
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';

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
  SelectValidationController,
  SelectSearchController,
  SelectEventController
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
 * <nr-select placeholder="Choose an option">
 *   <option value="1">Option 1</option>
 *   <option value="2">Option 2</option>
 * </nr-select>
 * 
 * <!-- Multiple selection -->
 * <nr-select multiple placeholder="Choose multiple options"></nr-select>
 * 
 * <!-- With validation -->
 * <nr-select required status="error"></nr-select>
 * 
 * <!-- Button style -->
 * <nr-select type="button"></nr-select>
 * 
 * <!-- With search functionality -->
 * <nr-select searchable search-placeholder="Search options..."></nr-select>
 * 
 * <!-- With clear button -->
 * <nr-select clearable></nr-select>
 * 
 * <!-- Full width block select -->
 * <nr-select block></nr-select>
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
 * @slot selected-display - Custom display for selected values (multi-select only, when use-custom-selected-display is true)
 * @slot before-options - Content rendered before the options list (e.g., search, filters)
 * @slot after-options - Content rendered after the options list (e.g., create button, form)
 * 
 * @cssproperty --select-border-color - Border color
 * @cssproperty --select-background - Background color
 * @cssproperty --select-text-color - Text color
 * @cssproperty --select-focus-color - Focus indicator color
 * @cssproperty --select-dropdown-shadow - Dropdown shadow
 * @cssproperty --select-dropdown-max-height - Maximum height of dropdown
 * @cssproperty --select-no-options-color - No options message text color
 * @cssproperty --select-no-options-icon-color - No options icon color
 * @cssproperty --select-no-options-padding - Padding for no options message
 * @cssproperty --select-no-options-gap - Gap between icon and text
 * @cssproperty --select-search-border - Search input border
 * @cssproperty --select-search-background - Search input background
 * @cssproperty --select-search-padding - Search input padding
 */
@customElement('nr-select')
export class HySelectComponent extends NuralyUIBaseMixin(LitElement) implements SelectHost {
  static override styles = styles;
  
  override requiredComponents = [ "nr-input", "nr-icon" ];

  /** Array of options to display in the select dropdown */
  @property({ type: Array }) 
  options: SelectOption[] = [];
  
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
  @property() 
  value: string | string[] = '';
  
  /** Message to display when no options are available */
  @property({ type: String, attribute: 'no-options-message' })
  noOptionsMessage: string = 'No options available';
  
  /** Icon to display with the no options message */
  @property({ type: String, attribute: 'no-options-icon' })
  noOptionsIcon: string = 'info';
  
  /** Enable search/filter functionality */
  @property({ type: Boolean, reflect: true })
  searchable: boolean = false;
  
  /** Enable clear button to clear all selections */
  @property({ type: Boolean, reflect: true })
  clearable: boolean = false;
  
  /** Placeholder text for the search input */
  @property({ type: String, attribute: 'search-placeholder' })
  searchPlaceholder: string = 'Search options...';
  
  /** Current search query */
  @property({ type: String })
  searchQuery: string = '';

  /** Enable custom selected display slot */
  @property({ type: Boolean, attribute: 'use-custom-selected-display' })
  useCustomSelectedDisplay: boolean = false;

  /** Maximum height of the options dropdown */
  @property({ type: String, attribute: 'max-height' })
  maxHeight: string = '';

  /** Makes select full width */
  @property({ type: Boolean, reflect: true })
  block: boolean = false;

  /** Options dropdown container element */
  @query('.options') 
  optionsElement!: HTMLElement;
  
  /** Main wrapper element */
  @query('.wrapper') 
  wrapper!: HTMLElement;
  
  /** Search input element */
  @query('.search-input')
  searchInput?: HTMLInputElement;

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
  
  /** Handles search/filter functionality */
  private searchController = new SelectSearchController(this);
  
  /** Handles all event management */
  private eventController = new SelectEventController(this);

  /**
   * Component connected to DOM - initialize base functionality
   */
  override connectedCallback(): void {
    super.connectedCallback();
  }

  /**
   * Component disconnected from DOM - cleanup event listeners
   */
  override disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  /**
   * Called before update to handle property changes
   */
  override willUpdate(changedProperties: Map<string, any>): void {
    super.willUpdate(changedProperties);
    
    // If options or value changed, reinitialize selection
    if ((changedProperties.has('options') || changedProperties.has('value')) && 
        this.options.length > 0 && 
        this.value && 
        (Array.isArray(this.value) ? this.value.length > 0 : this.value !== '')) {
      // Reset initialization flag to allow reinit
      (this.selectionController as any)._initialized = false;
      this.selectionController.initializeFromValue();
    }
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
    if (this.value && (Array.isArray(this.value) ? this.value.length > 0 : this.value !== '')) {
      this.selectionController.initializeFromValue();
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
   * Toggles an option's selection state
   * @param option - The option to toggle
   */
  toggleOption(option: SelectOption): void {
    this.selectionController.toggleOption(option);
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

  /**
   * Searches for options with the given query
   * @param query - Search query string
   */
  searchOptions(query: string): void {
    this.searchController.search(query);
  }

  /**
   * Clears the current search query
   */
  clearSearch(): void {
    this.searchController.clearSearch();
  }

  /**
   * Gets the filtered options based on current search
   * @returns Array of filtered options
   */
  getSearchFilteredOptions(): SelectOption[] {
    return this.searchController.getFilteredOptions(this.options);
  }

  /**
   * Gets the current search query
   * @returns Current search query string
   */
  getCurrentSearchQuery(): string {
    return this.searchController.searchQuery;
  }

  /**
   * Gets the currently selected options
   * @returns Array of selected option objects
   */
  getSelectedOptions(): SelectOption[] {
    return this.selectedOptions;
  }

  /**
   * Manually trigger setup of global event listeners
   */
  setupGlobalEventListeners(): void {
    this.eventController.setupEventListeners();
  }

  /**
   * Manually trigger removal of global event listeners
   */
  removeGlobalEventListeners(): void {
    this.eventController.removeEventListeners();
  }

  
  /**
   * Handles clicks on the select trigger element
   */
  private handleTriggerClick = (event: Event): void => {
    this.eventController.handleTriggerClick(event);
  };

  /**
   * Handles clicks on individual options
   */
  private handleOptionClick = (event: Event, option: SelectOption): void => {
    this.eventController.handleOptionClick(event, option);
  };

  /**
   * Handles removal of selected tags in multiple selection mode
   */
  private handleTagRemove = (event: Event, option: SelectOption): void => {
    this.eventController.handleTagRemove(event, option);
  };

  /**
   * Handles the clear all selections button
   */
  private handleClearAll = (event: Event): void => {
    this.eventController.handleClearAll(event);
  };

  /**
   * Handles keyboard navigation and interactions
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    this.eventController.handleKeyDown(event);
  };

  /**
   * Handles focus events
   */
  private handleFocus = (): void => {
    this.eventController.handleFocus();
  };

  /**
   * Handles blur events
   */
  private handleBlur = (): void => {
    this.eventController.handleBlur();
  };

  /**
   * Filters options based on search query
   */
  private getFilteredOptions(): SelectOption[] {
    return this.searchController.getFilteredOptions(this.options);
  };

  /**
   * Sets up global event listeners (called when dropdown opens)
   */
  public setupEventListeners(): void {
    this.eventController.setupEventListeners();
  }

  /**
   * Removes global event listeners (called on disconnect or dropdown close)
   */
  public removeEventListeners(): void {
    this.eventController.removeEventListeners();
  }
  
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
        data-theme="${this.currentTheme}"
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
            <nr-icon 
              name="chevron-down" 
              size="${this.size}"
              class="arrow-icon"
              aria-hidden="true"
            ></nr-icon>
          </div>
          
          <div
            class="options"
            role="listbox"
            aria-multiselectable="${this.multiple}"
            style=${this.maxHeight ? styleMap({ 'max-height': this.maxHeight }) : nothing}
          >
            ${this.searchable ? this.renderSearchInput() : nothing}
            <slot name="before-options"></slot>
            ${this.renderSelectOptions()}
            <slot name="after-options"></slot>
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
        <nr-icon name="chevron-down" class="arrow-icon"></nr-icon>
      </button>
      
      <div
        class="options"
        role="listbox"
        style=${this.maxHeight ? styleMap({ 'max-height': this.maxHeight }) : nothing}
      >
        ${this.searchable ? this.renderSearchInput() : nothing}
        <slot name="before-options"></slot>
        ${this.renderSelectOptions()}
        <slot name="after-options"></slot>
      </div>
    `;
  }

  /**
   * Renders select with custom trigger content via slots
   */
  private renderSlot() {
    return html`
      <slot name="trigger" @click=${this.handleTriggerClick}></slot>
      <div
        class="options"
        role="listbox"
        style=${this.maxHeight ? styleMap({ 'max-height': this.maxHeight }) : nothing}
      >
        ${this.searchable ? this.renderSearchInput() : nothing}
        <slot name="before-options"></slot>
        ${this.renderSelectOptions()}
        <slot name="after-options"></slot>
      </div>
    `;
  }

  /**
   * Renders the selected content in the trigger area
   */
  private renderSelectedContent(selectedOptions: SelectOption[]) {
    if (selectedOptions.length === 0) {
      return html`<span class="placeholder" aria-hidden="true">${this.placeholder}</span>`;
    }

    if (this.multiple) {
      // Check if custom display slot should be used
      if (this.useCustomSelectedDisplay) {
        return html`<slot name="selected-display" .selectedOptions=${selectedOptions}></slot>`;
      }
      
      // Default behavior: render tags
      return map(selectedOptions, (option) => html`
        <span class="tag">
          <span class="tag-label">${option.label}</span>
          <nr-icon 
            name="x"
            size="${this.size}"
            class="tag-close"
            @click=${(e: Event) => this.handleTagRemove(e, option)}
            aria-label="Remove ${option.label}"
          ></nr-icon>
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
        return html`<nr-icon name="alert-triangle" size="${this.size}" class="status-icon warning"></nr-icon>`;
      case SelectStatus.Error:
        return html`<nr-icon name="alert-circle" size="${this.size}" class="status-icon error"></nr-icon>`;
      case SelectStatus.Success:
        return html`<nr-icon name="circle-check" size="${this.size}" class="status-icon success"></nr-icon>`;
      default:
        return nothing;
    }
  }

  /**
   * Renders the clear all selections button when applicable
   */
  private renderClearButton(selectedOptions: SelectOption[]) {
    if (!this.clearable || selectedOptions.length === 0 || this.disabled) {
      return nothing;
    }

    return html`
      <nr-icon
        name="x"
        size="${this.size}"
        class="clear-icon"
        @click=${this.handleClearAll}
        aria-label="Clear selection"
        tabindex="-1"
      ></nr-icon>
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
            <nr-icon 
              name="${this.noOptionsIcon}" 
              class="no-options-icon"
              aria-hidden="true">
            </nr-icon>
            <span class="no-options-text">${this.noOptionsMessage}</span>
          </div>
        </div>
      `;
    }
    
    // Show "no results" message when search returns no results
    if (this.searchController.hasNoResults(this.options)) {
      return this.searchController.renderNoResults();
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
            ${option.icon ? html`<nr-icon name="${option.icon}" size="${this.size}" class="option-icon"></nr-icon>` : nothing}
            <div class="option-text">
              ${option.htmlContent ? html`<div .innerHTML=${option.htmlContent}></div>` : option.label}
              ${option.description ? html`<div class="option-description">${option.description}</div>` : nothing}
            </div>
          </div>
          
          ${isSelected ? html`<nr-icon name="check" size="${this.size}" class="check-icon" aria-hidden="true"></nr-icon>` : nothing}
          
          ${option.state && option.message ? html`
            <div class="option-message ${option.state}">
              <nr-icon name="${option.state === 'error' ? 'alert-circle' : 'alert-triangle'}" size="${this.size}"></nr-icon>
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
    return this.searchController.renderSearchInput();
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