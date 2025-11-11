/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';
import type { IconPickerChangeEvent, IconPickerIcon } from '../icon-picker.types.js';

interface EventHost extends ReactiveControllerHost {
  dispatchEvent(event: Event): boolean;
}

export class IconPickerEventController implements ReactiveController {
  host: EventHost;

  constructor(host: EventHost) {
    (this.host = host).addController(this);
  }

  hostConnected() {
    // Initialization
  }

  hostDisconnected() {
    // Cleanup
  }

  /**
   * Dispatch icon change event
   */
  dispatchChangeEvent(value: string, icon: IconPickerIcon | null): void {
    const detail: IconPickerChangeEvent = { value, icon };
    this.host.dispatchEvent(
      new CustomEvent('nr-icon-picker-change', {
        detail,
        bubbles: true,
        composed: true
      })
    );
  }

  /**
   * Dispatch search event
   */
  dispatchSearchEvent(query: string): void {
    this.host.dispatchEvent(
      new CustomEvent('nr-icon-picker-search', {
        detail: { query },
        bubbles: true,
        composed: true
      })
    );
  }

  /**
   * Dispatch clear event
   */
  dispatchClearEvent(): void {
    this.host.dispatchEvent(
      new CustomEvent('nr-icon-picker-clear', {
        detail: {},
        bubbles: true,
        composed: true
      })
    );
  }

  /**
   * Dispatch open event
   */
  dispatchOpenEvent(): void {
    this.host.dispatchEvent(
      new CustomEvent('nr-icon-picker-open', {
        detail: {},
        bubbles: true,
        composed: true
      })
    );
  }

  /**
   * Dispatch close event
   */
  dispatchCloseEvent(): void {
    this.host.dispatchEvent(
      new CustomEvent('nr-icon-picker-close', {
        detail: {},
        bubbles: true,
        composed: true
      })
    );
  }
}
