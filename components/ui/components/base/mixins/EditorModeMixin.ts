/**
 * @file EditorModeMixin.ts
 * @description Mixin that adds editor-only functionality to BaseElement
 * Encapsulates all editor-mode specific behavior
 */

import { html, nothing } from "lit";
import { state } from "lit/decorators.js";
import type { LitElement } from "lit";
import type { Ref } from "lit/directives/ref.js";
import { SelectionController } from "../controllers/SelectionController";
import { DragDropController } from "../controllers/DragDropController";
import { ErrorController } from "../controllers/ErrorController";
import type { ComponentElement } from "../../../../../redux/store/component/component.interface";

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Interface for base element host that the mixin extends
 */
export interface EditorModeHost extends LitElement {
  component: ComponentElement;
  item: any;
  isViewMode: boolean;
  inputRef: Ref<HTMLElement>;
  uniqueUUID: string;
  errors: Record<string, any>;
  callbacks: Record<string, (val: any) => void>;
  resolvedInputs: Record<string, any>;
  stylesHandlersValue: Record<string, any>;
  calculatedStyles: Record<string, any>;
}

/**
 * Mixin that adds editor-mode functionality to a base element class
 * This includes selection, drag-drop, and error display capabilities
 */
export function EditorModeMixin<T extends Constructor<EditorModeHost>>(
  superClass: T
) {
  class EditorModeElement extends superClass {
    // Editor-only state
    @state() currentSelection: string[] = [];
    @state() isDragInitiator = false;
    @state() displayErrorPanel = false;
    @state() isEditable = false;
    @state() hoveredComponent: ComponentElement | null = null;
    @state() closestGenericComponentWrapper: HTMLElement | null = null;

    // Editor-only controllers
    protected selectionController!: SelectionController;
    protected dragDropController!: DragDropController;
    protected errorController!: ErrorController;

    constructor(...args: any[]) {
      super(...args);

      // Initialize controllers with proper host interface
      // Note: Controllers are initialized in connectedCallback when host is ready
    }

    override connectedCallback(): void {
      super.connectedCallback();

      if (!this.isViewMode) {
        // Create controllers if they don't exist
        if (!this.selectionController) {
          this.selectionController = new SelectionController(this as any);
        }
        if (!this.dragDropController) {
          this.dragDropController = new DragDropController(this as any);
        }
        if (!this.errorController) {
          this.errorController = new ErrorController(this as any);
        }

        // Activate all editor controllers
        this.selectionController.activate();
        this.dragDropController.activate();
        this.errorController.activate();
      }
    }

    override disconnectedCallback(): void {
      if (!this.isViewMode) {
        // Deactivate all editor controllers
        this.selectionController?.deactivate();
        this.dragDropController?.deactivate();
        this.errorController?.deactivate();
      }

      super.disconnectedCallback();
    }

    /**
     * Select this component in the editor
     */
    selectComponent(event?: Event): void {
      if (!this.isViewMode && this.selectionController) {
        this.selectionController.select(event);
      }
    }

    /**
     * Check if this component is currently selected
     */
    isSelected(): boolean {
      return this.selectionController?.isSelected() ?? false;
    }

    /**
     * Check if this component is currently hovered
     */
    isHovered(): boolean {
      return this.selectionController?.isHovered() ?? false;
    }

    /**
     * Render error indicator (editor only)
     */
    renderEditorError() {
      if (this.isViewMode) return nothing;
      return this.errorController?.renderError() ?? nothing;
    }

    /**
     * Render drag wrappers before content (editor only)
     */
    renderBeforeDragWrapper() {
      if (this.isViewMode) return nothing;

      const itemIndex = this.item?.index;
      return this.dragDropController?.renderWrappers(itemIndex) ?? nothing;
    }

    /**
     * Render drag wrapper after content (editor only)
     */
    renderAfterDragWrapper() {
      if (this.isViewMode) return nothing;
      return this.dragDropController?.renderAfterWrapper() ?? nothing;
    }

    /**
     * Render full editor overlay (error + drag wrappers)
     */
    renderEditorOverlay() {
      if (this.isViewMode) return nothing;

      const itemIndex = this.item?.index;

      return html`
        ${this.renderEditorError()}
        ${[0, undefined].includes(itemIndex)
          ? this.renderBeforeDragWrapper()
          : nothing}
      `;
    }

    /**
     * Check if component has errors
     */
    hasErrors(): boolean {
      return this.errorController?.hasErrors() ?? false;
    }

    /**
     * Get error summary
     */
    getErrorSummary(): { count: number; messages: string[] } {
      return (
        this.errorController?.getErrorSummary() ?? { count: 0, messages: [] }
      );
    }
  }

  return EditorModeElement;
}

/**
 * Type helper for classes using the mixin
 */
export type EditorModeElementType = InstanceType<
  ReturnType<typeof EditorModeMixin<Constructor<EditorModeHost>>>
>;
