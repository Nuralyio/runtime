/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { RadioBaseController } from './base-controller.interface.js';

/**
 * Interface for controllers that handle keyboard navigation
 */
export interface KeyboardController extends RadioBaseController {
  /**
   * Handle keyboard events for radio group navigation
   * @param event - The keyboard event to handle
   */
  handleKeyDown(event: KeyboardEvent): void;
}

/**
 * Interface for controllers that handle focus management
 */
export interface FocusController extends RadioBaseController {
  /**
   * Set focus to a specific option by index
   * @param index - The index of the option to focus
   */
  setFocusedOption(index: number): void;

  /**
   * Focus the radio group (usually the selected or first option)
   */
  focus(): void;

  /**
   * Remove focus from the radio group
   */
  blur(): void;

  /**
   * Get the currently focused option index
   * @returns The focused option index or -1 if none focused
   */
  getFocusedIndex(): number;
}
