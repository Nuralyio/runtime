import { css, html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { keyed } from "lit/directives/keyed.js";
import { ViewMode } from '@nuraly/runtime/redux/store';
import { $contextMenuEvent, $currentPageViewPort, $pageZoom, $draggingComponentInfo } from '@nuraly/runtime/redux/store';
import { type ComponentElement } from '@nuraly/runtime/redux/store';
import { $selectedComponent } from '@nuraly/runtime/redux/store';
import { createRef, type Ref, ref } from "lit/directives/ref.js";
import { $currentApplication } from '@nuraly/runtime/redux/store';

import { eventDispatcher } from '@nuraly/runtime/utils';
import { ExecuteInstance } from '@nuraly/runtime';
import './ComponentResizeOverlay.ts';
import './ComponentTitleOverlay.ts';
@customElement("editor-interactive-panel")
export class EditorInteractivePanel extends LitElement {
  static styles = css`
    :host {
      height: calc(100vh - 90px);
      display: block;
    }
    .page-container {
      width: 100%;
      overflow: auto;
      --nuraly-tabs-content-padding: 0px;
    }
    .zoom-area {
      overflow: visible;
      min-height: 800px;
    }
    .zoom-controll {
      bottom: 0;
      text-align: right;
    }
  `;
  @state() mode: ViewMode = ViewMode.Edit;
  @state() zoomLevel = 95;
  @state() selectedComponent: ComponentElement;
  @state() hoveredComponent: ComponentElement;
  @state() currentPageViewPort: string;
  private inputRef: Ref<HTMLInputElement> = createRef();
  private inputRef2: Ref<HTMLInputElement> = createRef();
  private selectedComponentRef: Ref<HTMLElement> = createRef();
  private hoveredComponentRef: Ref<HTMLElement> = createRef();

  @state() currentcontextMenuEvent: any;
  @state() showContextMeny: boolean = false;

  constructor() {
    super();
  }

  handleScroll = (event: Event) => {
    // Scroll handled by overlay components
  };
  
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
    // Force re-render of overlays after drag/drop
    requestAnimationFrame(() => {
      this.requestUpdate();
    });
  };

  connectedCallback() {
    super.connectedCallback();
    this.initializeSubscriptions();
    $contextMenuEvent.subscribe(this.handleContextMenuEvent);
    requestAnimationFrame(() => {
      const pageContainer = this.shadowRoot?.querySelector(".page-container");
      pageContainer?.addEventListener("scroll", this.handleScroll);
    });
    document.addEventListener("keydown", this.handleEscapeKey);
    document.addEventListener("click", this.handleClickOutside);
    document.addEventListener("dragend", this.handleDragEnd);
    document.addEventListener("drop", this.handleDragEnd);
    
    // Listen for component selection and hover events
    this.addEventListener('component-selected', this.handleComponentSelected as EventListener);
    this.addEventListener('component-hovered', this.handleComponentHovered as EventListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.shadowRoot?.querySelector(".page-container")?.removeEventListener("scroll", this.handleScroll);
    document.removeEventListener("keydown", this.handleEscapeKey);
    document.removeEventListener("click", this.handleClickOutside);
    document.removeEventListener("dragend", this.handleDragEnd);
    document.removeEventListener("drop", this.handleDragEnd);
    this.removeEventListener('component-selected', this.handleComponentSelected as EventListener);
    this.removeEventListener('component-hovered', this.handleComponentHovered as EventListener);
  }

  render() {
    return html`
    <style>
      :host{
        width: ${this.mode == ViewMode.Edit ? "calc(100vw - 650px)" : "100vw"};
      }
    </style>
    <ai-assistant-block> </ai-assistant-block>
      <div>
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
        ${
          this.showContextMeny  ? html`
           <quick-action-wrapper
        .componentToRenderUUID=${"quick-action-wrapper"}
        .contextMenuEvent=${this.currentcontextMenuEvent}
        id="quick-action-wrapper"
          ${ref(this.inputRef)}
          style="position: absolute; "
          @click=${(e: Event) => {
      }}
          @displayQuickActionChanged=${(e: CustomEvent) => {
      }}
          .component=${{ ...this.selectedComponent }}
        ></quick-action-wrapper>

        <quick-action-wrapper
        .componentToRenderUUID=${"quick-action-wrapper-bottom"}

        position="bottom"
        .contextMenuEvent=${this.currentcontextMenuEvent}
        id="quick-action-wrapper"
          ${ref(this.inputRef2)}
          style="position: absolute; "
          @click=${(e: Event) => {
      }}
          @displayQuickActionChanged=${(e: CustomEvent) => {
      }}
          .component=${{ ...this.selectedComponent }}
        ></quick-action-wrapper>

          `: nothing
        }
       

        <div class="page-container">
          <div
            class="zoom-area"
            style=${styleMap({
        margin: "0 auto",
        width: this.currentPageViewPort,
        scale: this.zoomLevel / 100,
        height: "100%",
      })}
          >
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }

  private initializeSubscriptions() {
    eventDispatcher.on('Vars:currentEditingMode', (data)=>{
      this.mode = ExecuteInstance.Vars.currentEditingMode === "edit" ? ViewMode.Edit : ViewMode.Preview;
    })

    $currentPageViewPort.subscribe(viewPort => {
      this.updateViewPort(viewPort);
    });

    $pageZoom.subscribe(pageZoom => {
      this.updateZoomLevel(pageZoom);
    });

    $draggingComponentInfo.subscribe(draggingInfo => {
      // When dragging ends (draggingInfo becomes null), force re-render
      if (draggingInfo === null) {
        requestAnimationFrame(() => {
          this.requestUpdate();
        });
      }
    });
  }

  private updateViewPort(viewPort: string) {
    const viewPortMap = {
      tablet: "720px",
      mobile: "430px",
      default: "100%"
    };
    this.currentPageViewPort = viewPortMap[viewPort] || viewPortMap.default;
    this.requestUpdate();
  }

  private updateZoomLevel(pageZoom: string) {
    this.zoomLevel = Number(pageZoom);
    this.requestUpdate();
  }

  private handleContextMenuEvent = (contextMenuEvent: any) => {
    this.currentcontextMenuEvent = contextMenuEvent;
    if (contextMenuEvent && Object.keys(contextMenuEvent).length) {
      this.showContextMeny = true;
      if (this.inputRef.value) {
      
     
       
      }
    } else if (this.inputRef.value) {
      
      this.showContextMeny = false;
    }
  };

  private handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      if (this.inputRef.value) {
        this.showContextMeny = false;
      } else if (this.selectedComponent) {
        // Clear component selection
        this.selectedComponent = null;
        this.selectedComponentRef = null;
        ExecuteInstance.VarsProxy.selectedComponents = [];
        this.requestUpdate();
      }
    }
  };

  private handleClickOutside = (clickOutsideEvent: Event) => {
    if (this.inputRef.value &&
      !(clickOutsideEvent.composedPath() as HTMLElement[]).find((element) => element.id == "quick-action-wrapper")
    ) {
      
      this.showContextMeny = false;
    }

  };
}
