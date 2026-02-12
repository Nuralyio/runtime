/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Base interface for input controllers
 */
export interface InputBaseController {
  host: InputHost;
}

/**
 * Input host interface - defines what the input component should provide
 */
export interface InputHost {
  value: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  name?: string;
  type?: string;
  label?: string;
  placeholder?: string;
  requestUpdate(): void;
}

/**
 * Error handler interface for consistent error handling
 */
export interface ErrorHandler {
  handleError(error: Error, context: string): void;
}

/**
 * Abstract base controller class that implements common functionality
 * for all input component controllers
 */
export abstract class BaseInputController implements InputBaseController, ReactiveController, ErrorHandler {
  protected _host: InputHost & ReactiveControllerHost;

  constructor(host: InputHost & ReactiveControllerHost) {
    this._host = host;
    this._host.addController(this);
  }

  /**
   * Get the host element
   */
  get host(): InputHost {
    return this._host;
  }

  /**
   * Reactive controller lifecycle - called when host connects
   */
  hostConnected(): void {
    // Override in subclasses if needed
  }

  /**
   * Reactive controller lifecycle - called when host disconnects
   */
  hostDisconnected(): void {
    // Override in subclasses if needed
  }

  /**
   * Reactive controller lifecycle - called when host updates
   */
  hostUpdate(): void {
    // Override in subclasses if needed
  }

  /**
   * Reactive controller lifecycle - called after host updates
   */
  hostUpdated(): void {
    // Override in subclasses if needed
  }

  /**
   * Request host to update
   */
  protected requestUpdate(): void {
    this._host.requestUpdate();
  }

  /**
   * Dispatch custom event from host
   */
  protected dispatchEvent(event: CustomEvent): boolean {
    return (this._host as any).dispatchEvent(event);
  }

  /**
   * Handle errors consistently across controllers
   */
  handleError(error: Error, context: string): void {
    console.error(`[InputController:${context}]`, error);
    
    // Dispatch error event for component consumers
    this.dispatchEvent(
      new CustomEvent('nr-controller-error', {
        detail: { error, context, controller: this.constructor.name },
        bubbles: true,
        composed: true,
      })
    );
  }
}
