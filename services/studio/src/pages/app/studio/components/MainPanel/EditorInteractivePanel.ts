import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@nuralyui/tabs";
import "@nuralyui/color-picker";
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
        width: calc(100vw - 650px);
    }
    .page-container {
      width: 100%;
      overflow: auto;
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

  constructor() {
    super();
    this.initializeSubscriptions();
  }

  handleScroll = (event: Event) => {
    if (this.inputRef.value) {
      this.inputRef.value.style.display = "none";
    }
  };

  connectedCallback() {
    super.connectedCallback();
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
        <quick-action-wrapper
        id="quick-action-wrapper"
          ${ref(this.inputRef)}
          style="position: absolute; display: none;"
          @click=${(e: Event) => {
    }}
          @displayQuickActionChanged=${(e: CustomEvent) => {
    }}
          .component=${{ ...this.selectedComponent }}
        ></quick-action-wrapper>
        <div class="page-container">
          <div
            class="zoom-area"
            style=${styleMap({
      margin: "0 auto",
      width: this.currentPageViewPort,
      scale: this.zoomLevel / 100
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
    $selectedComponent($currentApplication.get().uuid).subscribe(selectedComponent => {
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
    if (contextMenuEvent && Object.keys(contextMenuEvent).length) {
      if (this.inputRef.value) {
        this.inputRef.value.style.display = "block";
        this.inputRef.value.style.top = `${contextMenuEvent.ComponentTop - 5}px`;
        this.inputRef.value.style.left = `${contextMenuEvent.ComponentLeft}px`;
      }
    } else if (this.inputRef.value) {
      this.inputRef.value.style.display = "none";
    }
  };

  private handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === "Escape" && this.inputRef.value) {
      this.inputRef.value.style.display = "none";
    }
  };

  private handleClickOutside = (clickOutsideEvent: Event) => {
    if (this.inputRef.value &&
      !(clickOutsideEvent.composedPath() as HTMLElement[]).find((element) => element.id == "quick-action-wrapper")
    ) {
      this.inputRef.value.style.display = "none";
    }

  };
}
