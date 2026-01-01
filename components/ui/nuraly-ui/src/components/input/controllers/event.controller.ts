/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { FocusChangeEvent, INPUT_TYPE } from '../input.types.js';
import { BaseInputController, InputHost } from './base.controller.js';

/**
 * Event controller interface for input components
 */
export interface EventController {
  handleKeyDown(event: KeyboardEvent): void;
  handleValueChange(event: Event): void;
  handleFocus(event: Event): void;
  handleBlur(event: Event): void;
  handleIconKeydown(event: KeyboardEvent): void;
  handleCopy(): Promise<void>;
  handleClear(): void;
  handleTogglePassword(): void;
  handleIncrement(): void;
  handleDecrement(): void;
}

/**
 * Enhanced input host interface with additional properties needed for events
 */
export interface InputEventHost extends InputHost {
  readonly?: boolean;
  maxLength?: number;
  withCopy?: boolean;
  allowClear?: boolean;
  inputType?: string;
  focused?: boolean;
  debounce?: number;

  // Mixin methods that should be available
  isReadonlyKeyAllowed?(keyDownEvent: KeyboardEvent): boolean;
  isActivationKey?(keyDownEvent: KeyboardEvent): boolean;
  getCursorPosition?(): number | null;
  getSelectedText?(): string;
  increment?(): void;
  decrement?(): void;

  // Event dispatch methods
  dispatchInputEvent(eventName: string, detail: any): void;
  dispatchFocusEvent(eventName: string, detail: any): void;
  dispatchActionEvent(eventName: string, detail: any): void;

  // DOM access
  shadowRoot?: ShadowRoot | null;
}

/**
 * Event controller that manages all user interactions and event handling
 * for the input component. This includes keyboard events, focus/blur,
 * value changes, and action button interactions.
 */
export class InputEventController extends BaseInputController implements EventController {
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  protected get eventHost(): InputEventHost {
    return this.host as InputEventHost;
  }

  private get inputElement(): HTMLInputElement | null {
    return this.eventHost.shadowRoot?.querySelector('#input') as HTMLInputElement || null;
  }

