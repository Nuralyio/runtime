import { ReactiveControllerHost } from 'lit';
import { SelectBaseController, SelectHost, ErrorHandler } from '../interfaces/index.js';
import { BaseComponentController } from '@nuralyui/common/controllers';

/**
 * Abstract base controller class that implements common functionality
 * for all select component controllers
 */
export abstract class BaseSelectController extends BaseComponentController<SelectHost & ReactiveControllerHost>
  implements SelectBaseController, ErrorHandler {
}
