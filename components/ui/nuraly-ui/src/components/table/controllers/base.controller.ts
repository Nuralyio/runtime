/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { TableBaseController, TableHost, ErrorHandler } from '../interfaces/index.js';
import { BaseComponentController } from '@nuralyui/common/controllers';

/**
 * Abstract base controller class that implements common functionality
 * for all table component controllers
 */
export abstract class BaseTableController extends BaseComponentController<TableHost & ReactiveControllerHost>
  implements TableBaseController, ErrorHandler {
}
