/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { BaseComponentController } from '@nuralyui/common/controllers';
export type { ErrorHandler } from '@nuralyui/common/controllers';

/**
 * Base interface for input controllers
 */
export interface InputBaseController {
  host: InputHost;
}

/**
 * Input host interface - defines what the input component should provide
 */
export interface InputHost {
  value: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  name?: string;
  type?: string;
  label?: string;
  placeholder?: string;
  requestUpdate(): void;
}

/**
 * Abstract base controller class that implements common functionality
 * for all input component controllers
 */
export abstract class BaseInputController extends BaseComponentController<InputHost & ReactiveControllerHost> {
}
