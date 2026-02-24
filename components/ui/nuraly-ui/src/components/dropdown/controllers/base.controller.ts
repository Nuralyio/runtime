import { ReactiveControllerHost } from 'lit';
import { DropdownBaseController, DropdownHost, ErrorHandler } from '../interfaces/index.js';
import { BaseComponentController } from '@nuralyui/common/controllers';

/**
 * Abstract base controller class that implements common functionality
 * for all dropdown component controllers
 */
export abstract class BaseDropdownController extends BaseComponentController<DropdownHost & ReactiveControllerHost>
  implements DropdownBaseController, ErrorHandler {

  /**
   * Find elements in the host's shadow DOM
   */
  protected findElement(selector: string): HTMLElement | null {
    return this._host.shadowRoot?.querySelector(selector) as HTMLElement | null;
  }

  /**
   * Find multiple elements in the host's shadow DOM
   */
  protected findElements(selector: string): NodeListOf<HTMLElement> {
    return this._host.shadowRoot?.querySelectorAll(selector) as NodeListOf<HTMLElement>;
  }
}
