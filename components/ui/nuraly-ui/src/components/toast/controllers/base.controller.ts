/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { BaseComponentController } from '@nuralyui/common/controllers';

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
export abstract class BaseToastController extends BaseComponentController<ToastControllerHost> {
}
