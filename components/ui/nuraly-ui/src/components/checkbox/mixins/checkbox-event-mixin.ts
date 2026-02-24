/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement } from 'lit';

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Interface for checkbox change event detail
 */
export interface CheckboxChangeEventDetail {
  checked: boolean;
  value?: string;
  name?: string;
  indeterminate?: boolean;
}

/**
 * Interface for checkbox focus/blur event detail
 */
export interface CheckboxFocusEventDetail {
  originalEvent: FocusEvent;
}

/**
 * Interface for checkbox keyboard event detail
 */
export interface CheckboxKeyboardEventDetail {
  key: string;
  code: string;
  originalEvent: KeyboardEvent;
}

/**
 * Interface for checkbox mouse event detail
 */
export interface CheckboxMouseEventDetail {
  originalEvent: MouseEvent;
}

/**
 * Interface for components that support checkbox event handling
 */
export interface CheckboxEventCapable {
  /**
   * Handle checkbox change events
   * @param event - The change event
   */
  handleChange(event: Event): void;

  /**
   * Handle checkbox focus events
   * @param event - The focus event
   */
  handleFocus(event: FocusEvent): void;

  /**
   * Handle checkbox blur events
   * @param event - The blur event
   */
  handleBlur(event: FocusEvent): void;

  /**
   * Handle checkbox keydown events
   * @param event - The keyboard event
   */
  handleKeydown(event: KeyboardEvent): void;

  /**
   * Handle checkbox mouse enter events
   * @param event - The mouse event
   */
  handleMouseEnter(event: MouseEvent): void;

  /**
   * Handle checkbox mouse leave events
   * @param event - The mouse event
   */
  handleMouseLeave(event: MouseEvent): void;
}

/**
 * Mixin that provides event handling capabilities to checkbox components
 * 
 * @param superClass - The base class to extend
 * @returns Enhanced class with checkbox event capabilities
 * 
 * @example
 * ```typescript
 * export class MyCheckbox extends CheckboxEventMixin(LitElement) {
 *   // Event handling is automatically provided
 * }
 * ```
 */
export const CheckboxEventMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class CheckboxEventMixinClass extends superClass implements CheckboxEventCapable {
    
    handleChange(event: Event): void {
      const target = event.target as HTMLInputElement;
      const checked = target.checked;
      
      // Get component properties - these should be defined in the component
      const name = (this as any).name;
      const value = (this as any).value;
      const indeterminate = (this as any).indeterminate;
      
      // Clear indeterminate state when user interacts
      if (indeterminate) {
        (this as any).indeterminate = false;
      }
      
      // Update checked state
      (this as any).checked = checked;
      
      // Dispatch standardized change event
      (this as any).dispatchCustomEvent?.('nr-change', {
        checked,
        value,
        name,
        indeterminate: false
      } as CheckboxChangeEventDetail);
    }

    handleFocus(event: FocusEvent): void {
      // Dispatch focus event for external listeners
      (this as any).dispatchCustomEvent?.('nr-focus', {
        originalEvent: event
      } as CheckboxFocusEventDetail);
    }

    handleBlur(event: FocusEvent): void {
      // Dispatch blur event for external listeners
      (this as any).dispatchCustomEvent?.('nr-blur', {
        originalEvent: event
      } as CheckboxFocusEventDetail);
    }

    handleKeydown(event: KeyboardEvent): void {
      // Handle keyboard navigation and activation
      const isActivationKey = (this as any).isActivationKey?.(event);
      
      if (isActivationKey) {
        // Space and Enter keys activate the checkbox
        event.preventDefault();
        const input = this.shadowRoot?.querySelector('input[type="checkbox"]') as HTMLInputElement;
        const disabled = (this as any).disabled;
        
        if (input && !disabled) {
          input.click();
        }
      }

      // Dispatch keydown event for external listeners
      (this as any).dispatchCustomEvent?.('nr-keydown', {
        key: event.key,
        code: event.code,
        originalEvent: event
      } as CheckboxKeyboardEventDetail);
    }

    handleMouseEnter(event: MouseEvent): void {
      // Dispatch mouse enter event for external listeners
      (this as any).dispatchCustomEvent?.('nr-mouseenter', {
        originalEvent: event
      } as CheckboxMouseEventDetail);
    }

    handleMouseLeave(event: MouseEvent): void {
      // Dispatch mouse leave event for external listeners
      (this as any).dispatchCustomEvent?.('nr-mouseleave', {
        originalEvent: event
      } as CheckboxMouseEventDetail);
    }
  }

  return CheckboxEventMixinClass as Constructor<CheckboxEventCapable> & T;
};
