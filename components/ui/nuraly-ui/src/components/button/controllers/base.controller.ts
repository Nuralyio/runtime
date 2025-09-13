/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';
import { ButtonBaseController, ButtonHost, ErrorHandler } from '../interfaces/index.js';

/**
 * Abstract base controller class that implements common functionality
 * for all button component controllers
 */
export abstract class BaseButtonController implements ButtonBaseController, ReactiveController, ErrorHandler {
  protected _host: ButtonHost & ReactiveControllerHost;

  constructor(host: ButtonHost & ReactiveControllerHost) {
    this._host = host;
    this._host.addController(this);
  }

  /**
   * Get the host element
   */
  get host(): ButtonHost {
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
   * Handle errors in a consistent way across all controllers
   */
  handleError(error: Error, context: string): void {
    console.error(`[ButtonController:${this.constructor.name}] Error in ${context}:`, error);
    
    // Dispatch error event for external handling
    this._host.dispatchEvent(
      new CustomEvent('nr-button-error', {
        detail: {
          error: error.message,
          context,
          controller: this.constructor.name,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Request host update safely
   */
  protected requestUpdate(): void {
    try {
      this._host.requestUpdate();
    } catch (error) {
      this.handleError(error as Error, 'requestUpdate');
    }
  }

  /**
   * Dispatch custom event safely
   */
  protected dispatchEvent(event: Event): boolean {
    try {
      return this._host.dispatchEvent(event);
    } catch (error) {
      this.handleError(error as Error, 'dispatchEvent');
      return false;
    }
  }
}
