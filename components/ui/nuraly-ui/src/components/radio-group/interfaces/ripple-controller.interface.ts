/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { RadioBaseController } from './base-controller.interface.js';

/**
 * Interface for controllers that handle visual effects like ripples
 */
export interface RippleController extends RadioBaseController {
  /**
   * Add a ripple effect at the event location
   * @param event - The event that triggered the ripple (click, touch, etc.)
   */
  addRippleEffect(event: Event): void;

  /**
   * Add a ripple effect at a specific element
   * @param element - The element to add ripple effect to
   */
  addRippleEffectToElement(element: HTMLElement): void;

  /**
   * Clear all active ripple effects
   */
  clearRipples(): void;

  /**
   * Set whether ripple effects are enabled
   * @param enabled - True to enable ripple effects
   */
  setRippleEnabled(enabled: boolean): void;
}
