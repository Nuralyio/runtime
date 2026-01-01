/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, PropertyValues, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styles } from './input.style.js';
import {
  INPUT_TYPE,
  INPUT_STATE,
  INPUT_SIZE,
  INPUT_VARIANT,
  EMPTY_STRING,
  ValidationRule,
  InputValidationResult
} from './input.types.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import { InputValidationUtils, InputRenderUtils } from './utils/index.js';
import { SelectionMixin, FocusMixin, NumberMixin } from './mixins/index.js';
import {
  InputValidationController,
  InputValidationHost,
  InputEventController,
  InputEventHost
} from './controllers/index.js';

/**
 * Versatile input component with validation, multiple types, and interactive features.
 * 
 * @example
 * ```html
 * <nr-input type="text" placeholder="Enter name"></nr-input>
 * <nr-input type="password"></nr-input>
 * <nr-input type="number" min="0" max="100"></nr-input>
 * ```
 * 
 * @fires nr-input - Value changes
 * @fires nr-focus - Input focused
 * @fires nr-blur - Input blurred  
 * @fires nr-enter - Enter key pressed
 * @fires nr-clear - Clear button clicked
 * 
 * @slot label - Input label
 * @slot helper-text - Helper text
 * @slot addon-before - Content before input
 * @slot addon-after - Content after input
 */
