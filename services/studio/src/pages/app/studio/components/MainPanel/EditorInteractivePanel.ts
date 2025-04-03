import { css, html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@nuralyui/tabs";
import "@nuralyui/select";
import { styleMap } from "lit/directives/style-map.js";
import { $environment, type Environment, ViewMode } from "$store/environment";
import { $contextMenuEvent, $currentPageViewPort, $pageZoom } from "$store/page";
import { type ComponentElement } from "$store/component/interface";
import { $selectedComponent } from "$store/component/store.ts";
import { createRef, type Ref, ref } from "lit/directives/ref.js";
import { $currentApplication } from "$store/apps";
import "../Layout/ThemeContainer";

import "./AI-Assistant.ts";
@customElement("editor-interactive-panel")
export class EditorInteractivePanel extends LitElement {
  static styles = css`
    :host {
      height: calc(100vh - 110px);
      display: block;
        /*width: calc(100vw - 650px);*/
    }
    .page-container {
      width: 100%;
      overflow: auto;
    --hybrid-tabs-content-padding: 10px;

      
      
      
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
  @state() zoomLevel = 100;
  @state() selectedComponent: ComponentElement;
  @state() currentPageViewPort: string;
  private inputRef: Ref<HTMLInputElement> = createRef();
  private inputRef2: Ref<HTMLInputElement> = createRef();

  @state() currentcontextMenuEvent: any;
  @state() showContextMeny: boolean = false;

  constructor() {
    super();
  }

  handleScroll = (event: Event) => {
    if (this.inputRef.value) {
      
    }
  };

  connectedCallback() {
    super.connectedCallback();
    this.initializeSubscriptions();
    $contextMenuEvent.subscribe(this.handleContextMenuEvent);
    requestAnimationFrame(() => {
      this.shadowRoot?.querySelector(".page-container")?.addEventListener("scroll", this.handleScroll);
    });
    document.addEventListener("keydown", this.handleEscapeKey);
    document.addEventListener("click", this.handleClickOutside);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.shadowRoot?.querySelector(".page-container")?.removeEventListener("scroll", this.handleScroll);
    document.removeEventListener("keydown", this.handleEscapeKey);
    document.removeEventListener("click", this.handleClickOutside);
  }

  render() {
    return html`
    <ai-assistant-block> </ai-assistant-block>
    <theme-contaienr>
      <div>
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
      </theme-contaienr>
    `;
  }

  private initializeSubscriptions() {
    $selectedComponent($currentApplication.get()?.uuid).subscribe(selectedComponent => {
      this.selectedComponent = selectedComponent;
    });

    $environment.subscribe((environment: Environment) => {
      this.mode = environment.mode;
    });

    $currentPageViewPort.subscribe(viewPort => {
      this.updateViewPort(viewPort);
    });

    $pageZoom.subscribe(pageZoom => {
      this.updateZoomLevel(pageZoom);
    });
  }

  private updateViewPort(viewPort: string) {
    const viewPortMap = {
      tablet: "720px",
      mobile: "375px",
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
    if (event.key === "Escape" && this.inputRef.value) {
      
      this.showContextMeny = false;
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
