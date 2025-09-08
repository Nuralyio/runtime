/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, PropertyValues, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styles } from './input.style.js';
import { INPUT_TYPE, INPUT_STATE, INPUT_SIZE, INPUT_VARIANT, EMPTY_STRING, FocusChangeEvent } from './input.types.js';
import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';
import { InputValidationUtils, InputRenderUtils } from './utils/index.js';
import { SelectionMixin, FocusMixin, NumberMixin } from './mixins/index.js';

const InputBaseMixin = NumberMixin(FocusMixin(SelectionMixin(NuralyUIBaseMixin(LitElement))));
@customElement('nr-input')
export class NrInputElement extends InputBaseMixin {
  static override styles = styles;

  // ========================================
  // PROPERTIES
  // ========================================

  @property({type: Boolean, reflect: true})
  disabled = false;

  @property({type: Boolean, reflect: true})
  readonly = false;

  @property({type: String, reflect: true})
  state = INPUT_STATE.Default;

  @property({type: String})
  value = EMPTY_STRING;

  @property({type: String})
  size = INPUT_SIZE.Medium;

  @property({type: String, reflect: true})
  variant = INPUT_VARIANT.Underlined;

  @property({reflect: true})
  type = INPUT_TYPE.TEXT;

  @property({type: String})
  step?: string;

  @property({type: String})
  min?: string;

  @property({type: String})
  max?: string;

  @property({type: String})
  placeholder = EMPTY_STRING;

  @property({type: String})
  autocomplete = 'off';

  @property({type: Boolean, reflect: true})
  withCopy = false;

  @property({type: Boolean, reflect: true})
  allowClear = false;

  @property({type: Boolean, reflect: true})
  showCount = false;

  @property({type: Number})
  maxLength?: number;

  // ========================================
  // STATE
  // ========================================

  @state()
  inputType = EMPTY_STRING;

  @state()
  hasAddonBefore = false;

  @state()
  hasAddonAfter = false;

  @state()
  focused = false;

  // Use manual query instead of @query decorator to avoid TypeScript mixin issues
  private get _input(): HTMLInputElement {
    return this.shadowRoot!.querySelector('#input') as HTMLInputElement;
  }

  // ========================================
  // COMPUTED PROPERTIES
  // ========================================

  /**
   * Get the character count display text
   */
  get characterCountDisplay(): string {
    const currentLength = this.value.length;
    if (this.maxLength) {
      return `${currentLength}/${this.maxLength}`;
    }
    return `${currentLength}`;
  }

  /**
   * Check if character count is over the limit
   */
  get isOverCharacterLimit(): boolean {
    return this.maxLength ? this.value.length > this.maxLength : false;
  }

  // ========================================
  // COMPUTED PROPERTIES
  // ========================================

  /**
   * Get the input element
   */
  protected get input(): HTMLInputElement {
    return this._input;
  }

  /**
   * Override inputElement getter from mixins to use our @query property
   */
  protected get inputElement(): HTMLInputElement {
    return this._input;
  }

  // ========================================
  // LIFECYCLE METHODS
  // ========================================

  /**
   * Required components that must be registered for this component to work properly
   */
  override requiredComponents = ['nr-icon'];

  /**
   * Check for required dependencies when component is connected to DOM
   */
  override connectedCallback() {
    super.connectedCallback();
  }

