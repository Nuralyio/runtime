/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { ReactiveControllerHost } from 'lit';
import type { NrMenuElement } from '../menu.component.js';
import type { MenuController } from '../interfaces/index.js';

/**
 * Base controller class providing common functionality for all menu controllers
 * Handles controller lifecycle, error handling, and event dispatching
 */
export class BaseMenuController implements MenuController {
  host: NrMenuElement;

  constructor(host: NrMenuElement & ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  /**
   * Called when the controller's host element is connected to the DOM
   */
  hostConnected(): void {
    // Override in subclasses if needed
  }

  /**
   * Called when the controller's host element is disconnected from the DOM
   */
  hostDisconnected(): void {
    // Override in subclasses if needed
  }

  /**
   * Dispatch a custom event from the host element
   * @param eventName - Name of the event
   * @param detail - Event detail object
   * @param options - Additional event options
   */
  protected dispatchEvent(
    eventName: string,
    detail?: any,
    options: Partial<CustomEventInit> = {}
  ): boolean {
    try {
      const event = new CustomEvent(eventName, {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true,
        ...options,
      });
      return this.host.dispatchEvent(event);
    } catch (error) {
      this.handleError(error as Error, 'dispatchEvent');
      return false;
    }
  }

  /**
   * Handle errors consistently across controllers
   * @param error - The error object
   * @param context - Context where the error occurred
   */
  protected handleError(error: Error, context: string): void {
    console.error(`[MenuController:${context}]`, error);
    
    // Dispatch error event for monitoring
    this.dispatchEvent('menu-controller-error', {
      context,
      error: error.message,
      stack: error.stack,
      timestamp: Date.now(),
    });
  }

  /**
   * Request an update of the host element
   */
  protected requestUpdate(): void {
    this.host.requestUpdate();
  }

  /**
   * Check if host element is disabled
   */
  protected isDisabled(): boolean {
    return false; // Menu doesn't have a disabled property at component level
  }

  /**
   * Get element by path key
   * @param pathKey - The path key to search for
   */
  protected getElementByPath(pathKey: string): HTMLElement | null {
    return this.host.shadowRoot?.querySelector(`[data-path="${pathKey}"]`) || null;
  }

  /**
   * Get all menu link elements
   */
  protected getAllMenuLinks(): HTMLElement[] {
    return Array.from(
      this.host.shadowRoot?.querySelectorAll('.menu-link, .sub-menu') || []
    );
  }

  /**
   * Check if element is visible and not disabled
   * @param element - The element to check
   */
  protected isElementInteractive(element: HTMLElement | null): boolean {
    if (!element) return false;
    
    const isDisabled = element.classList.contains('disabled');
    const isVisible = element.offsetParent !== null;
    
    return !isDisabled && isVisible;
  }
}
