/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Interface for components that support clickable icon functionality
 */
export interface ClickableCapable {
  /**
   * Whether the icon is clickable/interactive
   */
  clickable: boolean;
  
  /**
   * Whether the icon is disabled
   */
  disabled: boolean;
  
  /**
   * Handle click events on the icon
   */
  handleIconClick(event: MouseEvent): void;
  
  /**
   * Handle keyboard events for accessibility
   */
  handleIconKeydown(event: KeyboardEvent): void;
  
  /**
   * Get appropriate role for accessibility
   */
  getIconRole(): string;
  
  /**
   * Get appropriate tabindex for accessibility
   */
  getIconTabIndex(): string;
  
  /**
   * Get appropriate aria-disabled attribute
   */
  getAriaDisabled(): string | undefined;
}

/**
 * Mixin that provides clickable icon functionality with proper event handling
 * and accessibility support.
 * 
 * @param superClass - The base class to extend
 * @returns Enhanced class with clickable capabilities
 * 
 * @example
 * ```typescript
 * export class IconComponent extends ClickableMixin(NuralyUIBaseMixin(LitElement)) {
 *   // Component implementation
 * }
 * ```
 */
export const ClickableMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class ClickableMixinClass extends superClass implements ClickableCapable {
    
    /** Whether the icon is clickable/interactive */
    @property({type: Boolean, reflect: true})
    clickable = false;
    
    /** Whether the icon is disabled */
    @property({type: Boolean, reflect: true})
    disabled = false;

    /**
     * Handle click events on the icon
     */
    handleIconClick(event: MouseEvent): void {
      if (this.disabled || !this.clickable) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // Dispatch custom click event with icon details
      (this as any).dispatchCustomEvent('icon-click', {
        iconName: (this as any).name,
        iconType: (this as any).type,
        originalEvent: event,
        timestamp: Date.now()
      });
    }

    /**
     * Handle keyboard events for accessibility
     */
    handleIconKeydown(event: KeyboardEvent): void {
      if (this.disabled || !this.clickable) {
        return;
      }

      // Check if it's an activation key (Enter or Space)
      // Use isActivationKey from EventHandlerMixin if available, otherwise fallback
      const isActivationKey = typeof (this as any).isActivationKey === 'function'
        ? (this as any).isActivationKey(event)
        : (event.key === 'Enter' || event.key === ' ');

      if (isActivationKey) {
        event.preventDefault();
        event.stopPropagation();
        
        // Simulate click event
        this.handleIconClick(event as any);
        
        // Dispatch keyboard activation event with improved naming consistency
        if (typeof (this as any).dispatchCustomEvent === 'function') {
          (this as any).dispatchCustomEvent('icon-keyboard-activation', {
            iconName: (this as any).name,
            iconType: (this as any).type,
            key: event.key,
            originalEvent: event,
            timestamp: Date.now()
          });
        }
      }
    }

    /**
     * Get appropriate role for accessibility
     */
    getIconRole(): string {
      return this.clickable ? 'button' : 'img';
    }

    /**
     * Get appropriate tabindex for accessibility
     */
    getIconTabIndex(): string {
      if (!this.clickable) return '-1';
      return this.disabled ? '-1' : '0';
    }

    /**
     * Get appropriate aria-disabled attribute
     */
    getAriaDisabled(): string | undefined {
      return this.clickable && this.disabled ? 'true' : undefined;
    }
  }

  return ClickableMixinClass as Constructor<ClickableCapable> & T;
};