  override willUpdate(_changedProperties: PropertyValues): void {
    super.willUpdate(_changedProperties);

    // Initialize inputType when type changes or on first render
    if (_changedProperties.has('type') || !this.inputType) {
      this.inputType = this.type;
    }

    // Set default value for number inputs with min
    if (_changedProperties.has('type') || _changedProperties.has('min')) {
      if (this.type === INPUT_TYPE.NUMBER && this.min && !this.value) {
        this.value = this.min;
      }
    }

    // Validate numeric properties when they change
    if (_changedProperties.has('type') || 
        _changedProperties.has('min') || 
        _changedProperties.has('max') || 
        _changedProperties.has('step')) {
      InputValidationUtils.validateNumericProperties(this.type, this.min, this.max, this.step);
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
  }

  override firstUpdated(): void {
    this._checkInitialSlotContent();
  }

  // ========================================
  // PRIVATE METHODS
  // ========================================

  /**
   * Check initial slot content on first render
   */
  private _checkInitialSlotContent(): void {
    // Check for addon-before content
    const addonBeforeElements = this.querySelectorAll('[slot="addon-before"]');
    this.hasAddonBefore = addonBeforeElements.length > 0;

    // Check for addon-after content  
    const addonAfterElements = this.querySelectorAll('[slot="addon-after"]');
    this.hasAddonAfter = addonAfterElements.length > 0;
  }

  /**
   * Handle slot changes to determine addon visibility
   */
  private _handleSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const slotName = slot.name;
    
    if (slotName === 'addon-before') {
      this.hasAddonBefore = slot.assignedElements().length > 0;
    } else if (slotName === 'addon-after') {
      this.hasAddonAfter = slot.assignedElements().length > 0;
    }
  }

  // ========================================
  // FOCUS MANAGEMENT METHODS
  // ========================================

  // Focus methods are provided by InputMixin

  // ========================================
  // EVENT HANDLING METHODS
  // ========================================

  // Event handling methods moved to EventHandlerMixin

  private _handleKeyDown(keyDownEvent: KeyboardEvent): void {
    // Prevent all key input when readonly - use mixin utility
    if (this.readonly && !this.isReadonlyKeyAllowed(keyDownEvent)) {
      keyDownEvent.preventDefault();
      return;
    }

    // Handle Enter key
    if (keyDownEvent.key === 'Enter') {
      this.dispatchCustomEvent('nr-enter', {
        target: keyDownEvent.target,
        value: this.value,
        originalEvent: keyDownEvent
      });
      return;
    }

    // Prevent non-numeric input for number type
    if (this.type === INPUT_TYPE.NUMBER) {
      InputValidationUtils.preventNonNumericInput(keyDownEvent, this.min);
      
      if (keyDownEvent.defaultPrevented) {
        this.dispatchCustomEvent('nr-invalid-key', {
          key: keyDownEvent.key,
          target: keyDownEvent.target,
          value: this.value,
          originalEvent: keyDownEvent
        });
      }
    }
  }

  private _valueChange(e: Event): void {
    if (this.readonly) {
      e.preventDefault();
      return;
    }

    const target = e.target as HTMLInputElement;
    const newValue = target.value;
    
    // Check character limit
    if (this.maxLength && newValue.length > this.maxLength) {
      this.dispatchCustomEvent('nr-character-limit-exceeded', {
        value: newValue,
        target: target,
        limit: this.maxLength,
        originalEvent: e
      });
      // Note: HTML maxlength attribute usually prevents this, but we dispatch event for awareness
    }
    
    if (this.type === INPUT_TYPE.NUMBER && newValue) {
      const validation = InputValidationUtils.validateNumericValue(newValue, this.min, this.max);
      
      if (!validation.isValid) {
        console.warn(validation.warnings[0]);
        this.dispatchValidationEvent('nr-validation-error', {
          value: newValue,
          target: target,
          error: validation.warnings[0],
          originalEvent: e,
          isValid: false
        });
        return;
      }
      
      validation.warnings.forEach(warning => console.warn(warning));
    }
    
    this.value = newValue;
    this.dispatchInputEvent('nr-input', {
      value: this.value, 
      target: target,
      originalEvent: e 
    });
  }

  private _focusEvent(e: Event): void {
    this.focused = true;
    
    // Handle cursor restoration if requested
    const input = e.target as HTMLInputElement;
    if (input.dataset.restoreCursor) {
      const position = parseInt(input.dataset.restoreCursor, 10);
      this.setCursorPosition(position);
      delete input.dataset.restoreCursor;
    }
    
    const focusDetail: FocusChangeEvent = {
      focused: true,
      cursorPosition: this.getCursorPosition() ?? undefined,
      selectedText: this.getSelectedText()
    };
    
    this.dispatchFocusEvent('nr-focus', {
      target: e.target,
      value: this.value,
      ...focusDetail
    });
    
    this.dispatchFocusEvent('nr-focus-change', focusDetail);
  }

