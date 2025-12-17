/**
 * @file ErrorController.ts
 * @description Controller for managing and displaying component errors
 * Handles error tracking, display, and user interactions
 */

import type { ReactiveController } from "lit";
import { html, nothing } from "lit";
import { $debug } from "../../../../../redux/store/debug";
import { hasOnlyEmptyObjects } from "../../../../../utils/object.utils";
import type { ErrorHost, Disposable, Activatable } from "../types/base-element.types";

// Import error display component
import "../BaseElement/handler-component-error";

/**
 * Controller responsible for error management and display
 * Only active in editor mode (not view mode)
 */
export class ErrorController implements ReactiveController, Disposable, Activatable {
  private host: ErrorHost;
  private isActive = false;

  constructor(host: ErrorHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    // Controller is activated separately via activate()
  }

  hostDisconnected(): void {
    this.deactivate();
  }

  /**
   * Activate error controller (editor mode only)
   */
  activate(): void {
    if (this.isActive || this.host.isViewMode) return;
    this.isActive = true;
  }

  /**
   * Deactivate error controller
   */
  deactivate(): void {
    if (!this.isActive) return;
    this.isActive = false;
    this.host.displayErrorPanel = false;
  }

  /**
   * Get current component errors from debug store
   */
  getErrors(): Record<string, any> | null {
    const debugState = $debug.get();
    return debugState?.error?.components?.[this.host.component.uuid]?.errors ?? null;
  }

  /**
   * Check if component has any errors
   */
  hasErrors(): boolean {
    const errors = this.getErrors();
    return errors !== null && !hasOnlyEmptyObjects(errors);
  }

  /**
   * Show error panel
   */
  showPanel(): void {
    this.host.displayErrorPanel = true;
    this.host.requestUpdate();
  }

  /**
   * Hide error panel
   */
  hidePanel(): void {
    this.host.displayErrorPanel = false;
    this.host.requestUpdate();
  }

  /**
   * Toggle error panel visibility
   */
  togglePanel(): void {
    this.host.displayErrorPanel = !this.host.displayErrorPanel;
    this.host.requestUpdate();
  }

  /**
   * Render error indicator and panel
   */
  renderError() {
    if (!this.isActive) return nothing;

    const errors = this.getErrors();
    if (!errors || hasOnlyEmptyObjects(errors)) return nothing;

    return html`
      <div
        @mouseenter=${() => this.showPanel()}
        @mouseleave=${() => this.hidePanel()}
        style="position: absolute; z-index: 1000;"
      >
        <nr-icon
          name="info-circle"
          style="
            z-index: 1000;
            --nuraly-icon-width: 20px;
            --nuraly-icon-height: 25px;
            --nuraly-icon-color: red;
            position: absolute;
            cursor: pointer;
          "
        >
          Error
        </nr-icon>
        ${this.host.displayErrorPanel
          ? html`
              <handler-component-error-block
                .error=${errors}
              ></handler-component-error-block>
            `
          : nothing}
      </div>
    `;
  }

  /**
   * Get error summary for display
   */
  getErrorSummary(): { count: number; messages: string[] } {
    const errors = this.getErrors();
    if (!errors) return { count: 0, messages: [] };

    const messages: string[] = [];
    let count = 0;

    for (const [key, value] of Object.entries(errors)) {
      if (value && typeof value === "object" && "error" in value) {
        count++;
        messages.push(`${key}: ${value.error}`);
      }
    }

    return { count, messages };
  }

  /**
   * Clear all errors for this component
   */
  clearErrors(): void {
    this.host.errors = {};
  }

  /**
   * Add an error for a specific input
   */
  addError(inputName: string, message: string): void {
    this.host.errors[inputName] = { error: message };
  }

  /**
   * Remove an error for a specific input
   */
  removeError(inputName: string): void {
    delete this.host.errors[inputName];
  }

  /**
   * Clean up all resources
   */
  dispose(): void {
    this.deactivate();
  }
}
