import "@shared/components/Collections/Collections";
import "@shared/components/Button/Button";
import "@shared/components/Containers/Container";
import "@shared/components/TextInput/TextInput";
import "@shared/components/TextLabel/TextLabel";
import "@shared/wrappers/GenerikWrapper/GenerikWrapper";
import "@shared/wrappers/RectangleSelection/RectangleSelection";
import styles from "./Page.style";
import { $currentApplication, $resizing } from "$store/apps";
import { type ComponentElement, type DraggingComponentInfo } from "$store/component/interface";
import { $applicationComponents, $draggingComponentInfo } from "$store/component/store.ts";
import { type PageElement } from "$store/handlers/pages/interfaces/interface";
import { $applicationPages, $currentPage, $currentPageViewPort } from "$store/page";
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { renderComponent } from "utils/render-util";
import { getVar } from "$store/context";
import { log } from "utils/logger";
import { eventDispatcher } from "utils/change-detection";
import { ViewMode } from "$store/environment";
import {
  moveDraggedComponentIntoCurrentPageRoot
} from "$store/actions/component/moveDraggedComponentIntoCurrentPageRoot.ts";
import { deleteComponentAction } from "$store/actions/component/deleteComponentAction.ts";
import { updatePageInfo } from "$store/actions/page/updatePageInfo.ts";
import { setEnvirementMode } from "$store/actions/editor/setEnvirementMode";
import { copyCpmponentToClipboard, pasteComponentFromClipboard } from "@utils/clipboard-utils";
import { ExecuteInstance } from "core/Kernel";

@customElement("content-page")
export class PageContent extends LitElement {
  static styles = styles;

  @state() draggingComponentInfo: DraggingComponentInfo;
  @state() currentPage: PageElement;
  @state() components: ComponentElement[] = [];

  @property({ type: Boolean }) isViewMode = false;
  mode: ViewMode = ViewMode.Edit;
  @state() zoomLevel = 100;
  @state() currentPlatform: any;

  constructor() {
    super();

    eventDispatcher.onAny((eventName, data) => {
      this.refreshComponent();
    });

    $draggingComponentInfo.subscribe(draggingComponentInfo => {
      this.draggingComponentInfo = draggingComponentInfo || null;
    });
  }

  refreshComponent() {
    const currentPlatform = ExecuteInstance.Vars.currentPlatform;
    if(currentPlatform?.platform !== this.currentPlatform?.platform) {
      this.currentPlatform = currentPlatform;
    }
    log.prefix("PageContent").info("refreshComponent");
    const currentPage = ExecuteInstance.Vars.currentPage;
    if(!currentPage){
      return;
    }
    const currentEditingApplication = getVar("global", "currentEditingApplication");

    if (currentEditingApplication && currentPage) {
      const currentAppUuid = currentEditingApplication.value.uuid;

      this.currentPage = $currentPage(currentAppUuid, currentPage).get();
      const components = $applicationComponents(currentAppUuid).get();
      // Filter for components that belong to the current page and are root.
      const pageComponents = components.filter(
        component =>
          component.pageId &&
          currentPage &&
          component.pageId === currentPage &&
          component.root
      );

      // Sort the components based on their position in this.currentPage.component_ids
      if (this.currentPage?.component_ids) {
        pageComponents.sort((a, b) => {
          const idxA = this.currentPage.component_ids.indexOf(a.uuid);
          const idxB = this.currentPage.component_ids.indexOf(b.uuid);
          return idxA - idxB;
        });
      }

      this.components = pageComponents;
    }
    this.requestUpdate();
  }


  connectedCallback() {
    super.connectedCallback();

    eventDispatcher.on('Vars:currentEditingMode', (data)=>{
      if(! ExecuteInstance.Vars.currentEditingMode ){
        ExecuteInstance.Vars.currentEditingMode =  ViewMode.Edit;
      }
      if(ExecuteInstance.Vars.currentEditingMode !== this.mode){
        this.mode = ExecuteInstance.Vars.currentEditingMode;
        setEnvirementMode( this.mode )
      }
     
    })

    eventDispatcher.on('Vars:currentPage', (data)=>{
     this.refreshComponent();
    this.style.setProperty('--hybrid-page-background-color',  this.currentPage?.style?.["--hybrid-page-background-color"]);
    this.style.setProperty('--hybrid-page-background-color-dark', this.currentPage?.style?.["--hybrid-page-background-color-dark"]);

     
    })

    eventDispatcher.on('component:deleted', (data)=>{
      this.refreshComponent();
      
     })
    $currentPageViewPort.subscribe(() => {
      requestAnimationFrame(() => {
      });
    });


    const pageContainer = this.shadowRoot!.querySelector(".page-container");
    this.updatePageInfo(pageContainer?.clientWidth);

    window.onresize = () => {
      this.updatePageInfo(pageContainer?.clientWidth);
    };
    const currentPage = ExecuteInstance.Vars.currentPage;

    if (!currentPage && $currentApplication.get()) {
      ExecuteInstance.VarsProxy.currentPage = $applicationPages($currentApplication.get()?.uuid).get()[0]?.uuid;
    }
    window.addEventListener("keydown", this.handleEscapeKey.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this.handleEscapeKey.bind(this));
  }

