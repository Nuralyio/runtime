/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, PropertyValues, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import { INPUT_STATE } from '../input/input.types.js';

// Import child components
import './color-holder.component.js';
import './default-color-sets.component.js';

// Import styles and types
import styles from './color-picker.style.js';
import {
  ColorPickerSize,
  ColorPickerTrigger,
  ColorPickerPlacement,
  ColorPickerAnimation,
  ColorFormat
} from './color-picker.types.js';

// Import controllers
import {
  ColorPickerDropdownController,
  ColorPickerEventController,
} from './controllers/index.js';

// Import interfaces
import type { ColorPickerHost } from './interfaces/index.js';

/**
 * Advanced color picker component with dropdown positioning, validation, and accessibility.
 * 
 * Supports multiple color formats, default color sets, custom triggers, keyboard navigation,
 * and various display configurations.
 * 
 * @example
 * ```html
 * <!-- Basic color picker -->
 * <nr-color-picker color="#3498db"></nr-color-picker>
 * 
 * <!-- With default colors -->
 * <nr-color-picker 
 *   color="#3498db"
 *   .defaultColorSets="${['#3498db', '#e74c3c', '#2ecc71']}">
 * </nr-color-picker>
 * 
 * <!-- With custom configuration -->
 * <nr-color-picker
 *   color="#3498db"
 *   trigger="click"
 *   placement="top"
 *   size="large"
 *   show-input="true"
 *   show-copy-button="true">
 * </nr-color-picker>
 * 
 * <!-- Disabled -->
 * <nr-color-picker color="#3498db" disabled></nr-color-picker>
 * ```
 * 
 * @fires hy-color-change - Color value changed
 * @fires nr-colorpicker-open - Dropdown opened
 * @fires nr-colorpicker-close - Dropdown closed
 * @fires color-changed - Legacy event for backwards compatibility
 * 
 * @slot - Default slot for custom content
 * 
 * @cssproperty --colorpicker-trigger-size - Size of the color trigger box
 * @cssproperty --colorpicker-dropdown-width - Width of the dropdown panel
 * @cssproperty --colorpicker-dropdown-background - Background color of dropdown
 * @cssproperty --colorpicker-dropdown-shadow - Shadow of dropdown panel
 * @cssproperty --colorpicker-dropdown-border-radius - Border radius of dropdown
 */
@customElement('nr-color-picker')
export class ColorPicker extends NuralyUIBaseMixin(LitElement) implements ColorPickerHost {
  static override styles = styles;

  override requiredComponents = ['nr-input', 'nr-icon'];

  /** Current color value */
  @property({ type: String }) 
  color = '#3498db';

  /** Controls dropdown visibility */
  @property({ type: Boolean, reflect: true }) 
  show = false;

  /** Array of preset colors to display */
  @property({ type: Array, attribute: 'default-color-sets' }) 
  defaultColorSets: string[] = [];

  /** Disables the color picker */
  @property({ type: Boolean, reflect: true }) 
  disabled = false;

  /** Color picker size (small, default, large) */
  @property({ type: String, reflect: true }) 
  size: ColorPickerSize = ColorPickerSize.Default;

  /** Trigger mode for opening dropdown */
  @property({ type: String, reflect: true }) 
  trigger: ColorPickerTrigger = ColorPickerTrigger.Click;

  /** Dropdown placement */
  @property({ type: String, reflect: true }) 
  placement: ColorPickerPlacement = ColorPickerPlacement.Auto;

  /** Animation style for dropdown */
  @property({ type: String, reflect: true }) 
  animation: ColorPickerAnimation = ColorPickerAnimation.Fade;

  /** Close dropdown when a color is selected */
  @property({ type: Boolean, attribute: 'close-on-select' }) 
  closeOnSelect = false;

  /** Close dropdown on outside click */
  @property({ type: Boolean, attribute: 'close-on-outside-click' }) 
  closeOnOutsideClick = true;

  /** Close dropdown on escape key */
  @property({ type: Boolean, attribute: 'close-on-escape' }) 
  closeOnEscape = true;

  /** Show color input field */
  @property({ type: Boolean, attribute: 'show-input' }) 
  showInput = true;

  /** Show copy button on input */
  @property({ type: Boolean, attribute: 'show-copy-button' }) 
  showCopyButton = true;

  /** Color format (hex, rgb, rgba, hsl, hsla) */
  @property({ type: String, reflect: true }) 
  format: ColorFormat = ColorFormat.Hex;

  /** Placeholder text for color input */
  @property({ type: String, attribute: 'input-placeholder' }) 
  inputPlaceholder = 'Enter color';

  /** Label text */
  @property({ type: String }) 
  label = '';

  /** Helper text */
  @property({ type: String, attribute: 'helper-text' }) 
  helperText = '';

  /** Validation state for color value */
  @state() 
  private isValidColor = true;

  /** Manages dropdown visibility and positioning */
  private dropdownController = new ColorPickerDropdownController(this);

