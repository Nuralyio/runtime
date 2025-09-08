/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement } from 'lit';

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Interface for components that support event handling operations
 */
export interface EventHandlerCapable {
  /**
   * Dispatch a custom event with consistent structure
   * @param eventName - The name of the event
   * @param detail - The event detail object
   */
  dispatchCustomEvent(eventName: string, detail: any): void;
  
  /**
   * Dispatch events with metadata
   */
  dispatchEventWithMetadata(eventName: string, detail: any): void;
  
  /**
   * Dispatch input-related events
   */
  dispatchInputEvent(eventName: string, detail: any): void;
  
  /**
   * Dispatch focus-related events
   */
  dispatchFocusEvent(eventName: string, detail: any): void;
  
  /**
   * Dispatch validation events
   */
  dispatchValidationEvent(eventName: string, detail: any): void;
  
  /**
   * Dispatch action events
   */
  dispatchActionEvent(eventName: string, detail: any): void;
  
  /**
   * Check if a key is allowed when component is readonly
   */
  isReadonlyKeyAllowed(keyDownEvent: KeyboardEvent): boolean;
  
  /**
   * Check if key is an activation key (Enter/Space)
   */
  isActivationKey(keyDownEvent: KeyboardEvent): boolean;
}

/**
 * Mixin that provides standardized event handling capabilities
 * 
 * @param superClass - The base class to extend
 * @returns Enhanced class with event handling capabilities
 * 
 * @example
 * ```typescript
 * export class MyComponent extends EventHandlerMixin(LitElement) {
 *   handleClick() {
 *     this.dispatchCustomEvent('my-click', { value: 'test' });
 *   }
 * }
 * ```
 */
export const EventHandlerMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class EventHandlerMixinClass extends superClass implements EventHandlerCapable {
    
    /**
     * Dispatch a custom event with consistent structure and bubbling
     */
    dispatchCustomEvent(eventName: string, detail: any): void {
      this.dispatchEvent(
        new CustomEvent(eventName, {
          detail,
          bubbles: true,
          composed: true
        })
      );
    }

    /**
     * Event dispatcher with additional metadata
     * Adds common properties like timestamp and component info
     */
    dispatchEventWithMetadata(eventName: string, detail: any): void {
      const eventDetail = {
        ...detail,
        timestamp: Date.now(),
        componentName: this.tagName?.toLowerCase() || 'unknown'
      };
      
      this.dispatchCustomEvent(eventName, eventDetail);
    }

    /**
     * Dispatch input-related events with consistent structure
     * Common pattern for form components
     */
    dispatchInputEvent(eventName: string, detail: any): void {
      const inputDetail = {
        target: detail.target || this,
        value: detail.value,
        originalEvent: detail.originalEvent,
        ...detail
      };
      
      this.dispatchCustomEvent(eventName, inputDetail);
    }

    /**
     * Dispatch focus-related events with cursor and selection info
     */
    dispatchFocusEvent(eventName: string, detail: any): void {
      const focusDetail = {
        target: detail.target || this,
        value: detail.value,
        focused: detail.focused,
        cursorPosition: detail.cursorPosition,
        selectedText: detail.selectedText,
        ...detail
      };
      
      this.dispatchCustomEvent(eventName, focusDetail);
    }

    /**
     * Dispatch validation events with error information
     */
    dispatchValidationEvent(eventName: string, detail: any): void {
      const validationDetail = {
        target: detail.target || this,
        value: detail.value,
        isValid: detail.isValid ?? false,
        error: detail.error,
        ...detail
      };
      
      this.dispatchCustomEvent(eventName, validationDetail);
    }

    /**
     * Dispatch action events (copy, clear, etc.)
     */
    dispatchActionEvent(eventName: string, detail: any): void {
      const actionDetail = {
        target: detail.target || this,
        action: detail.action,
        previousValue: detail.previousValue,
        newValue: detail.newValue,
        ...detail
      };
      
      this.dispatchCustomEvent(eventName, actionDetail);
    }

    /**
     * Standard readonly key filtering - reusable across components
     */
    isReadonlyKeyAllowed(keyDownEvent: KeyboardEvent): boolean {
      const allowedReadonlyKeys = [
        'Tab', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Home', 'End', 'PageUp', 'PageDown'
      ];
      
      if (keyDownEvent.ctrlKey || keyDownEvent.metaKey) {
        const allowedCombinations = ['KeyA', 'KeyC'];
        return allowedCombinations.includes(keyDownEvent.code);
      }
      
      return allowedReadonlyKeys.includes(keyDownEvent.key);
    }
    
    /**
     * Handle common activation keys (Enter/Space)
     */
    isActivationKey(keyDownEvent: KeyboardEvent): boolean {
      return keyDownEvent.key === 'Enter' || keyDownEvent.key === ' ';
    }
  }

  return EventHandlerMixinClass as Constructor<EventHandlerCapable> & T;
};
