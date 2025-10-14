/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, PropertyValues, html } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { styles } from './textarea.style.js';
import {
  TEXTAREA_STATE,
  TEXTAREA_SIZE,
  TEXTAREA_VARIANT,
  TEXTAREA_RESIZE,
  TEXTAREA_DEFAULTS,
  EMPTY_STRING,
  ValidationRule,
  TextareaValidationResult,
  TextareaChangeEvent,
  TextareaResizeEvent,
  FocusOptions
} from './textarea.types.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import { ValidatableComponent, ValidationStatus } from '@nuralyui/common/mixins';
import {
  TextareaValidationController,
  TextareaEventController,
  type TextareaValidationHost,
  type TextareaEventHost
} from './controllers/index.js';

/**
 * Versatile textarea component with validation, resize options, and interactive features.
 * 
 * @example
 * ```html
 * <nr-textarea placeholder="Enter your message"></nr-textarea>
 * <nr-textarea rows="5" resize="vertical"></nr-textarea>
 * <nr-textarea max-length="500" show-count></nr-textarea>
 * ```
 * 
 * @fires nr-textarea-change - Value changes
 * @fires nr-focus - Textarea focused
 * @fires nr-blur - Textarea blurred  
 * @fires nr-clear - Clear button clicked
 * @fires nr-resize - Textarea resized
 * 
 * @slot label - Textarea label
 * @slot helper-text - Helper text
 * @slot addon-before - Content before textarea
 * @slot addon-after - Content after textarea
 */
