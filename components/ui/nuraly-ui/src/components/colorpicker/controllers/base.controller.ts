import { ReactiveControllerHost } from 'lit';
import type { ColorPickerHost } from '../interfaces/index.js';
import { BaseComponentController } from '@nuralyui/common/controllers';

/**
 * Base controller class for all colorpicker controllers
 * Provides common functionality for event dispatching, updates, and error handling
 */
export abstract class BaseColorPickerController extends BaseComponentController<ColorPickerHost & ReactiveControllerHost> {

  /**
   * Find an element within the host's shadow root
   */
  protected findElement(selector: string): HTMLElement | null {
    return (this._host as any).shadowRoot?.querySelector(selector) || null;
  }
}
