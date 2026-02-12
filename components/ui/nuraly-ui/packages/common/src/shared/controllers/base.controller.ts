/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Minimal host interface that all component hosts must satisfy
 */
export interface BaseHost {
  requestUpdate(): void;
}

/**
 * Error handler interface for consistent error handling across controllers
 */
export interface ErrorHandler {
  handleError(error: Error, context: string): void;
}

/**
 * Generic base controller class that implements common functionality
 * shared across all NuralyUI component controllers.
 *
 * Provides lifecycle hooks, error handling, safe update/dispatch,
 * and utility methods (safeExecute, debounce).
 *
 * @typeParam THost - The component host type, must extend BaseHost & ReactiveControllerHost
 */
export abstract class BaseComponentController<THost extends BaseHost & ReactiveControllerHost>
  implements ReactiveController, ErrorHandler {
  protected _host: THost;

  constructor(host: THost) {
    this._host = host;
    host.addController(this);
  }

  /**
   * Get the host element
   */
  get host(): THost {
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
   * Dispatch custom event from host safely
   */
  protected dispatchEvent(event: Event): boolean {
    try {
      return (this._host as unknown as EventTarget).dispatchEvent(event);
    } catch (error) {
      this.handleError(error as Error, 'dispatchEvent');
      return false;
    }
  }

  /**
   * Handle errors with consistent logging and event dispatching.
   * Standardizes error events to 'nr-controller-error'.
   */
  handleError(error: Error, context: string): void {
    console.error(`[${this.constructor.name}] Error in ${context}:`, error);

    try {
      (this._host as unknown as EventTarget).dispatchEvent(
        new CustomEvent('nr-controller-error', {
          detail: {
            error: error.message,
            context,
            controller: this.constructor.name,
          },
          bubbles: true,
          composed: true,
        })
      );
    } catch (_) {
      // Silently fail if event dispatch itself errors
    }
  }

  /**
   * Safely execute a function with error handling
   */
  protected safeExecute<T>(fn: () => T, context: string, fallback?: T): T | undefined {
    try {
      return fn();
    } catch (error) {
      this.handleError(error as Error, context);
      return fallback;
    }
  }

  /**
   * Debounce utility for controllers.
   * Returns a debounced function with a cancel() method for cleanup.
   */
  protected debounce<T extends (...args: any[]) => any>(
    fn: T,
    wait: number
  ): ((...args: Parameters<T>) => void) & { cancel: () => void } {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const debounced = (...args: Parameters<T>) => {
      if (timeout !== undefined) clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = undefined;
        fn.apply(this, args);
      }, wait);
    };
    debounced.cancel = () => {
      if (timeout !== undefined) {
        clearTimeout(timeout);
        timeout = undefined;
      }
    };
    return debounced;
  }
}