  private _blurEvent(e: Event): void {
    this.focused = false;
    
    const focusDetail: FocusChangeEvent = {
      focused: false,
      cursorPosition: this.getCursorPosition() ?? undefined,
      selectedText: this.getSelectedText()
    };
    
    this.dispatchFocusEvent('nr-blur', {
      target: e.target,
      value: this.value,
      ...focusDetail
    });
    
    this.dispatchFocusEvent('nr-focus-change', focusDetail);
  }

  private _handleIconKeydown(keyDownEvent: KeyboardEvent): void {
    if (this.isActivationKey(keyDownEvent)) {
      keyDownEvent.preventDefault();
      const target = keyDownEvent.target as HTMLElement;
      
      if (target.id === 'copy-icon') {
        this._onCopy();
      } else if (target.id === 'clear-icon') {
        this._onClear();
      } else if (target.id === 'password-icon') {
        this._togglePasswordIcon();
      } else if (target.closest('#number-icons')) {
        if (target.getAttribute('name') === 'plus') {
          this._increment();
        } else if (target.getAttribute('name') === 'minus') {
          this._decrement();
        }
      }
    }
  }

  private async _onCopy(): Promise<void> {
    try {
      const input = this.shadowRoot!.getElementById('input')! as HTMLInputElement;
      input.select();
      await navigator.clipboard.writeText(input.value);
      
      this.dispatchActionEvent('nr-copy-success', { 
        value: input.value,
        action: 'copy'
      });
    } catch (error) {
      this.dispatchCustomEvent('nr-copy-error', { error });
    }
  }

  private _onClear(): void {
    if (this.disabled || this.readonly) {
      return;
    }

    const previousValue = this.value;
    this.value = EMPTY_STRING;
    
    // Update the input element value
    if (this.input) {
      this.input.value = EMPTY_STRING;
    }

    this.dispatchActionEvent('nr-clear', {
      previousValue,
      newValue: this.value,
      target: this.input,
      action: 'clear'
    });

    // Also dispatch input event for consistency
    this.dispatchInputEvent('nr-input', {
      value: this.value,
      target: this.input,
      action: 'clear'
    });
  }

  // ========================================
  // OPERATION METHODS
  // ========================================

  private _increment(): void {
    this.increment();
  }

  private _decrement(): void {
    this.decrement();
  }

  private _togglePasswordIcon(): void {
    if (this.inputType === INPUT_TYPE.PASSWORD) {
      this.inputType = INPUT_TYPE.TEXT;
    } else if (this.inputType === INPUT_TYPE.TEXT && this.type === INPUT_TYPE.PASSWORD) {
      this.inputType = INPUT_TYPE.PASSWORD;
    }
  }

  private _getAriaDescribedBy(): string {
    const describedBy: string[] = [];
    
    const helperSlot = this.shadowRoot?.querySelector('slot[name="helper-text"]');
    if (helperSlot && (helperSlot as HTMLSlotElement).assignedNodes().length > 0) {
      describedBy.push('helper-text');
    }
    
    return describedBy.join(' ') || '';
  }

  // ========================================
  // RENDER METHODS
  // ========================================

  override render() {
    return html`
      <slot name="label"></slot>
      <div class="input-wrapper" data-theme="${this.currentTheme}">
        ${InputRenderUtils.renderAddonBefore(this.hasAddonBefore, (e: Event) => this._handleSlotChange(e))}
        <div data-size=${this.size} id="input-container">
          ${InputRenderUtils.renderPrefix()}
          <input
            id="input"
            .disabled=${this.disabled}
            .readOnly=${this.readonly}
            .value=${this.value}
            .placeholder=${this.placeholder}
            .type="${this.inputType}"
            .autocomplete=${this.autocomplete}
            aria-invalid=${this.state === INPUT_STATE.Error ? 'true' : 'false'}
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
          ${InputRenderUtils.renderStateIcon(this.state)}
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
      ${this.showCount ? html`
        <div class="character-count" ?data-over-limit=${this.isOverCharacterLimit}>
          ${this.characterCountDisplay}
        </div>
      ` : ''}
    `;
  }
}

