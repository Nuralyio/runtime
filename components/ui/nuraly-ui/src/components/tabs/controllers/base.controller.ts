/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';
import { TabItem } from '../tabs.types.js';

/**
 * Base interface for tabs host element
 */
export interface TabsHost extends EventTarget {
  /** Currently active tab index */
  activeTab: number;
  /** Array of tab items */
  tabs: TabItem[];
  /** Whether component is disabled */
  disabled?: boolean;
  /** Current theme */
  currentTheme: string;
  /** Whether component is available */
  isComponentAvailable(component: string): boolean;
  /** Shadow root access */
  shadowRoot: ShadowRoot | null;
  /** Request update */
  requestUpdate(): void;
}

/**
 * Base interface for tabs controllers
 */
export interface TabsBaseController {
  readonly host: TabsHost;
}

/**
 * Error handler interface for controllers
 */
export interface ErrorHandler {
  handleError(error: Error, context: string): void;
}

/**
 * Abstract base controller class that implements common functionality
 * for all tabs component controllers
 */
export abstract class BaseTabsController implements TabsBaseController, ReactiveController, ErrorHandler {
  protected _host: TabsHost & ReactiveControllerHost;

  constructor(host: TabsHost & ReactiveControllerHost) {
    this._host = host;
    this._host.addController(this);
  }

  /**
   * Get the host element
   */
  get host(): TabsHost {
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
   * Reactive controller lifecycle - called when host has updated
   */
  hostUpdated(): void {
    // Override in subclasses if needed
  }

  /**
   * Handle errors with consistent logging and optional user feedback
   */
  handleError(error: Error, context: string): void {
    console.error(`[TabsController] Error in ${context}:`, error);
    
    // Dispatch error event for handling by parent component
    this.dispatchEvent(
      new CustomEvent('tabs-error', {
        detail: {
          error,
          context,
          timestamp: Date.now(),
          controller: this.constructor.name
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Helper method to dispatch events consistently
   */
  protected dispatchEvent(event: CustomEvent): void {
    try {
      this._host.dispatchEvent(event);
    } catch (error) {
      console.error('[TabsController] Failed to dispatch event:', error);
    }
  }

  /**
   * Helper method to check if tab is valid
   */
  protected isValidTabIndex(index: number): boolean {
    return index >= 0 && index < this.host.tabs.length;
  }

  /**
   * Helper method to get tab element by index
   */
  protected getTabElement(index: number): Element | null {
    return this.host.shadowRoot?.querySelector(`[data-index="${index}"]`) || null;
  }
}