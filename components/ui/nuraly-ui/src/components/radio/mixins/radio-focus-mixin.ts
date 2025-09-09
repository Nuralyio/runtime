/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { RadioButtonOption } from '../radio.type.js';

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Interface for components that support focus management and form integration
 */
export interface RadioFocusCapable {
  name: string;
  required: boolean;
  disabled: boolean;
  focused: boolean;
  focusedOptionIndex: number;
  focus(): void;
  blur(): void;
  setFocusedOption(index: number): void;
  getCurrentFocusedOption(): RadioButtonOption | undefined;
  handleFocusIn(event: FocusEvent): void;
  handleFocusOut(event: FocusEvent): void;
}

/**
 * Mixin that provides focus management and form integration for radio groups
 * Handles focus states, form integration, and programmatic focus control
 * 
 * @param superClass - The base class to extend
 * @returns Enhanced class with focus management capabilities
 * 
 * @example
 * ```typescript
 * export class RadioComponent extends RadioFocusMixin(LitElement) {
 *   connectedCallback() {
 *     super.connectedCallback();
 *     this.addEventListener('focusin', this.handleFocusIn.bind(this));
 *     this.addEventListener('focusout', this.handleFocusOut.bind(this));
 *   }
 * }
 * ```
 */
export const RadioFocusMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class RadioFocusMixinClass extends superClass implements RadioFocusCapable {
    
    @property({ type: String, reflect: true })
    name: string = '';

    @property({ type: Boolean, reflect: true })
    required: boolean = false;

    @property({ type: Boolean, reflect: true })
    disabled: boolean = false;

    @state()
    focused: boolean = false;

    @state()
    focusedOptionIndex: number = -1;

    /**
     * Programmatically focus the radio group
     */
    override focus(): void {
      this.updateComplete.then(() => {
        const firstEnabledInput = this.getFirstEnabledInput();
        if (firstEnabledInput) {
          firstEnabledInput.focus();
        }
      });
    }

    /**
     * Programmatically blur the radio group
     */
    override blur(): void {
      this.updateComplete.then(() => {
        const activeElement = this.shadowRoot?.activeElement as HTMLElement;
        if (activeElement && activeElement.blur) {
          activeElement.blur();
        }
      });
    }

    /**
     * Set focus to a specific option by index
     */
    setFocusedOption(index: number): void {
      const options = this.getAvailableOptions();
      if (index < 0 || index >= options.length) return;

      this.focusedOptionIndex = index;
      
      this.updateComplete.then(() => {
        const radioInputs = this.getAllRadioInputs();
        if (radioInputs && radioInputs[index]) {
          (radioInputs[index] as HTMLInputElement).focus();
        }
      });
    }

    /**
     * Get the currently focused option
     */
    getCurrentFocusedOption(): RadioButtonOption | undefined {
      const options = this.getAvailableOptions();
      if (this.focusedOptionIndex >= 0 && this.focusedOptionIndex < options.length) {
        return options[this.focusedOptionIndex];
      }
      return undefined;
    }

    /**
     * Handle focus entering the radio group
     */
    handleFocusIn(event: FocusEvent): void {
      this.focused = true;
      
      // Update focused option index based on which input received focus
      const target = event.target as HTMLInputElement;
      if (target && target.type === 'radio') {
        const radioInputs = this.getAllRadioInputs();
        const index = Array.from(radioInputs).indexOf(target);
        if (index >= 0) {
          this.focusedOptionIndex = index;
        }
      }

      // Dispatch focus event
      this.dispatchFocusEvent('focus', event);
    }

    /**
     * Handle focus leaving the radio group
     */
    handleFocusOut(event: FocusEvent): void {
      // Check if focus is moving to another element within the radio group
      const relatedTarget = event.relatedTarget as Node;
      if (relatedTarget && this.shadowRoot?.contains(relatedTarget)) {
        return; // Focus is still within the component
      }

      this.focused = false;
      this.focusedOptionIndex = -1;

      // Dispatch blur event
      this.dispatchFocusEvent('blur', event);
    }

    /**
     * Get all radio input elements
     */
    private getAllRadioInputs(): NodeListOf<HTMLInputElement> {
      return this.shadowRoot?.querySelectorAll('input[type="radio"]') || ([] as any);
    }

    /**
     * Get the first enabled radio input
     */
    private getFirstEnabledInput(): HTMLInputElement | null {
      const inputs = this.getAllRadioInputs();
      for (const input of inputs) {
        if (!input.disabled) {
          return input;
        }
      }
      return null;
    }

    /**
     * Get available options (non-disabled)
     */
    private getAvailableOptions(): RadioButtonOption[] {
      if (!('options' in this)) return [];
      
      const options = (this as any).options as RadioButtonOption[];
      return options.filter(option => !this.isOptionDisabledForFocus(option));
    }

    /**
     * Check if option is disabled for focus management
     */
    private isOptionDisabledForFocus(option: RadioButtonOption): boolean {
      if ('isOptionDisabled' in this) {
        return (this as any).isOptionDisabled(option);
      }
      return Boolean(option.disabled) || this.disabled;
    }

    /**
     * Dispatch focus-related events
     */
    private dispatchFocusEvent(type: 'focus' | 'blur', originalEvent: FocusEvent): void {
      const self = this as any;
      if ('dispatchInputEvent' in self && typeof self.dispatchInputEvent === 'function') {
        self.dispatchInputEvent(type, {
          originalEvent,
          focused: self.focused,
          focusedOptionIndex: self.focusedOptionIndex,
          target: self
        });
      } else {
        // Fallback to native event dispatch
        self.dispatchEvent(new CustomEvent(type, {
          detail: {
            originalEvent,
            focused: self.focused,
            focusedOptionIndex: self.focusedOptionIndex,
            target: self
          },
          bubbles: true,
          composed: true
        }));
      }
    }
  }

  return RadioFocusMixinClass as Constructor<RadioFocusCapable> & T;
};
