/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { RippleController } from '../interfaces/index.js';
import { BaseButtonController } from './base.controller.js';

/**
 * Ripple controller manages ripple effect functionality for button components
 */
export class ButtonRippleController extends BaseButtonController implements RippleController {

  /**
   * Creates ripple effect on button click with enhanced animation
   * @param event - The click event
   */
  createRipple(event: MouseEvent): void {
    try {
      if (!this.host.ripple || this.host.disabled) return;

      const button = event.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      
      // Make ripple larger for more pronounced effect
      const size = Math.max(rect.width, rect.height) * 2;
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';

      // Remove any existing ripples
      const existingRipples = button.querySelectorAll('.ripple');
      existingRipples.forEach(r => r.remove());

      button.appendChild(ripple);

      // Remove ripple after animation
      setTimeout(() => {
        ripple.remove();
      }, 600);
    } catch (error) {
      this.handleError(error as Error, 'createRipple');
    }
  }

  /**
   * Handle click events with ripple effect and dispatch custom event
   * @param event - The click event
   */
  handleRippleClick(event: MouseEvent): void {
    try {
      this.createRipple(event);
      
      // Dispatch custom button click event if available
      this.dispatchEvent(
        new CustomEvent('button-click', {
          detail: {
            disabled: this.host.disabled,
            timestamp: Date.now(),
            coordinates: {
              x: event.clientX,
              y: event.clientY
            }
          },
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      this.handleError(error as Error, 'handleRippleClick');
    }
  }
}
