/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { ButtonBaseController, ButtonHost, ErrorHandler } from '../interfaces/index.js';
import { BaseComponentController } from '@nuralyui/common/controllers';

/**
 * Abstract base controller class that implements common functionality
 * for all button component controllers
 */
export abstract class BaseButtonController extends BaseComponentController<ButtonHost & ReactiveControllerHost>
  implements ButtonBaseController, ErrorHandler {
}
