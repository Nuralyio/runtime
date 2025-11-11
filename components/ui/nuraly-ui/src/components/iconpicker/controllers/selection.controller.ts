/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';
import type { IconPickerHost } from '../interfaces/index.js';
import type { IconPickerIcon } from '../icon-picker.types.js';

export class IconPickerSelectionController implements ReactiveController {
  host: ReactiveControllerHost & IconPickerHost;

  constructor(host: ReactiveControllerHost & IconPickerHost) {
    (this.host = host).addController(this);
  }

  hostConnected() {
    // Initialization if needed
  }

  hostDisconnected() {
    // Cleanup if needed
  }

  /**
   * Handle icon selection
   */
  selectIcon(icon: IconPickerIcon): void {
    this.host.value = icon.name;
    this.host.selectedIcon = icon;
    this.host.requestUpdate();
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.host.value = '';
    this.host.selectedIcon = null;
    this.host.requestUpdate();
  }

  /**
   * Check if an icon is selected
   */
  isSelected(icon: IconPickerIcon): boolean {
    return this.host.value === icon.name;
  }
}