  /** Handles all event management */
  private eventController = new ColorPickerEventController(this);

  constructor() {
    super();
    // Dynamically import vanilla-colorful for color picker UI
    if (typeof window !== 'undefined') {
      import('vanilla-colorful');
    }
  }

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
   * Called after component updates
   */
  override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    
    if (changedProperties.has('color')) {
      this.validateColor();
    }
  }

  // === Public API Methods ===

  /**
   * Opens the color picker dropdown
   */
  open(): void {
    this.dropdownController.open();
  }

  /**
   * Closes the color picker dropdown
   */
  close(): void {
    this.dropdownController.close();
  }

  /**
   * Toggles the color picker dropdown
   */
  toggle(): void {
    this.dropdownController.toggle();
  }

  /**
   * Validates the current color value
   */
  validateColor(): boolean {
    this.isValidColor = this.eventController.isValidColor(this.color);
    return this.isValidColor;
  }

  /**
   * Sets up global event listeners (called by dropdown controller)
   */
  setupEventListeners(): void {
    if (this.closeOnOutsideClick || this.closeOnEscape) {
      this.eventController.setupEventListeners();
    }
  }

  /**
   * Removes global event listeners (called by dropdown controller)
   */
  removeEventListeners(): void {
    this.eventController.removeEventListeners();
  }

  /**
   * Handles trigger click to toggle dropdown
   */
  private handleTriggerClick = (event: Event): void => {
    this.eventController.handleTriggerClick(event);
  };

  /**
   * Handles color selection from hex-color-picker or default colors
   */
  private handleColorChanged = (event: CustomEvent): void => {
    const newColor = event.detail.value;
    this.eventController.handleColorChange(newColor);
    
    if (this.closeOnSelect) {
      this.dropdownController.close();
    }
  };

  /**
   * Handles input change from text input
   */
  private handleInputChange = (event: CustomEvent): void => {
    this.eventController.handleInputChange(event);
  };

  /**
   * Main render method
   */
  override render() {
    const containerClasses = {
      'color-picker-container': true,
      'color-picker-container--disabled': this.disabled,
      'color-picker-container--open': this.show,
      [`color-picker-container--${this.size}`]: true,
    };

    return html`
      <div class="${classMap(containerClasses)}" data-theme="${this.currentTheme}">
        ${this.renderLabel()}
        
        <nr-colorholder-box
          class="color-holder"
          color="${this.color}"
          .size=${this.size}
          ?disabled="${this.disabled}"
          @click=${this.disabled ? nothing : this.handleTriggerClick}
          role="button"
          aria-label="Select color"
          aria-expanded="${this.show}"
          aria-haspopup="dialog"
          tabindex="${this.disabled ? -1 : 0}"
        ></nr-colorholder-box>
        
        ${this.renderDropdown()}
        ${this.renderHelperText()}
      </div>
    `;
  }

  /**
   * Renders the label if provided
   */
  private renderLabel() {
    if (!this.label) return nothing;
    
    return html`
      <label class="color-picker-label">
        ${this.label}
      </label>
    `;
  }

  /**
   * Renders the dropdown panel with color picker
   */
  private renderDropdown() {
    if (!this.show) return nothing;

    return html`
      <div 
        class="dropdown-container"
        role="dialog"
        aria-label="Color picker"
      >
        ${this.renderDefaultColorSets()}
        ${this.renderColorPicker()}
        ${this.renderColorInput()}
      </div>
    `;
  }

  /**
   * Renders default color sets if provided
   */
  private renderDefaultColorSets() {
    if (!this.defaultColorSets || this.defaultColorSets.length === 0) {
      return nothing;
    }

    return html`
      <nr-default-color-sets 
        .defaultColorSets=${this.defaultColorSets} 
        @color-click="${this.handleColorChanged}"
        aria-label="Preset colors">
      </nr-default-color-sets>
    `;
  }

  /**
   * Renders the hex color picker
   */
  private renderColorPicker() {
    return html`
      <hex-color-picker
        color="${this.color}"
        @color-changed="${this.handleColorChanged}"
        aria-label="Color gradient picker">
      </hex-color-picker>
    `;
  }

  /**
   * Renders the color input field
   */
  private renderColorInput() {
    if (!this.showInput) return nothing;

    return html`
      <nr-input 
        type="text" 
        .value="${this.color}" 
        placeholder="${this.inputPlaceholder}"
        @nr-input="${this.handleInputChange}" 
        ?withCopy=${this.showCopyButton} 
        .state="${!this.isValidColor ? INPUT_STATE.Error : INPUT_STATE.Default}"
        aria-label="Color value input"
        aria-invalid="${!this.isValidColor}">
      </nr-input>
    `;
  }

  /**
   * Renders helper text if provided
   */
  private renderHelperText() {
    if (!this.helperText) return nothing;
    
    return html`
      <div class="color-picker-helper-text">
        ${this.helperText}
      </div>
    `;
  }
}
