/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { RadioButtonType, RadioButtonPosition, RadioButtonDirection, RadioButtonSize, RadioButtonVariant } from '../radio.type.js';

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Interface for components that support radio display configuration
 */
export interface RadioDisplayCapable {
  type: RadioButtonType;
  position: RadioButtonPosition;
  direction: RadioButtonDirection;
  size: RadioButtonSize;
  variant: RadioButtonVariant;
  getDisplayClasses(): Record<string, boolean>;
  isButtonType(): boolean;
  isDefaultType(): boolean;
}

/**
 * Mixin that provides radio display and layout functionality
 * 
 * @param superClass - The base class to extend
 * @returns Enhanced class with radio display capabilities
 * 
 * @example
 * ```typescript
 * export class RadioComponent extends RadioDisplayMixin(LitElement) {
 *   render() {
 *     const classes = this.getDisplayClasses();
 *     return html`<div class="${classMap(classes)}">Content</div>`;
 *   }
 * }
 * ```
 */
export const RadioDisplayMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class RadioDisplayMixinClass extends superClass implements RadioDisplayCapable {
    
    @property({ type: String, reflect: true })
    type: RadioButtonType = RadioButtonType.Default;

    @property({ type: String, reflect: true })
    position: RadioButtonPosition = RadioButtonPosition.Left;

    @property({ type: String, reflect: true })
    direction: RadioButtonDirection = RadioButtonDirection.Vertical;

    @property({ type: String, reflect: true })
    size: RadioButtonSize = RadioButtonSize.Medium;

    @property({ type: String, reflect: true })
    variant: RadioButtonVariant = RadioButtonVariant.Default;

    /**
     * Get CSS classes based on current display configuration
     */
    getDisplayClasses(): Record<string, boolean> {
      return {
        'radio-default': this.isDefaultType(),
        'radio-button': this.isButtonType(),
        'position-left': this.position === RadioButtonPosition.Left,
        'position-right': this.position === RadioButtonPosition.Right,
        'direction-horizontal': this.direction === RadioButtonDirection.Horizontal,
        'direction-vertical': this.direction === RadioButtonDirection.Vertical,
        'size-small': this.size === RadioButtonSize.Small,
        'size-medium': this.size === RadioButtonSize.Medium,
        'size-large': this.size === RadioButtonSize.Large,
        'variant-default': this.variant === RadioButtonVariant.Default,
        'variant-solid': this.variant === RadioButtonVariant.Solid
      };
    }

    /**
     * Check if component is using button display type
     */
    isButtonType(): boolean {
      return this.type === RadioButtonType.Button;
    }

    /**
     * Check if component is using default display type
     */
    isDefaultType(): boolean {
      return this.type === RadioButtonType.Default;
    }
  }

  return RadioDisplayMixinClass as Constructor<RadioDisplayCapable> & T;
};
