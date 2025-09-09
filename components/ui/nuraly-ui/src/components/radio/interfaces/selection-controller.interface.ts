/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { RadioBaseController } from './base-controller.interface.js';
import { RadioButtonOption } from '../radio.type.js';

/**
 * Interface for controllers that handle radio button selection logic
 */
export interface SelectionController extends RadioBaseController {
  /**
   * Select a radio option programmatically
   * @param option - The option to select
   * @throws {Error} When option is disabled or invalid
   */
  selectOption(option: RadioButtonOption): void;

  /**
   * Get the currently selected option
   * @returns The selected option or undefined if none selected
   */
  getSelectedOption(): RadioButtonOption | undefined;

  /**
   * Check if a specific option is currently selected
   * @param option - The option to check
   * @returns True if the option is selected
   */
  isOptionSelected(option: RadioButtonOption): boolean;

  /**
   * Check if a specific option is disabled
   * @param option - The option to check
   * @returns True if the option is disabled
   */
  isOptionDisabled(option: RadioButtonOption): boolean;

  /**
   * Get the current selected value as a string
   * @returns The selected value or empty string
   */
  getSelectedValue(): string;

  /**
   * Reset the selection to no option selected
   */
  reset(): void;
}
