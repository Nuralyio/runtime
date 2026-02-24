/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { BaseComponentController } from '@nuralyui/common/controllers';

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
 * Abstract base controller class that implements common functionality
 * for all textarea component controllers
 */
export abstract class BaseTextareaController extends BaseComponentController<TextareaHost & ReactiveControllerHost> {

  /**
   * Request a host update safely (alias for requestUpdate)
   */
  protected requestHostUpdate(): void {
    this.requestUpdate();
  }
}
