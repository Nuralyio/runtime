import { ReactiveController, ReactiveControllerHost } from 'lit';
import type { ColorPickerHost } from '../interfaces/index.js';

/**
 * Base controller class for all colorpicker controllers
 * Provides common functionality for event dispatching, updates, and error handling
 */
export abstract class BaseColorPickerController implements ReactiveController {
  protected host: ColorPickerHost;

  constructor(host: ColorPickerHost) {
    this.host = host;
    (host as ReactiveControllerHost).addController(this);
  }

  /**
   * Called when the host is connected to the DOM
   */
  hostConnected(): void {
    // Override in subclasses if needed
  }

  /**
   * Called when the host is disconnected from the DOM
   */
  hostDisconnected(): void {
    // Override in subclasses if needed
  }

  /**
   * Called after the host updates
   */
  hostUpdated(): void {
    // Override in subclasses if needed
  }

  /**
   * Dispatch a custom event from the host
   */
  protected dispatchEvent(event: CustomEvent): void {
    this.host.dispatchEvent(event);
  }

  /**
   * Request an update on the host
   */
  protected requestUpdate(): void {
    this.host.requestUpdate();
  }

  /**
   * Handle errors consistently
   */
  protected handleError(error: Error, context: string): void {
    console.error(`[ColorPicker ${context}]:`, error);
  }

  /**
   * Find an element within the host's shadow root
   */
  protected findElement(selector: string): HTMLElement | null {
    return this.host.shadowRoot?.querySelector(selector) || null;
  }
}
