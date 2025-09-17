import { ReactiveController, ReactiveControllerHost } from 'lit';
import { DropdownBaseController, DropdownHost, ErrorHandler } from '../interfaces/index.js';

/**
 * Abstract base controller class that implements common functionality
 * for all dropdown component controllers
 */
export abstract class BaseDropdownController implements DropdownBaseController, ReactiveController, ErrorHandler {
  protected _host: DropdownHost & ReactiveControllerHost;

  constructor(host: DropdownHost & ReactiveControllerHost) {
    this._host = host;
    this._host.addController(this);
  }

  /**
   * Get the host element
   */
  get host(): DropdownHost {
    return this._host;
  }

  /**
   * Reactive controller lifecycle - called when host connects
   */
  hostConnected(): void {
    // Override in subclasses if needed
  }

  /**
   * Reactive controller lifecycle - called when host disconnects
   */
  hostDisconnected(): void {
    // Override in subclasses if needed
  }

  /**
   * Reactive controller lifecycle - called when host updates
   */
  hostUpdate(): void {
    // Override in subclasses if needed
  }

  /**
   * Reactive controller lifecycle - called after host updates
   */
  hostUpdated(): void {
    // Override in subclasses if needed
  }

  /**
   * Request host to update
   */
  protected requestUpdate(): void {
    this._host.requestUpdate();
  }

  /**
   * Dispatch a custom event from the host
   */
  protected dispatchEvent(event: CustomEvent): boolean {
    return (this._host as unknown as EventTarget).dispatchEvent(event);
  }

  /**
   * Handle errors in a consistent way
   */
  handleError(error: Error, context: string): void {
    console.error(`Dropdown Controller Error in ${context}:`, error);
  }

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