@customElement('nr-textarea')
export class NrTextareaElement extends NuralyUIBaseMixin(LitElement) 
  implements TextareaValidationHost, TextareaEventHost, ValidatableComponent {
  static override styles = styles;

  @query('textarea')
  private textareaElement!: HTMLTextAreaElement;

  // Controllers
  private validationController = new TextareaValidationController(this);
  private eventController = new TextareaEventController(this);

  /** Disables the textarea */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Makes the textarea read-only */
  @property({ type: Boolean, reflect: true })
  readonly = false;

  /** Visual state (default, success, warning, error) */
  @property({ type: String, reflect: true })
  state = TEXTAREA_STATE.Default;

  /** Current textarea value */
  @property({ type: String })
  value = EMPTY_STRING;

  /** Textarea size (small, medium, large) */
  @property({ type: String })
  size = TEXTAREA_SIZE.Medium;

  /** Visual variant (outlined, underlined, filled) */
  @property({ type: String, reflect: true })
  variant = TEXTAREA_VARIANT.Underlined;

  /** Resize behavior (none, vertical, horizontal, both) */
  @property({ type: String })
  resize = TEXTAREA_RESIZE.Vertical;

  /** Number of visible text lines */
  @property({ type: Number })
  rows = TEXTAREA_DEFAULTS.ROWS;

  /** Number of visible character columns */
  @property({ type: Number })
  cols = TEXTAREA_DEFAULTS.COLS;

  /** Placeholder text */
  @property({ type: String })
  placeholder = EMPTY_STRING;

  /** HTML autocomplete attribute */
  @property({ type: String })
  autocomplete = 'off';

  /** Field name for form submission */
  @property({ type: String })
  name?: string;

  /** Required field indicator */
  @property({ type: Boolean })
  required?: boolean;

  /** Shows clear button */
  @property({ type: Boolean, reflect: true })
  allowClear = false;

  /** Clearable alias for controller interface compatibility */
  get clearable(): boolean {
    return this.allowClear;
  }

  /** Shows character counter */
  @property({ type: Boolean, reflect: true })
  showCount = false;

  /** Maximum character limit */
  @property({ type: Number })
  maxLength?: number;

  /** Minimum height for auto-resize */
  @property({ type: Number })
  minHeight?: number;

  /** Maximum height for auto-resize */
  @property({ type: Number })
  maxHeight?: number;

  /** Auto-resize textarea based on content */
  @property({ type: Boolean })
  autoResize = false;

  /** Array of validation rules */
  @property({ type: Array })
  rules: ValidationRule[] = [];

  /** Validate on change */
  @property({ type: Boolean, attribute: 'validate-on-change' })
  validateOnChange = true;

  /** Validate on blur */
  @property({ type: Boolean, attribute: 'validate-on-blur' })
  validateOnBlur = true;

  /** Show validation status icon */
  @property({ type: Boolean, attribute: 'has-feedback' })
  hasFeedback = false;

  /** Custom validation message */
  @property({ type: String, attribute: 'validation-message' })
  validationMessage?: string;

  @state()
  private isFocused = false;

  @state()
  private validationResult?: TextareaValidationResult;

  @state()
  private characterCount = 0;

  private resizeObserver?: ResizeObserver;

  constructor() {
    super();
    // Initialize character count based on initial value
    this.characterCount = this.value.length;
    
    // Setup controller event listeners
    this.setupControllerListeners();
  }

  /**
   * Setup controller event listeners
   */
  private setupControllerListeners(): void {
    // Validation events
    this.addEventListener('textarea-validation', (e: any) => {
      this.validationResult = e.detail.validationResult;
    });

    // Input events  
    this.addEventListener('textarea-input', (e: any) => {
      this.handleControllerInput(e.detail.value);
    });

    // Focus/blur events
    this.addEventListener('textarea-focus', () => {
      this.isFocused = true;
    });

    this.addEventListener('textarea-blur', () => {
      this.isFocused = false;
      if (this.validateOnBlur) {
        this.validationController.validateOnBlurIfEnabled();
      }
    });

    // Clear events
    this.addEventListener('textarea-clear', (e: any) => {
      this.handleControllerClear(e.detail.previousValue);
    });
  }

  /**
   * Handle input from controller
   */
  private handleControllerInput(newValue: string): void {
    // Handle max length
    if (this.maxLength && newValue.length > this.maxLength) {
      this.value = newValue.slice(0, this.maxLength);
    } else {
      this.value = newValue;
    }

    this.characterCount = this.value.length;
    this.autoResizeIfNeeded();
    this.dispatchChangeEvent();

    // Validate if change validation is enabled
    if (this.validateOnChange) {
      this.validationController.validateOnChangeIfEnabled(this.value);
    }
  }

  /**
   * Handle clear from controller
   */
  private handleControllerClear(previousValue: string): void {
    this.characterCount = 0;
    this.dispatchChangeEvent();
    
    // Custom clear event for backward compatibility
    this.dispatchEvent(new CustomEvent('nr-clear', {
      detail: { value: this.value, previousValue },
      bubbles: true
    }));
  }

  override connectedCallback() {
    super.connectedCallback();
    this.setupResizeObserver();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupResizeObserver();
  }

  override firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);
    this.updateTextareaValue();
    this.autoResizeIfNeeded();
    
    // Setup resize observer for the textarea element
    if (this.resizeObserver && this.textareaElement) {
      this.resizeObserver.observe(this.textareaElement);
    }

    // Setup event controllers with DOM elements
    this.eventController.setupEventListeners();
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('value')) {
      this.characterCount = this.value.length;
      this.updateTextareaValue();
      this.autoResizeIfNeeded();
    }

    if (changedProperties.has('autoResize')) {
      this.autoResizeIfNeeded();
    }

    // Update validation rules if they changed
    if (changedProperties.has('rules')) {
      this.validationController.clearValidation();
      if (this.rules.length > 0 && this.value) {
        this.validationController.validate(this.value);
      }
    }
  }

  private setupResizeObserver() {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          this.dispatchResizeEvent(width, height);
        }
      });
    }
  }

  private cleanupResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
  }

  private updateTextareaValue() {
    if (this.textareaElement && this.textareaElement.value !== this.value) {
      this.textareaElement.value = this.value;
    }
  }

  private autoResizeIfNeeded() {
    if (!this.autoResize || !this.textareaElement) return;

    // Reset height to auto to get the natural scroll height
    this.textareaElement.style.height = 'auto';
    const scrollHeight = this.textareaElement.scrollHeight;

    // Apply min/max height constraints
    let newHeight = scrollHeight;
    if (this.minHeight && newHeight < this.minHeight) {
      newHeight = this.minHeight;
    }
    if (this.maxHeight && newHeight > this.maxHeight) {
      newHeight = this.maxHeight;
    }

    this.textareaElement.style.height = `${newHeight}px`;
  }

  /**
   * Handle input event (now delegated to event controller via addEventListener)
   */
  private handleInput(e: Event) {
    // This method is kept for backward compatibility but actual handling
    // is now done through the event controller
    this.eventController.handleInput(e);
  }

  /**
   * Handle focus event (now delegated to event controller)
   */
  private handleFocus(e: FocusEvent) {
    this.eventController.handleFocus(e);
    
    // Dispatch legacy event for backward compatibility
    this.dispatchEvent(new CustomEvent('nr-focus', {
      detail: { 
        focused: true,
        originalEvent: e
      },
      bubbles: true
    }));
  }

  /**
   * Handle blur event (now delegated to event controller)
   */
  private handleBlur(e: FocusEvent) {
    this.eventController.handleBlur(e);
    
    // Dispatch legacy event for backward compatibility
    this.dispatchEvent(new CustomEvent('nr-blur', {
      detail: { 
        focused: false,
        originalEvent: e
      },
      bubbles: true
    }));
  }

  /**
   * Handle clear event (now delegated to event controller)
   */
  private handleClear() {
    this.eventController.handleClear();
  }

  private dispatchChangeEvent() {
    const detail: TextareaChangeEvent = {
      value: this.value,
      length: this.characterCount,
      exceedsMaxLength: this.maxLength ? this.characterCount > this.maxLength : false,
      validation: this.validationResult
    };

    this.dispatchEvent(new CustomEvent('nr-textarea-change', {
      detail,
      bubbles: true
    }));
  }

  private dispatchResizeEvent(width: number, height: number) {
    const detail: TextareaResizeEvent = {
      width,
      height,
      direction: this.resize as any
    };

    this.dispatchEvent(new CustomEvent('nr-resize', {
      detail,
      bubbles: true
    }));
  }

  /**
   * Focus the textarea with optional configuration
   */
  override focus(options?: FocusOptions) {
    this.eventController.focus();
    
    // Handle cursor positioning if needed
    if (options?.cursor !== undefined || options?.select) {
      setTimeout(() => {
        if (!this.textareaElement) return;

        if (options?.cursor !== undefined) {
          if (typeof options.cursor === 'number') {
            this.eventController.setCursorPosition(options.cursor);
          } else if (options.cursor === 'start') {
            this.eventController.setCursorPosition(0);
          } else if (options.cursor === 'end') {
            this.eventController.setCursorPosition(this.value.length);
          } else if (options.cursor === 'all') {
            this.eventController.selectAll();
          }
        } else if (options?.select) {
          this.eventController.selectAll();
        }
      });
    }
  }

  /**
   * Blur the textarea
   */
  override blur() {
    this.eventController.blur();
  }

  /**
   * Get validation status
   */
  getValidationResult(): TextareaValidationResult | undefined {
    return this.validationController.validationResult;
  }

  /**
   * Trigger validation manually (ValidatableComponent interface)
   */
  async validate(): Promise<boolean> {
    const result = await this.validationController.validate(this.value);
    return result.isValid;
  }

  /**
   * Clear validation state
   */
  clearValidation() {
    this.validationController.clearValidation();
  }

  /**
   * Clear the textarea value
   */
  clear() {
    this.eventController.handleClear();
  }

  /**
   * Add a validation rule (ValidatableComponent interface)
   */
  addRule(rule: ValidationRule): void {
    this.validationController.addRule(rule);
  }

  /**
   * Remove validation rules matching predicate (ValidatableComponent interface)
   */
  removeRule(predicate: (rule: ValidationRule) => boolean): void {
    this.validationController.removeRule(predicate);
  }

  /**
   * Clear all validation rules (ValidatableComponent interface)
   */
  clearRules(): void {
    this.validationController.clearRules();
  }

  /**
   * Get current validation status (ValidatableComponent interface)
   */
  getValidationStatus(): ValidationStatus {
    const result = this.validationController.validationResult;
    return {
      isValid: result?.isValid ?? true,
      errors: result?.level === 'error' ? result.messages : [],
      warnings: result?.level === 'warning' ? result.messages : []
    };
  }

  /**
   * Check if the textarea value is valid
   */
  isValid(): boolean {
    return this.validationController.isValid();
  }

  // Form integration methods (FormFieldCapable interface)

  /**
   * Check validity (HTML form API compatibility)
   */
  checkValidity(): boolean {
    return this.validationController.isValid();
  }

  /**
   * Report validity (HTML form API compatibility)
   */
  reportValidity(): boolean {
    const isValid = this.validationController.isValid();
    if (!isValid) {
      // Trigger validation to show error messages
      this.validationController.validate(this.value);
    }
    return isValid;
  }

  /**
   * Set custom validity message (HTML form API compatibility)
   */
  setCustomValidity(message: string): void {
    if (message) {
      // Add custom validation rule
      this.validationController.addRule({
        validator: () => false,
        message,
        level: 'error',
        blocking: true
      });
    } else {
      // Remove custom validation rules
      this.validationController.removeRule(rule => rule.message === message);
    }
  }

  /**
   * Trigger validation manually (enhanced version)
   */
  async validateTextarea(): Promise<boolean> {
    const result = await this.validationController.validate(this.value);
    return result.isValid;
  }

  /**
   * Set validation state externally (for form integration)
   */
  setValidationStatus(result: TextareaValidationResult): void {
    this.validationResult = result;
    
    // Update state based on validation result
    if (result.level === 'error') {
      this.state = TEXTAREA_STATE.Error;
    } else if (result.level === 'warning') {
      this.state = TEXTAREA_STATE.Warning;
    } else if (result.isValid) {
      this.state = TEXTAREA_STATE.Success;
    }
    
    this.requestUpdate();
  }

  private renderLabel() {
    return html`
      <div class="textarea-label">
        <slot name="label"></slot>
        ${this.required ? html`<span class="required-indicator">*</span>` : ''}
      </div>
    `;
  }

  private renderTextarea() {
    return html`
      <textarea
        class="textarea-element"
        .value=${this.value}
        .disabled=${this.disabled}
        .readOnly=${this.readonly}
        .required=${this.required || false}
        .rows=${this.rows}
        .cols=${this.cols}
        .placeholder=${this.placeholder}
        .autocomplete=${this.autocomplete}
        .name=${this.name || ''}
        maxlength=${this.maxLength || ''}
        style="resize: ${this.resize}"
        @input=${this.handleInput}
        @focus=${this.handleFocus}
        @blur=${this.handleBlur}
      ></textarea>
    `;
  }

  private renderValidationIcon() {
    if (!this.hasFeedback || !this.validationResult) return '';

    const iconName = this.validationResult.level === 'error' ? 'error' :
                     this.validationResult.level === 'warning' ? 'warning' : 'check-circle';

    return html`
      <nr-icon 
        class="validation-icon ${this.validationResult.level}"
        name="${iconName}"
        size="small"
      ></nr-icon>
    `;
  }

  private renderClearButton() {
    if (!this.allowClear || !this.value || this.disabled || this.readonly) return '';

    return html`
      <button
        class="clear-button"
        type="button"
        @click=${this.handleClear}
        aria-label="Clear textarea"
      >
        <nr-icon name="x" size="small"></nr-icon>
      </button>
    `;
  }

  private renderCharacterCount() {
    if (!this.showCount) return '';

    const maxText = this.maxLength ? ` / ${this.maxLength}` : '';
    const isOverLimit = this.maxLength && this.characterCount > this.maxLength;

    return html`
      <div class="character-count ${isOverLimit ? 'over-limit' : ''}">
        ${this.characterCount}${maxText}
      </div>
    `;
  }

  private renderHelperText() {
    const hasHelperSlot = this.shadowRoot?.querySelector('slot[name="helper-text"]') as HTMLSlotElement;
    const hasHelperSlotContent = hasHelperSlot?.assignedNodes().length;
    const hasValidationMessages = this.validationResult?.messages.length;

    if (!hasHelperSlotContent && !hasValidationMessages) return '';

    return html`
      <div class="helper-text">
        ${hasValidationMessages ? 
          this.validationResult!.messages.map(msg => html`<div class="validation-message ${this.validationResult!.level}">${msg}</div>`) :
          html`<slot name="helper-text"></slot>`
        }
      </div>
    `;
  }

  override render() {
    const classes = [
      'textarea-container',
      `size-${this.size}`,
      `variant-${this.variant}`,
      `state-${this.state}`,
      this.isFocused ? 'focused' : '',
      this.disabled ? 'disabled' : '',
      this.readonly ? 'readonly' : '',
      this.validationResult ? `validation-${this.validationResult.level}` : ''
    ].filter(Boolean).join(' ');

    return html`
      <div class="${classes}">
        ${this.renderLabel()}
        
        <div class="textarea-wrapper">
          <div class="addon-before">
            <slot name="addon-before"></slot>
          </div>
          
          <div class="textarea-input-container">
            ${this.renderTextarea()}
            ${this.renderValidationIcon()}
            ${this.renderClearButton()}
          </div>
          
          <div class="addon-after">
            <slot name="addon-after"></slot>
          </div>
        </div>
        
        <div class="textarea-footer">
          ${this.renderHelperText()}
          ${this.renderCharacterCount()}
        </div>
      </div>
    `;
  }
}