import { css, html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { keyed } from "lit/directives/keyed.js";
import { ViewMode, $currentPageViewPort, $pageZoom, $draggingComponentInfo, type ComponentElement } from '@nuraly/runtime/redux/store';
import { type Ref } from "lit/directives/ref.js";

import { eventDispatcher } from '@nuraly/runtime/utils';
import { ExecuteInstance } from '@nuraly/runtime';
import '../main-panel/ComponentResizeOverlay.ts';
import '../main-panel/ComponentTitleOverlay.ts';

/**
 * PreviewEditorPanel - Editor panel that runs INSIDE the iframe
 *
 * This component wraps the content-page and renders selection/hover overlays.
 * It listens for component-selected and component-hovered events that bubble
 * up from child components.
 */
@customElement("preview-editor-panel")
export class PreviewEditorPanel extends LitElement {
  static readonly styles = css`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
    .page-container {
      width: 100%;
      height: 100%;
      overflow: auto;
    }
    .zoom-area {
      overflow: visible;
      min-height: 100%;
    }
  `;

  @state() mode: ViewMode = ViewMode.Edit;
  @state() zoomLevel = 100;
  @state() selectedComponent: ComponentElement;
  @state() hoveredComponent: ComponentElement;
  @state() currentPageViewPort: string = "100%";
  @state() selectedComponentRef: Ref<HTMLElement> | null = null;
  @state() hoveredComponentRef: Ref<HTMLElement> | null = null;

  handleComponentSelected = (event: CustomEvent) => {
    const { component, elementRef } = event.detail;
    if (component && elementRef) {
      this.selectedComponent = component;
      this.selectedComponentRef = elementRef;
      this.requestUpdate();
    }
  };

  handleComponentHovered = (event: CustomEvent) => {
    const { component, elementRef } = event.detail;
    if (component && elementRef) {
      this.hoveredComponent = component;
      this.hoveredComponentRef = elementRef;
    } else {
      this.hoveredComponent = null;
      this.hoveredComponentRef = null;
    }
    this.requestUpdate();
  };

  handleDragEnd = () => {
    requestAnimationFrame(() => {
      this.requestUpdate();
    });
  };

  connectedCallback() {
    super.connectedCallback();

    // If this is a standalone view (not inside studio iframe), set mode to Preview to hide overlays
    if ((window as any).__IS_VIEW_MODE__) {
      this.mode = ViewMode.Preview;
    }

    this.initializeSubscriptions();

    document.addEventListener("dragend", this.handleDragEnd);
    document.addEventListener("drop", this.handleDragEnd);

    // Listen for component selection and hover events from DOM
    document.addEventListener('component-selected', this.handleComponentSelected as EventListener);
    document.addEventListener('component-hovered', this.handleComponentHovered as EventListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("dragend", this.handleDragEnd);
    document.removeEventListener("drop", this.handleDragEnd);
    document.removeEventListener('component-selected', this.handleComponentSelected as EventListener);
    document.removeEventListener('component-hovered', this.handleComponentHovered as EventListener);
  }

  render() {
    const overlayDisplay = this.mode == ViewMode.Edit ? "block" : "none";

    return html`
      <div class="overlay-container" style="display: ${overlayDisplay}">
        ${this.hoveredComponent && this.hoveredComponentRef?.value && this.hoveredComponent.uuid !== this.selectedComponent?.uuid ? html`
          <component-title-overlay
            .component=${this.hoveredComponent}
            .componentRef=${this.hoveredComponentRef}
            .isSelected=${false}
            .opacity=${0.9}
          ></component-title-overlay>

          <component-resize-overlay
            .component=${this.hoveredComponent}
            .componentRef=${this.hoveredComponentRef}
            .isSelected=${false}
          ></component-resize-overlay>
        ` : nothing}

        ${this.selectedComponent && this.selectedComponentRef?.value ? keyed(this.selectedComponent.uuid, html`
          <component-title-overlay
            .component=${this.selectedComponent}
            .componentRef=${this.selectedComponentRef}
            .isSelected=${true}
          ></component-title-overlay>

          <component-resize-overlay
            .component=${this.selectedComponent}
            .componentRef=${this.selectedComponentRef}
            .isSelected=${true}
            .opacity=${1}
          ></component-resize-overlay>
        `) : nothing}
      </div>

      <div class="page-container">
        <div
          class="zoom-area"
          style=${styleMap({
            margin: "0 auto",
            width: this.currentPageViewPort,
          })}
        >
          <slot></slot>
        </div>
      </div>
    `;
  }

  private initializeSubscriptions() {
    // Don't subscribe to mode changes if in standalone view mode
    if (!(window as any).__IS_VIEW_MODE__) {
      eventDispatcher.on('Vars:currentEditingMode', () => {
        this.mode = ExecuteInstance.Vars.currentEditingMode === "edit" ? ViewMode.Edit : ViewMode.Preview;
      });

      // Listen for selection changes from parent window (via iframe bridge)
      // This handles selections made from the structure panel in the parent
      eventDispatcher.on('Vars:selectedComponents', () => {
        const selectedComponents = ExecuteInstance.Vars.selectedComponents;
        if (selectedComponents?.length === 1) {
          const component = selectedComponents[0];
          // Find the DOM element by data-component-uuid attribute or class
          const element = this.findComponentElement(component.uuid);
          if (element) {
            this.selectedComponent = component;
            this.selectedComponentRef = { value: element };
            this.requestUpdate();
          }
        } else if (!selectedComponents?.length) {
          // Clear selection
          this.selectedComponent = null;
          this.selectedComponentRef = null;
          this.requestUpdate();
        }
      });
    }

    $currentPageViewPort.subscribe(viewPort => {
      this.updateViewPort(viewPort);
    });

    $pageZoom.subscribe(pageZoom => {
      this.updateZoomLevel(pageZoom);
    });

    $draggingComponentInfo.subscribe(draggingInfo => {
      if (draggingInfo === null) {
        requestAnimationFrame(() => {
          this.requestUpdate();
        });
      }
    });
  }

  private updateViewPort(viewPort: string) {
    const viewPortMap: Record<string, string> = {
      tablet: "720px",
      mobile: "430px",
      default: "100%"
    };
    this.currentPageViewPort = viewPortMap[viewPort] || viewPortMap.default;
    this.requestUpdate();
  }

  private updateZoomLevel(pageZoom: string) {
    this.zoomLevel = Number(pageZoom) || 100;
    this.requestUpdate();
  }

  /**
   * Find a component element by UUID, searching through Shadow DOMs
   */
  private findComponentElement(uuid: string): HTMLElement | null {
    // First try direct query on document
    let element = document.querySelector(`[data-component-uuid="${uuid}"]`) as HTMLElement;
    if (element) return element;

    // Also try by class name (component-{uuid})
    element = document.querySelector(`.component-${uuid}`) as HTMLElement;
    if (element) return element;

    // Search through shadow roots recursively
    const searchShadowRoots = (root: Document | ShadowRoot): HTMLElement | null => {
      // Try direct query
      let found = root.querySelector(`[data-component-uuid="${uuid}"]`) as HTMLElement;
      if (found) return found;

      found = root.querySelector(`.component-${uuid}`) as HTMLElement;
      if (found) return found;

      // Search in shadow roots of all elements
      const allElements = root.querySelectorAll('*');
      for (const el of allElements) {
        if (el.shadowRoot) {
          const result = searchShadowRoots(el.shadowRoot);
          if (result) return result;
        }
      }
      return null;
    };

    return searchShadowRoots(document);
  }
}
