/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, PropertyValues, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { styles } from './input.style.js';
import { INPUT_TYPE, INPUT_STATE, INPUT_SIZE, EMPTY_STRING } from './input.types.js';
import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';
import { InputValidationUtils } from './utils/input-validation.utils.js';
import { InputRenderUtils } from './utils/input-renderers.js';
import '../icon/icon.component.js';

@customElement('nr-input')
export class NrInputElement extends NuralyUIBaseMixin(LitElement) {

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

  @state()
  inputType = EMPTY_STRING;

  @state()
  hasAddonBefore = false;

  @state()
  hasAddonAfter = false;

  @query('#input')
  input!: HTMLInputElement;

  /**
   * Required components that must be registered for this component to work properly
   */
  override requiredComponents = ['hy-icon'];

  /**
   * Check for required dependencies when component is connected to DOM
   */
  override connectedCallback() {
    super.connectedCallback();
    this.validateDependencies();
  }

  override willUpdate(_changedProperties: PropertyValues): void {
    if (_changedProperties.has('type')) {
      this.inputType = this.type;
      if (this.inputType === INPUT_TYPE.NUMBER && this.min && !this.value) {
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
    if (_changedProperties.has('step') || _changedProperties.has('min') || _changedProperties.has('max')) {
      const input = this.input;
      if (input) {
        if (this.step) input.setAttribute('step', this.step);
        else input.removeAttribute('step');
        
        if (this.min) input.setAttribute('min', this.min);
        else input.removeAttribute('min');
        
        if (this.max) input.setAttribute('max', this.max);
        else input.removeAttribute('max');
      }
    }
  }

  override firstUpdated(): void {
    this._checkInitialSlotContent();
  }

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
  // EVENT HANDLING METHODS
  // ========================================

  /**
   * Centralized event dispatcher to ensure consistent event structure
   */
  private _dispatchInputEvent(eventName: string, detail: any): void {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail,
        bubbles: true
      })
    );
  }

  private _handleKeyDown(keyDownEvent: KeyboardEvent) {
    // Prevent all key input when readonly
    if (this.readonly) {
      const allowedReadonlyKeys = [
        'Tab', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Home', 'End', 'PageUp', 'PageDown'
      ];
      
      if (keyDownEvent.ctrlKey || keyDownEvent.metaKey) {
        const allowedCombinations = ['KeyA', 'KeyC'];
        if (allowedCombinations.includes(keyDownEvent.code)) {
          return;
        }
      }
      
      if (!allowedReadonlyKeys.includes(keyDownEvent.key)) {
        keyDownEvent.preventDefault();
        return;
      }
    }

    // Handle Enter key
    if (keyDownEvent.key === 'Enter') {
      this._dispatchInputEvent('nr-enter', {
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
        this._dispatchInputEvent('nr-invalid-key', {
          key: keyDownEvent.key,
          target: keyDownEvent.target,
          value: this.value,
          originalEvent: keyDownEvent
        });
      }
    }
  }

  private _valueChange(e: Event) {
    if (this.readonly) {
      e.preventDefault();
      return;
    }

    const target = e.target as HTMLInputElement;
    const newValue = target.value;
    
    if (this.type === INPUT_TYPE.NUMBER && newValue) {
      const validation = InputValidationUtils.validateNumericValue(newValue, this.min, this.max);
      
      if (!validation.isValid) {
        console.warn(validation.warnings[0]);
        this._dispatchInputEvent('nr-validation-error', {
          value: newValue,
          target: target,
          error: validation.warnings[0],
          originalEvent: e
        });
        return;
      }
      
      validation.warnings.forEach(warning => console.warn(warning));
    }
    
    this.value = newValue;
    this._dispatchInputEvent('nr-input', {
      value: this.value, 
      target: target,
      originalEvent: e 
    });
  }

  private _focusEvent(e: Event) {
    this._dispatchInputEvent('nr-focus', {
      target: e.target,
      value: this.value
    });
  }

  private _handleIconKeydown(keyDownEvent: KeyboardEvent) {
    if (keyDownEvent.key === 'Enter' || keyDownEvent.key === ' ') {
      keyDownEvent.preventDefault();
      const target = keyDownEvent.target as HTMLElement;
      
      if (target.id === 'copy-icon') {
        this._onCopy();
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

  private async _onCopy() {
    try {
      const input = this.shadowRoot!.getElementById('input')! as HTMLInputElement;
      input.select();
      await navigator.clipboard.writeText(input.value);
      
      this._dispatchInputEvent('nr-copy-success', { value: input.value });
    } catch (error) {
      this._dispatchInputEvent('nr-copy-error', { error });
    }
  }

  // ========================================
  // OPERATION METHODS
  // ========================================

  private _increment() {
    try {
      this.input.stepUp();
      this.value = this.input.value;
      this._dispatchInputEvent('nr-input', {
        value: this.value, 
        target: this.input,
        action: 'increment'
      });
    } catch (error) {
      console.warn('Failed to increment value:', error);
      this._dispatchInputEvent('nr-increment-error', {
        error,
        value: this.value,
        target: this.input
      });
    }
  }

  private _decrement() {
    try {
      this.input.stepDown();
      this.value = this.input.value;
      this._dispatchInputEvent('nr-input', {
        value: this.value, 
        target: this.input,
        action: 'decrement'
      });
    } catch (error) {
      console.warn('Failed to decrement value:', error);
      this._dispatchInputEvent('nr-decrement-error', {
        error,
        value: this.value,
        target: this.input
      });
    }
  }

  private _togglePasswordIcon() {
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
    `;
  }

  static override styles = styles;
}

