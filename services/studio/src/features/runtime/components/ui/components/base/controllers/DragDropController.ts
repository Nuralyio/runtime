/**
 * @file DragDropController.ts
 * @description Controller for handling drag and drop interactions in editor mode
 * Manages drag wrappers and drop zone indicators
 */

import type { ReactiveController } from "lit";
import { html, nothing } from "lit";
import type { DragDropHost, Disposable, Activatable, DragWrapperPosition } from "../types/base-element.types";

// Import drag wrapper component
import "../../wrappers/GenerikWrapper/DragWrapper/DragWrapper";

/**
 * Controller responsible for drag and drop functionality
 * Only active in editor mode (not view mode)
 */
export class DragDropController implements ReactiveController, Disposable, Activatable {
  private host: DragDropHost;
  private isActive = false;

  // Bound event handlers for proper cleanup
  private boundDragEnter: (e: DragEvent) => void;
  private boundDrop: (e: DragEvent) => void;
  private boundDragLeave: (e: DragEvent) => void;

  constructor(host: DragDropHost) {
    this.host = host;
    host.addController(this);

    // Bind handlers
    this.boundDragEnter = this.handleDragEnter.bind(this);
    this.boundDrop = this.handleDrop.bind(this);
    this.boundDragLeave = this.handleDragLeave.bind(this);
  }

  hostConnected(): void {
    // Controller is activated separately via activate()
  }

  hostDisconnected(): void {
    this.deactivate();
  }

  /**
   * Activate drag-drop controller (editor mode only)
   */
  activate(): void {
    if (this.isActive || this.host.isViewMode) return;
    this.isActive = true;

    // Find closest wrapper
    this.host.closestGenericComponentWrapper = this.host.closest?.(
      "generik-component-wrapper"
    ) as HTMLElement | null;

    // Add DOM event listeners
    this.host.addEventListener("dragenter", this.boundDragEnter);
    this.host.addEventListener("drop", this.boundDrop);
    this.host.addEventListener("dragleave", this.boundDragLeave);
  }

  /**
   * Deactivate drag-drop controller
   */
  deactivate(): void {
    if (!this.isActive) return;
    this.isActive = false;

    // Remove DOM event listeners
    this.host.removeEventListener("dragenter", this.boundDragEnter);
    this.host.removeEventListener("drop", this.boundDrop);
    this.host.removeEventListener("dragleave", this.boundDragLeave);
  }

  /**
   * Handle drag enter event
   */
  private handleDragEnter(_e: DragEvent): void {
    this.notifyDragWrappers("drag-over-component");
  }

  /**
   * Handle drop event
   */
  private handleDrop(_e: DragEvent): void {
    this.notifyDragWrappers("drag-leave-component");
  }

  /**
   * Handle drag leave event
   */
  private handleDragLeave(_e: DragEvent): void {
    this.notifyDragWrappers("drag-leave-component");
  }

  /**
   * Notify drag wrappers of drag events
   */
  private notifyDragWrappers(eventType: string): void {
    const wrappers = this.host.shadowRoot?.querySelectorAll("drag-wrapper");
    wrappers?.forEach((wrapper) => {
      wrapper.dispatchEvent(
        new CustomEvent(eventType, {
          bubbles: true,
          composed: true,
        })
      );
    });
  }

  /**
   * Render drag wrappers for editor mode
   */
  renderWrappers(itemIndex?: number) {
    if (!this.isActive) return nothing;

    const { component, inputRef, isDragInitiator } = this.host;
    const componentData = { ...component };

    return html`
      ${[0, undefined].includes(itemIndex)
        ? html`
            <drag-wrapper
              .where=${"before" as DragWrapperPosition}
              .message=${"Drop before"}
              .component=${componentData}
              .inputRef=${inputRef}
              .isDragInitiator=${isDragInitiator}
            ></drag-wrapper>
          `
        : nothing}
    `;
  }

  /**
   * Render after drag wrapper
   */
  renderAfterWrapper() {
    if (!this.isActive) return nothing;

    const { component, inputRef, isDragInitiator } = this.host;

    return html`
      <drag-wrapper
        .where=${"after" as DragWrapperPosition}
        .message=${"Drop after"}
        .component=${{ ...component }}
        .inputRef=${inputRef}
        .isDragInitiator=${isDragInitiator}
      ></drag-wrapper>
    `;
  }

  /**
   * Set drag initiator state
   */
  setDragInitiator(isInitiator: boolean): void {
    this.host.isDragInitiator = isInitiator;
  }

  /**
   * Check if this component is the drag initiator
   */
  isDragInitiator(): boolean {
    return this.host.isDragInitiator;
  }

  /**
   * Clean up all resources
   */
  dispose(): void {
    this.deactivate();
  }
}
