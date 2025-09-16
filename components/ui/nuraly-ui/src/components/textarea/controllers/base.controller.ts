/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Base interface for textarea controllers
 */
export interface TextareaBaseController {
  host: TextareaHost;
}

/**
 * Textarea host interface - defines what the textarea component should provide
 */
export interface TextareaHost extends EventTarget {
  value: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  name?: string;
  placeholder?: string;
  rows?: number;
  cols?: number;
  maxLength?: number;
  resize?: string;
  autoResize?: boolean;
  minHeight?: number;
  maxHeight?: number;
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
 * for all textarea component controllers
 */
export abstract class BaseTextareaController implements TextareaBaseController, ReactiveController, ErrorHandler {
  protected _host: TextareaHost & ReactiveControllerHost;

  constructor(host: TextareaHost & ReactiveControllerHost) {
    this._host = host;
    this._host.addController(this);
  }

  /**
   * Get the host element
   */
  get host(): TextareaHost & ReactiveControllerHost {
    return this._host;
  }

  /**
   * Lifecycle: Host connected
   */
  hostConnected(): void {
    // Override in subclasses if needed
  }

  /**
   * Lifecycle: Host disconnected
   */
  hostDisconnected(): void {
    // Override in subclasses if needed
  }

  /**
   * Lifecycle: Host updated
   */
  hostUpdated(): void {
    // Override in subclasses if needed
  }

  /**
   * Lifecycle: Host update complete
   */
  hostUpdate(): void {
    // Override in subclasses if needed
  }

  /**
   * Handle errors consistently across controllers
   */
  handleError(error: Error, context: string): void {
    console.error(`[${this.constructor.name}] Error in ${context}:`, error);
    
    // You could extend this to dispatch error events, log to analytics, etc.
    const errorEvent = new CustomEvent('textarea-controller-error', {
      detail: {
        error: error.message,
        context,
        controller: this.constructor.name
      },
      bubbles: true,
      composed: true
    });
    
    this._host.dispatchEvent(errorEvent);
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
   * Request a host update safely
   */
  protected requestHostUpdate(): void {
    this.safeExecute(() => this._host.requestUpdate(), 'requestHostUpdate');
  }

  /**
   * Debounce utility for controllers
   */
  protected debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}