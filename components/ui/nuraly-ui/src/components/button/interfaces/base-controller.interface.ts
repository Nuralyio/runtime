/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ButtonType } from '../button.types.js';

/**
 * Base controller interface for button component controllers
 * All controllers should extend this interface for consistency
 */
export interface ButtonBaseController {
  readonly host: ButtonHost;
  handleError?(error: Error, context: string): void;
}

/**
 * Error handling interface for controllers
 */
export interface ErrorHandler {
  handleError(error: Error, context: string): void;
}

/**
 * Host element interface defining the contract between controllers and the button component
 */
export interface ButtonHost {
  disabled: boolean;
  loading: boolean;
  type: ButtonType;
  href: string;
  target: string;
  ripple: boolean;
  requestUpdate(): void;
  dispatchEvent(event: Event): boolean;
  click(): void;
  focus(): void;
  blur(): void;
  contains(element: Element): boolean;
}

/**
 * Ripple controller interface for managing ripple effects
 */
export interface RippleController extends ButtonBaseController {
  createRipple(event: MouseEvent): void;
  handleRippleClick(event: MouseEvent): void;
}

/**
 * Keyboard controller interface for handling keyboard interactions
 */
export interface KeyboardController extends ButtonBaseController {
  handleKeyboardActivation(event: KeyboardEvent): void;
  handleKeydown(event: KeyboardEvent): void;
}

/**
 * Link controller interface for managing link behavior
 */
export interface LinkController extends ButtonBaseController {
  isLinkType(): boolean;
  getElementTag(): string;
  getLinkAttributes(): Record<string, any>;
  handleLinkNavigation(event: Event): void;
}