  /**
   * Clear debounce timer on disconnect
   */
  clearDebounceTimer(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  /**
   * Handle keyboard interactions
   */
  handleKeyDown = (event: KeyboardEvent): void => {
    // Handle readonly mode
    if (this.eventHost.readonly && !this.isReadonlyKeyAllowed(event)) {
      event.preventDefault();
      return;
    }

    // Handle Enter key
    if (event.key === 'Enter') {
      this.dispatchEnterEvent(event);
      return;
    }

    // Handle number input specific keys
    if (this.eventHost.type === INPUT_TYPE.NUMBER) {
      this.handleNumericKeyDown(event);
    }
  };

  /**
   * Handle input value changes
   */
  handleValueChange = (event: Event): void => {
    if (this.eventHost.readonly) {
      event.preventDefault();
      return;
    }

    const target = event.target as HTMLInputElement;
    const newValue = target.value;

    // Validate character limit
    if (this.eventHost.maxLength && newValue.length > this.eventHost.maxLength) {
      event.preventDefault();
      return;
    }

    // Handle numeric value validation
    if (this.eventHost.type === INPUT_TYPE.NUMBER && newValue) {
      this.validateNumericValue(newValue, event);
    }

    // Update value immediately
    this.eventHost.value = newValue;

    // Trigger validation (if validation controller exists)
    const host = this.eventHost as any;
    if (host.validationController && typeof host.validationController.validateOnChange === 'function') {
      host.validationController.validateOnChange();
    }

    // Dispatch event with debounce if configured
    const debounceMs = this.eventHost.debounce || 0;

    if (debounceMs > 0) {
      this.clearDebounceTimer();
      this.debounceTimer = setTimeout(() => {
        this.eventHost.dispatchInputEvent('nr-input', {
          value: this.eventHost.value,
          target: target,
          originalEvent: event
        });
      }, debounceMs);
    } else {
      this.eventHost.dispatchInputEvent('nr-input', {
        value: this.eventHost.value,
        target: target,
        originalEvent: event
      });
    }
  };

  /**
   * Handle focus events
   */
  handleFocus = (event: Event): void => {
    this.setFocusState(true);

    const input = event.target as HTMLInputElement;
    this.restoreCursorPosition(input);

    const focusDetail: FocusChangeEvent = {
      focused: true,
      cursorPosition: this.getCursorPosition() ?? undefined,
      selectedText: this.getSelectedText()
    };

    this.eventHost.dispatchFocusEvent('nr-focus', {
      target: event.target,
      value: this.eventHost.value,
      ...focusDetail
    });

    this.eventHost.dispatchFocusEvent('nr-focus-change', focusDetail);
  };

  /**
   * Handle blur events
   */
  handleBlur = (event: Event): void => {
    this.setFocusState(false);

    const focusDetail: FocusChangeEvent = {
      focused: false,
      cursorPosition: this.getCursorPosition() ?? undefined,
      selectedText: this.getSelectedText()
    };

    // Trigger validation on blur
    const host = this.eventHost as any;
    if (host.validationController && typeof host.validationController.validateOnBlur === 'function') {
      host.validationController.validateOnBlur();
    }

    this.eventHost.dispatchFocusEvent('nr-blur', {
      target: event.target,
      value: this.eventHost.value,
      ...focusDetail
    });

    this.eventHost.dispatchFocusEvent('nr-focus-change', focusDetail);
  };

  /**
   * Handle icon button keyboard interactions
   */
  handleIconKeydown = (event: KeyboardEvent): void => {
    if (!this.isActivationKey(event)) return;
    
    event.preventDefault();
    const target = event.target as HTMLElement;
    
    // Handle different icon actions
    switch (target.id) {
      case 'copy-icon':
        this.handleCopy();
        break;
      case 'clear-icon':
        this.handleClear();
        break;
      case 'password-icon':
        this.handleTogglePassword();
        break;
      default:
        // Handle number input icons
        if (target.closest('#number-icons')) {
          this.handleNumberIconAction(target);
        }
        break;
    }
  };

  /**
   * Handle copy action
   */
  handleCopy = async (): Promise<void> => {
    if (!this.eventHost.withCopy || this.eventHost.disabled) return;

    try {
      const input = this.inputElement;
      if (!input) return;

      input.select();
      await navigator.clipboard.writeText(input.value);
      
      this.eventHost.dispatchActionEvent('nr-copy-success', {
        value: input.value,
        action: 'copy'
      });
    } catch (error) {
      this.handleError(error as Error, 'copy');
      this.eventHost.dispatchActionEvent('nr-copy-error', { 
        error,
        action: 'copy'
      });
    }
  };

  /**
   * Handle clear action
   */
  handleClear = (): void => {
    if (this.eventHost.disabled || this.eventHost.readonly || !this.eventHost.allowClear) {
      return;
    }

    const previousValue = this.eventHost.value;
    this.eventHost.value = '';

    const input = this.inputElement;
    if (input) {
      input.value = '';
      input.focus();
    }

    this.eventHost.dispatchActionEvent('nr-clear', {
      previousValue,
      newValue: this.eventHost.value,
      target: input,
      action: 'clear'
    });

    this.eventHost.dispatchInputEvent('nr-input', {
      value: this.eventHost.value,
      target: input,
      action: 'clear'
    });
  };

  /**
   * Handle password visibility toggle
   */
  handleTogglePassword = (): void => {
    if (this.eventHost.type !== INPUT_TYPE.PASSWORD) return;

    const currentType = this.eventHost.inputType;
    const newType = currentType === INPUT_TYPE.PASSWORD ? INPUT_TYPE.TEXT : INPUT_TYPE.PASSWORD;
    
    (this.eventHost as any).inputType = newType;
    this.requestUpdate();

    this.eventHost.dispatchActionEvent('nr-password-toggle', {
      visible: newType === INPUT_TYPE.TEXT,
      action: 'password-toggle'
    });
  };

  /**
   * Handle increment action for number inputs
   */
  handleIncrement = (): void => {
    if (this.eventHost.type !== INPUT_TYPE.NUMBER) return;
    
    if (this.eventHost.increment) {
      this.eventHost.increment();
    }
  };

  /**
   * Handle decrement action for number inputs
   */
  handleDecrement = (): void => {
    if (this.eventHost.type !== INPUT_TYPE.NUMBER) return;
    
    if (this.eventHost.decrement) {
      this.eventHost.decrement();
    }
  };

  /**
   * Helper methods
   */
  private handleNumericKeyDown(event: KeyboardEvent): void {
    // Allow navigation and special keys
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    if (allowedKeys.includes(event.key)) return;

    // Allow Ctrl/Cmd combinations
    if (event.ctrlKey || event.metaKey) return;

    // Allow decimal point and minus for applicable number inputs
    if (event.key === '.' || event.key === '-') return;

    // Only allow numeric characters
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  private handleNumberIconAction(target: HTMLElement): void {
    const isIncrement = target.classList.contains('increment') || 
                       target.closest('.increment');
    const isDecrement = target.classList.contains('decrement') || 
                       target.closest('.decrement');

    if (isIncrement) {
      this.handleIncrement();
    } else if (isDecrement) {
      this.handleDecrement();
    }
  }

  private dispatchEnterEvent(event: KeyboardEvent): void {
    this.eventHost.dispatchInputEvent('nr-enter', {
      value: this.eventHost.value,
      target: event.target,
      originalEvent: event
    });
  }

  private validateNumericValue(_value: string, _event: Event): void {
    // Additional numeric validation can be added here
    // This could integrate with the validation controller
    // For now, let the number mixin handle validation
  }

  private restoreCursorPosition(input: HTMLInputElement): void {
    if (input.dataset.restoreCursor) {
      const position = parseInt(input.dataset.restoreCursor, 10);
      if (!isNaN(position)) {
        input.setSelectionRange(position, position);
      }
      delete input.dataset.restoreCursor;
    }
  }

  private setFocusState(focused: boolean): void {
    if (this.eventHost.hasOwnProperty('focused')) {
      (this.eventHost as any).focused = focused;
      this.requestUpdate();
    }
  }

  private getCursorPosition(): number | null {
    if (this.eventHost.getCursorPosition) {
      return this.eventHost.getCursorPosition();
    }
    
    const input = this.inputElement;
    return input ? input.selectionStart : null;
  }

  private getSelectedText(): string {
    if (this.eventHost.getSelectedText) {
      return this.eventHost.getSelectedText();
    }
    
    const input = this.inputElement;
    if (input && input.selectionStart !== null && input.selectionEnd !== null) {
      return input.value.substring(input.selectionStart, input.selectionEnd);
    }
    return '';
  }

  private isReadonlyKeyAllowed(event: KeyboardEvent): boolean {
    if (this.eventHost.isReadonlyKeyAllowed) {
      return this.eventHost.isReadonlyKeyAllowed(event);
    }
    
    // Fallback implementation
    const allowedKeys = [
      'Tab', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', 'PageUp', 'PageDown'
    ];
    
    if (event.ctrlKey || event.metaKey) {
      return ['KeyA', 'KeyC'].includes(event.code);
    }
    
    return allowedKeys.includes(event.key);
  }

  private isActivationKey(event: KeyboardEvent): boolean {
    if (this.eventHost.isActivationKey) {
      return this.eventHost.isActivationKey(event);
    }
    
    return event.key === 'Enter' || event.key === ' ';
  }
}
