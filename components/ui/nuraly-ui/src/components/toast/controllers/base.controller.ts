/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Base interface for toast controllers
 */
export interface ToastControllerHost extends ReactiveControllerHost {
  requestUpdate(): void;
  dispatchEvent(event: Event): boolean;
}

/**
 * Abstract base controller for toast component controllers
 */
export abstract class BaseToastController implements ReactiveController {
  protected _host: ToastControllerHost;

  constructor(host: ToastControllerHost) {
    this._host = host;
    this._host.addController(this);
  }

  /**
   * Get the host element
   */
  get host(): ToastControllerHost {
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
  protected handleError(error: Error, context: string): void {
    console.error(`[ToastController:${this.constructor.name}] Error in ${context}:`, error);
    
    // Dispatch error event for external handling
    this._host.dispatchEvent(
      new CustomEvent('nr-toast-error', {
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
