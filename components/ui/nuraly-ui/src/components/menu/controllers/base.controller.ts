/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { ReactiveControllerHost } from 'lit';
import type { NrMenuElement } from '../menu.component.js';
import type { MenuController } from '../interfaces/index.js';
import { BaseComponentController } from '@nuralyui/common/controllers';

/**
 * Base controller class providing common functionality for all menu controllers
 * Handles controller lifecycle, error handling, and event dispatching
 */
export class BaseMenuController extends BaseComponentController<NrMenuElement & ReactiveControllerHost>
  implements MenuController {

  /**
   * Dispatch a custom event from the host element
   * @param eventName - Name of the event
   * @param detail - Event detail object
   * @param options - Additional event options
   */
  protected dispatchMenuEvent(
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
      return this._host.dispatchEvent(event);
    } catch (error) {
      this.handleError(error as Error, 'dispatchEvent');
      return false;
    }
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
    return this._host.shadowRoot?.querySelector(`[data-path="${pathKey}"]`) || null;
  }

  /**
   * Get all menu link elements
   */
  protected getAllMenuLinks(): HTMLElement[] {
    return Array.from(
      this._host.shadowRoot?.querySelectorAll('.menu-link, .sub-menu') || []
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
