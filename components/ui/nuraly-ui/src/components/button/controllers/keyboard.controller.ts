/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { KeyboardController } from '../interfaces/index.js';
import { BaseButtonController } from './base.controller.js';

/**
 * Keyboard controller manages keyboard interaction capabilities for button components
 * Handles Enter and Space key activation following ARIA best practices
 */
export class ButtonKeyboardController extends BaseButtonController implements KeyboardController {

  /**
   * Handle keyboard activation (Enter/Space keys)
   * @param event - The keyboard event
   */
  handleKeyboardActivation(event: KeyboardEvent): void {
    try {
      if (this.host.disabled) return;
      
      const isActivationKey = this.isActivationKey(event);
      
      if (isActivationKey) {
        event.preventDefault();
        
        // Trigger click event for consistency
        this.host.click();
        
        // Dispatch custom keyboard activation event
        this.dispatchEvent(
          new CustomEvent('keyboard-activation', {
            detail: {
              key: event.key,
              timestamp: Date.now(),
              target: this.host
            },
            bubbles: true,
            composed: true,
          })
        );
      }
    } catch (error) {
      this.handleError(error as Error, 'handleKeyboardActivation');
    }
  }

  /**
   * Handle keydown events with proper disabled state checking
   * @param event - The keyboard event
   */
  handleKeydown(event: KeyboardEvent): void {
    try {
      if (this.host.disabled) {
        // Allow readonly navigation keys even when disabled
        const isNavigationKey = this.isReadonlyKeyAllowed(event);
        
        if (!isNavigationKey) {
          event.preventDefault();
          return;
        }
      }
      
      this.handleKeyboardActivation(event);
    } catch (error) {
      this.handleError(error as Error, 'handleKeydown');
    }
  }

  /**
   * Check if the key is an activation key (Enter or Space)
   */
  private isActivationKey(event: KeyboardEvent): boolean {
    return event.key === 'Enter' || event.key === ' ';
  }

  /**
   * Check if the key is allowed when component is disabled
   */
  private isReadonlyKeyAllowed(event: KeyboardEvent): boolean {
    const allowedKeys = [
      'Tab', 'Shift', 'Escape', 'ArrowUp', 'ArrowDown', 
      'ArrowLeft', 'ArrowRight', 'Home', 'End'
    ];
    return allowedKeys.includes(event.key);
  }
}
