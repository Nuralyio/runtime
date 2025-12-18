/**
 * @file SelectionController.ts
 * @description Controller for handling component selection in editor mode
 * Manages selection state, keyboard navigation, and hover interactions
 */

import type { ReactiveController } from "lit";
import { Subscription } from "rxjs";
import { eventDispatcher } from "../../../../../utils/change-detection";
import { ExecuteInstance } from "../../../../../state/runtime-context";
import EditorInstance from "../../../../../state/editor";
import { RuntimeHelpers } from "../../../../../utils/runtime-helpers";
import { $hoveredComponent } from "../../../../../redux/store/component/store";
import { $resizing } from "../../../../../redux/store/apps";
import { setContextMenuEvent } from "../../../../../redux/actions/page/setContextMenuEvent";
import type { SelectionHost, Disposable, Activatable } from "../types/base-element.types";
import type { ComponentElement } from "../../../../../redux/store/component/component.interface";

/**
 * Controller responsible for component selection and hover state
 * Only active in editor mode (not view mode)
 */
export class SelectionController implements ReactiveController, Disposable, Activatable {
  private host: SelectionHost;
  private subscription = new Subscription();
  private isActive = false;
  private hoveredComponent: ComponentElement | null = null;
  private isEditable = false;

  // Bound event handlers for proper cleanup
  private boundMouseEnter: (e: MouseEvent) => void;
  private boundMouseLeave: (e: MouseEvent) => void;
  private boundClick: (e: MouseEvent) => void;
  private boundContextMenu: (e: MouseEvent) => void;

  constructor(host: SelectionHost) {
    this.host = host;
    host.addController(this);

    // Bind handlers
    this.boundMouseEnter = this.handleMouseEnter.bind(this);
    this.boundMouseLeave = this.handleMouseLeave.bind(this);
    this.boundClick = this.handleClick.bind(this);
    this.boundContextMenu = this.handleContextMenu.bind(this);
  }

  hostConnected(): void {
    // Controller is activated separately via activate()
  }

  hostDisconnected(): void {
    this.deactivate();
  }

  /**
   * Activate selection controller (editor mode only)
   */
  activate(): void {
    if (this.isActive || this.host.isViewMode) return;
    this.isActive = true;

    // Add DOM event listeners
    this.host.addEventListener("mouseenter", this.boundMouseEnter);
    this.host.addEventListener("mouseleave", this.boundMouseLeave);
    this.host.addEventListener("click", this.boundClick);
    this.host.addEventListener("contextmenu", this.boundContextMenu);

    // Subscribe to store changes
    this.setupSubscriptions();
  }

  /**
   * Deactivate selection controller
   */
  deactivate(): void {
    if (!this.isActive) return;
    this.isActive = false;

    // Remove DOM event listeners
    this.host.removeEventListener("mouseenter", this.boundMouseEnter);
    this.host.removeEventListener("mouseleave", this.boundMouseLeave);
    this.host.removeEventListener("click", this.boundClick);
    this.host.removeEventListener("contextmenu", this.boundContextMenu);

    // Clean up subscriptions
    this.subscription.unsubscribe();
    this.subscription = new Subscription();
  }

  /**
   * Set up store subscriptions
   */
  private setupSubscriptions(): void {
    // Hover component store
    this.subscription.add(
      RuntimeHelpers.createStoreObservable($hoveredComponent).subscribe(
        (hoveredComponent) => {
          this.hoveredComponent = hoveredComponent;
        }
      )
    );

    // Selection changes
    this.subscription.add(
      eventDispatcher.on("Vars:selectedComponents", () => {
        this.handleSelectionChange();
      })
    );

    // Keyboard events
    this.subscription.add(
      eventDispatcher.on("keydown", ({ key, selectedComponents }) => {
        this.handleKeydown(key, selectedComponents);
      })
    );
  }

  /**
   * Handle selection change events
   */
  private handleSelectionChange(): void {
    const selectedComponents = ExecuteInstance.Vars.selectedComponents;
    this.host.currentSelection = Array.from(selectedComponents).map(
      (component: ComponentElement) => component.uuid
    );
    EditorInstance.currentSelection = this.host.currentSelection;

    // Check if this component is selected
    const isSelected =
      selectedComponents.length === 1 &&
      selectedComponents[0]?.uuid === this.host.component.uuid;

    if (isSelected) {
      this.scrollIntoViewIfNeeded();
      this.emitSelectionEvent();
    }
  }

  /**
   * Scroll component into view if not visible
   */
  private scrollIntoViewIfNeeded(): void {
    requestAnimationFrame(() => {
      const element = this.host.inputRef.value;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const isInViewport =
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth);

      if (!isInViewport) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    });
  }

  /**
   * Emit component selected custom event
   */
  private emitSelectionEvent(): void {
    requestAnimationFrame(() => {
      this.host.dispatchEvent(
        new CustomEvent("component-selected", {
          detail: {
            component: this.host.component,
            elementRef: this.host.inputRef,
          },
          bubbles: true,
          composed: true,
        })
      );
    });
  }

  /**
   * Handle keydown events
   */
  private handleKeydown(key: string, selectedComponents: string[]): void {
    if (
      key === "Enter" &&
      selectedComponents.length === 1 &&
      this.host.component.uuid === selectedComponents[0]
    ) {
      this.isEditable = true;
    }
  }

  /**
   * Handle mouse enter event
   */
  private handleMouseEnter(_e: MouseEvent): void {
    // Don't trigger hover when resizing
    if ($resizing.get()) return;

    // Emit hover event
    this.host.dispatchEvent(
      new CustomEvent("component-hovered", {
        detail: {
          component: this.host.component,
          elementRef: this.host.inputRef,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Handle mouse leave event
   */
  private handleMouseLeave(_e: MouseEvent): void {
    // Don't trigger hover clear when resizing
    if ($resizing.get()) return;

    // Emit hover clear event
    this.host.dispatchEvent(
      new CustomEvent("component-hovered", {
        detail: {
          component: null,
          elementRef: null,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Handle click event for selection
   */
  private handleClick(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.select(e);
  }

  /**
   * Handle context menu event
   */
  private handleContextMenu(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();

    this.select(e);

    const rect = this.host.inputRef.value?.getBoundingClientRect();
    if (rect) {
      Object.assign(e, {
        ComponentTop: rect.top,
        ComponentLeft: rect.left,
        ComponentBottom: rect.bottom,
        ComponentHeight: rect.height,
      });
      setContextMenuEvent(e);
    }
  }

  /**
   * Select this component
   */
  select(_e?: Event): void {
    const { component } = this.host;

    // Update selection state
    this.host.currentSelection = [component.uuid];
    EditorInstance.currentSelection = [component.uuid];
    ExecuteInstance.VarsProxy.selectedComponents = [component];

    // Emit selection event
    this.host.dispatchEvent(
      new CustomEvent("component-selected", {
        detail: {
          component: component,
          elementRef: this.host.inputRef,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Check if this component is currently selected
   */
  isSelected(): boolean {
    return this.host.currentSelection.includes(this.host.component.uuid);
  }

  /**
   * Check if this component is currently hovered
   */
  isHovered(): boolean {
    return this.hoveredComponent?.uuid === this.host.component.uuid;
  }

  /**
   * Check if component is in editable mode
   */
  getIsEditable(): boolean {
    return this.isEditable;
  }

  /**
   * Set editable mode
   */
  setEditable(editable: boolean): void {
    this.isEditable = editable;
  }

  /**
   * Clean up all resources
   */
  dispose(): void {
    this.deactivate();
  }
}
