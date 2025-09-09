/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController } from 'lit';

/**
 * Base interface that all radio controllers must implement
 * Extends Lit's ReactiveController with common functionality
 */
export interface RadioBaseController extends ReactiveController {
  /**
   * Called when the host element is connected to the DOM
   * Used for setting up event listeners, observers, etc.
   */
  hostConnected(): void;

  /**
   * Called when the host element is disconnected from the DOM
   * Used for cleanup of event listeners, observers, etc.
   */
  hostDisconnected(): void;
}

/**
 * Error handling interface for controllers
 */
export interface ErrorHandler {
  /**
   * Handle errors that occur within the controller
   * @param operation - The operation that failed
   * @param error - The error that occurred
   */
  handleError(operation: string, error: Error): void;
}

/**
 * Interface representing the radio component host element that extends ReactiveControllerHost
 */
export interface RadioHost {
  /**
   * The radio button options
   */
  options: any[];

  /**
   * The currently selected value
   */
  value: string;

  /**
   * The default value to select initially
   */
  defaultValue: string;

  /**
   * The name attribute for form submission
   */
  name: string;

  /**
   * Whether the radio group is required
   */
  required: boolean;

  /**
   * Whether the radio group is disabled
   */
  disabled: boolean;

  /**
   * Request an update of the component
   */
  requestUpdate(): void;

  /**
   * Dispatch an event from the component
   */
  dispatchEvent(event: Event): boolean;

  /**
   * Add a reactive controller to the host
   */
  addController(controller: ReactiveController): void;
}