@customElement('nr-input')
export class NrInputElement extends NumberMixin(
  FocusMixin(
    SelectionMixin(
      NuralyUIBaseMixin(LitElement)
    ) 
  )
) implements InputValidationHost, InputEventHost {
  static override styles = styles;
  
  private validationController = new InputValidationController(this);
  private eventController = new InputEventController(this);

  /** Disables the input */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Makes the input read-only */
  @property({ type: Boolean, reflect: true })
  readonly = false;

  /** Visual state (default, success, warning, error) */
  @property({ type: String, reflect: true })
  state = INPUT_STATE.Default;

  /** Current input value */
  @property({ type: String, reflect: true })
  value = EMPTY_STRING;

  /** Input size (small, medium, large) */
  @property({ type: String })
  size = INPUT_SIZE.Medium;

  /** Visual variant (outlined, underlined, filled) */
  @property({ type: String, reflect: true })
  variant = INPUT_VARIANT.Outlined;

  /** Input type (text, password, number, email, etc.) */
  @property({ reflect: true })
  type = INPUT_TYPE.TEXT;

  /** Step value for number inputs */
  @property({ type: String })
  step?: string;

  /** Minimum value for number inputs */
  @property({ type: String })
  min?: string;

  /** Maximum value for number inputs */
  @property({ type: String })
  max?: string;

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

  /** Shows copy button */
  @property({ type: Boolean, reflect: true })
  withCopy = false;

  /** Shows clear button */
  @property({ type: Boolean, reflect: true })
  allowClear = false;

  /** Shows character counter */
  @property({ type: Boolean, reflect: true })
  showCount = false;

  /** Maximum character limit */
  @property({ type: Number })
  maxLength?: number;


  /** Array of validation rules */
  @property({ type: Array })
  rules: ValidationRule[] = [];

  /** Validate on change */
  @property({ type: Boolean, attribute: 'validate-on-change' })
  validateOnChangeInput = true;

  /** Validate on blur */
  @property({ type: Boolean, attribute: 'validate-on-blur' })
  validateOnBlurInput = true;

  /** Show validation status icon */
  @property({ type: Boolean, attribute: 'has-feedback' })
  hasFeedback = false;

  /** Allow validation warnings */
  @property({ type: Boolean, attribute: 'allow-warnings' })
  allowWarnings = false;

  /** Custom validation trigger */
  @property({ type: String, attribute: 'validation-trigger' })
  validationTrigger: 'change' | 'blur' | 'submit' = 'change';

  /** Validation debounce delay in milliseconds */
  @property({ type: Number, attribute: 'validation-debounce' })
  validationDebounce?: number;

  /** Input label for better error messages */
  @property({ type: String })
  label?: string;

  /** Debounce delay in milliseconds for input events */
  @property({ type: Number })
  debounce = 0;

  /** Validation message */
  @state()
  validationMessage?: string;


  @state()
  inputType = EMPTY_STRING;

  @state()
  hasAddonBefore = false;

  @state()
  hasAddonAfter = false;

  @state()
  focused = false;

  private get _input(): HTMLInputElement {
    return this.shadowRoot!.querySelector('#input') as HTMLInputElement;
  }


  get characterCountDisplay(): string {
    const currentLength = this.value.length;
    if (this.maxLength) {
      return `${currentLength}/${this.maxLength}`;
    }
    return `${currentLength}`;
  }

  get isOverCharacterLimit(): boolean {
    return this.maxLength ? this.value.length > this.maxLength : false;
  }

  protected get input(): HTMLInputElement {
    return this._input;
  }

  protected get inputElement(): HTMLInputElement {
    return this._input;
  }



  override requiredComponents = ['nr-icon'];

  override connectedCallback() {
    super.connectedCallback();
    
    this.addEventListener('nr-validation', this._handleValidationEvent as EventListener);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener('nr-validation', this._handleValidationEvent as EventListener);

    this.validationController.clearDebounceTimer?.();
    this.eventController.clearDebounceTimer?.();
  }

  /**
   * Handle validation events from the controller
   */
  private _handleValidationEvent = (event: Event) => {
    const customEvent = event as CustomEvent;
    const detail = customEvent.detail;
    
    this.validationMessage = detail.validationMessage || '';
    
    let newState = INPUT_STATE.Default;
    
    if (detail.validationResult.hasError) {
      newState = INPUT_STATE.Error;
    } else if (detail.validationResult.hasWarning && this.allowWarnings) {
      newState = INPUT_STATE.Warning;
    } else if (detail.validationResult.isValid && this.value && this.hasFeedback) {
      newState = INPUT_STATE.Success;
    }
    
    if (this.state !== newState) {
      this.state = newState;
    }
    
    this.requestUpdate();
  }

  override willUpdate(_changedProperties: PropertyValues): void {
    super.willUpdate(_changedProperties);

    if (_changedProperties.has('type') || !this.inputType) {
      this.inputType = this.type;
    }

    if (_changedProperties.has('type') || _changedProperties.has('min')) {
      if (this.type === INPUT_TYPE.NUMBER && this.min && !this.value) {
        this.value = this.min;
      }
    }

    if (_changedProperties.has('type') ||
      _changedProperties.has('min') ||
      _changedProperties.has('max') ||
      _changedProperties.has('step')) {
      InputValidationUtils.validateNumericProperties(this.type, this.min, this.max, this.step);
    }

    if (_changedProperties.has('type') || 
        _changedProperties.has('required') || 
        _changedProperties.has('maxLength') ||
        _changedProperties.has('min') ||
        _changedProperties.has('max')) {
      this.validationController.setupValidationRules();
    }
  }

  override updated(_changedProperties: PropertyValues): void {
    if (_changedProperties.has('step') || _changedProperties.has('min') || _changedProperties.has('max') || _changedProperties.has('maxLength')) {
      const input = this.input;
      if (input) {
        this.setStep(this.step);

        if (this.min) input.setAttribute('min', this.min);
        else input.removeAttribute('min');

        if (this.max) input.setAttribute('max', this.max);
        else input.removeAttribute('max');

        if (this.maxLength) input.setAttribute('maxlength', this.maxLength.toString());
        else input.removeAttribute('maxlength');
      }
    }

    // Sync input element value when property changes externally
    if (_changedProperties.has('value')) {
      const input = this.input;
      if (input && input.value !== this.value) {
        input.value = this.value;
      }
    }
  }

  override firstUpdated(): void {
    this._checkInitialSlotContent();
  }


  private _checkInitialSlotContent(): void {
    const addonBeforeElements = this.querySelectorAll('[slot="addon-before"]');
    this.hasAddonBefore = addonBeforeElements.length > 0;

    const addonAfterElements = this.querySelectorAll('[slot="addon-after"]');
    this.hasAddonAfter = addonAfterElements.length > 0;
  }

  private _handleSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const slotName = slot.name;

    if (slotName === 'addon-before') {
      this.hasAddonBefore = slot.assignedElements().length > 0;
    } else if (slotName === 'addon-after') {
      this.hasAddonAfter = slot.assignedElements().length > 0;
    }
  }


  private _handleKeyDown = (keyDownEvent: KeyboardEvent): void => {
    this.eventController.handleKeyDown(keyDownEvent);
  };

  private _valueChange = (e: Event): void => {
    this.eventController.handleValueChange(e);
  };

  private _focusEvent = (e: Event): void => {
    this.eventController.handleFocus(e);
  };

  private _blurEvent = (e: Event): void => {
    this.eventController.handleBlur(e);
  };

  private _handleIconKeydown = (keyDownEvent: KeyboardEvent): void => {
    this.eventController.handleIconKeydown(keyDownEvent);
  };

  private async _onCopy(): Promise<void> {
    await this.eventController.handleCopy();
  }

  private _onClear(): void {
    this.eventController.handleClear();
  }


  private _increment(): void {
    this.eventController.handleIncrement();
  }

  private _decrement(): void {
    this.eventController.handleDecrement();
  }

  private _togglePasswordIcon(): void {
    this.eventController.handleTogglePassword();
  }

  private _getAriaDescribedBy(): string {
    const describedBy: string[] = [];

    const helperSlot = this.shadowRoot?.querySelector('slot[name="helper-text"]');
    if (helperSlot && (helperSlot as HTMLSlotElement).assignedNodes().length > 0) {
      describedBy.push('helper-text');
    }

    return describedBy.join(' ') || '';
  }

  /**
   * Setup default validation rules based on input properties
   */
  /**
   * Override the form mixin's validateValue method with controller logic
   */
  protected validateValue(_value: string): boolean {
    return this.validationController.validate();
  }

  /**
   * Add validation rule dynamically
   */
  addRule(rule: ValidationRule): void {
    this.validationController.addRule(rule);
  }

  /**
   * Remove validation rule
   */
  removeRule(predicate: (rule: ValidationRule) => boolean): void {
    this.validationController.removeRule(predicate);
  }

  /**
   * Clear all validation rules
   */
  clearRules(): void {
    this.validationController.clearRules();
  }

  /**
   * Get current validation status
   */
  getValidationStatus(): {
    isValid: boolean;
    isValidating: boolean;
    errors: string[];
    warnings: string[];
  } {
    return this.validationController.getValidationStatus();
  }

  /**
   * Trigger validation manually
   */
  async validateInput(): Promise<boolean> {
    const result = this.validationController.validate();
    
    if (this.validationController.isValidating) {
      return new Promise((resolve) => {
        const checkValidation = () => {
          if (!this.validationController.isValidating) {
            resolve(this.validationController.isValid);
          } else {
            setTimeout(checkValidation, 50);
          }
        };
        checkValidation();
      });
    }
    
    return result;
  }

  /**
   * Set validation state externally (for form integration)
   */
  setValidationStatus(result: InputValidationResult): void {
    this.validationController.setValidationStatus(result);
  }

  /**
   * Get validation classes for CSS styling
   */
  protected getValidationClasses(): Record<string, boolean> {
    return this.validationController.getValidationClasses();
  }

  /**
   * Render validation feedback icon
   */
  private renderValidationIcon() {
    return this.validationController.renderValidationIcon();
  }

  /**
   * Render validation message
   */
  private renderValidationMessage() {
    return this.validationController.renderValidationMessage();
  }


  override render() {
    const validationClasses = this.getValidationClasses();
    const validationRenderState = this.validationController.getValidationRenderState();
    
    return html`
      <slot name="label"></slot>
      <div class="input-wrapper ${Object.entries(validationClasses).filter(([, value]) => value).map(([key]) => key).join(' ')}" 
           part="input-wrapper" 
           data-theme="${this.currentTheme}"
           ?data-validating="${validationRenderState.isValidating}">
        ${InputRenderUtils.renderAddonBefore(this.hasAddonBefore, (e: Event) => this._handleSlotChange(e))}
        <div data-size=${this.size} id="input-container" part="input-container">
          ${InputRenderUtils.renderPrefix()}
          <input
            id="input"
            part="input"
            .disabled=${this.disabled}
            .readOnly=${this.readonly}
            .value=${this.value}
            .placeholder=${this.placeholder}
            .type="${this.inputType}"
            .autocomplete=${this.autocomplete}
            aria-invalid=${validationRenderState.validationResult.hasError ? 'true' : 'false'}
            aria-describedby=${this._getAriaDescribedBy()}
            @input=${this._valueChange}
            @focus=${this._focusEvent}
            @blur=${this._blurEvent}
            @keydown=${this._handleKeyDown}
          />
          ${InputRenderUtils.renderSuffix()}
          ${InputRenderUtils.renderCopyIcon(
            this.withCopy,
            this.disabled,
            this.readonly,
            () => this._onCopy(),
            (e: KeyboardEvent) => this._handleIconKeydown(e)
          )}
          ${InputRenderUtils.renderClearIcon(
            this.allowClear,
            this.value,
            this.disabled,
            this.readonly,
            () => this._onClear(),
            (e: KeyboardEvent) => this._handleIconKeydown(e)
          )}
          ${validationRenderState.hasValidationFeedback ? this.renderValidationIcon() : InputRenderUtils.renderStateIcon(this.state)}
          ${InputRenderUtils.renderCalendarIcon(this.state, this.type)}
          ${InputRenderUtils.renderPasswordIcon(
            this.type,
            this.inputType,
            this.disabled,
            this.readonly,
            () => this._togglePasswordIcon(),
            (e: KeyboardEvent) => this._handleIconKeydown(e)
          )}
          ${InputRenderUtils.renderNumberIcons(
            this.type,
            this.state,
            this.disabled,
            this.readonly,
            () => this._increment(),
            () => this._decrement(),
            (e: KeyboardEvent) => this._handleIconKeydown(e)
          )}
        </div>
        ${InputRenderUtils.renderAddonAfter(this.hasAddonAfter, (e: Event) => this._handleSlotChange(e))}
      </div>
      <slot name="helper-text"></slot>
      ${this.renderValidationMessage()}
      ${this.showCount ? html`
        <div class="character-count" part="character-count" ?data-over-limit=${this.isOverCharacterLimit}>
          ${this.characterCountDisplay}
        </div>
      ` : ''}
    `;
  }
}