  handleEscapeKey(e) {
    switch (e.key) {
      case "Escape":
        this.clearSelectedComponents();
        break;
      case "Enter":
        this.handleEnterKey(e);
        break;
      case "Delete":
        this.confirmDelete();
        break;
      case "Backspace":
        if (e.metaKey) {
          this.confirmDelete();
        }
        break;
      case "c":
        if (e.metaKey || e.ctrlKey) {
          // this.handleCopy();
        }
        break;
      case "v":
        if (e.metaKey || e.ctrlKey) {
          this.handlePaste();
        }
        break;
    }
  }

  handleCopy() {
      const selectedComponentId=  (ExecuteInstance.VarsProxy.selectedComponents ?? []).
      map((component: ComponentElement) => component.uuid);
      const currentEditingApplication = getVar('global', "currentEditingApplication").value;
      const applicationComponents = $applicationComponents(currentEditingApplication.uuid).get();
      const selectedComponents = applicationComponents.find((component) =>
        selectedComponentId[0] === component.uuid
      );
      copyCpmponentToClipboard(selectedComponents);
  }
  
  handlePaste() {
    pasteComponentFromClipboard()
  }

  clearSelectedComponents() {
    try {
      ExecuteInstance.VarsProxy.selectedComponents = []
    } catch (error) {
      console.error("Error clearing selected components:", error);
    }
  }

  handleEnterKey(e) {
    // try {
    //   const selectedComponents =  ExecuteInstance.VarsProxy.selectedComponents ?? []
    //   eventDispatcher.emit("keydown", {
    //     key: e.key,
    //     selectedComponents: selectedComponents
    //   });
    // } catch (error) {
    //   console.error("Error handling Enter key:", error);
    // }
  }


  confirmDelete() {
    const selectedComponents = ExecuteInstance.VarsProxy.selectedComponents ?? [];
    if (selectedComponents.length > 0) {
      const confirmation = window.confirm("Are you sure you want to delete the selected components?");
      if (confirmation) {
        this.handleDeleteKey();
      }
    }
  }

  handleDeleteKey() {
    const selectedComponents = ExecuteInstance.VarsProxy.selectedComponents ?? [];
    selectedComponents.forEach((component: ComponentElement) => {
      deleteComponentAction(component.uuid, component.application_id).then(r => {
        // todo: implment this
      });
    });
  }

  updatePageInfo(containerWidth: number) {
    const pageContainer = this.shadowRoot!.querySelector(".page-container");
    updatePageInfo({
      windowWidth: containerWidth || pageContainer?.clientWidth,
      windowHeight: window.innerHeight,
      viewPort: this.determineViewportType(containerWidth || pageContainer?.clientWidth)
    });
  }

  determineViewportType(width: number) {
    if (width >= 1024) return "desktop";
    if (width >= 768) return "tablet";
    if (width >= 375) return "mobile";
    return "unknown";
  }

  isPreviewMode() {
    return this.mode === ViewMode.Preview || !this.mode || this.isViewMode;
  }

  render() {
    return html`
    <style>
      .page-container {
        --page-background-color : var(--hybrid-page-background-color);
      }
      @media (prefers-color-scheme: dark) {
        .page-container {
          --page-background-color : var(--hybrid-page-background-color-dark);
        }
      }
    </style>
    <micro-app
      style=${styleMap({
        "z-index": 9999999,
        position: "absolute",
        bottom: "10px",
        left: "40%",
      })}
    uuid="1" componentToRenderUUID="app_insert_top_bar"> </micro-app>
      <style>
        :host{
          zoom: ${this.zoomLevel}%;
        }
      </style>
       <!-- <rectangle-selection> -->
      <div
        class="page-container ${this.currentPlatform?.isMobile  ? "mobile" : ""} ${this.isPreviewMode() ? "viewer" : ""}"
        style=${styleMap({
          "width": this.currentPlatform?.width || "auto",
          "height": this.currentPlatform?.height || "100%",
        
        })}
        @mousedown=${this.handlePageClick}
        @dragend=${this.preventDefault}
        @dragenter=${this.preventDefault}
        @dragleave=${this.preventDefault}
        @dragover=${this.preventDefault}
        @drop=${this.handleDrop}
      >
        ${this.components.length
      ? renderComponent(this.components, null, this.mode === ViewMode.Preview || !this.mode || this.isViewMode)
      : html`<div class="page-empty-message-container">
                <p class="page-empty-message">Add an item to the page
                <micro-app
      style=${styleMap({
      })}
    uuid="1" componentToRenderUUID="app_insert_top_bar"> </micro-app>
                </p>
                
              </div>`}
      </div>
      <!-- </rectangle-selection> -->
    `;
  }

  handlePageClick(e) {
    if (!$resizing.get()) {
      if (!this.isViewMode) {
      //  setVar("global", "selectedComponents", []);
      }
    }
  }

  handleDrop(e) {
    e.preventDefault();
    moveDraggedComponentIntoCurrentPageRoot(this.draggingComponentInfo.componentId);
  }

  preventDefault(e: { preventDefault: () => void; }) {
    e.preventDefault();
  }
}
