import "@nuraly/runtime/components";
import styles from "./Page.style";
import { $currentApplication, $resizing } from '@nuraly/runtime/redux/store';
import { type ComponentElement, type DraggingComponentInfo } from '@nuraly/runtime/redux/store';
import { $applicationComponents, $draggingComponentInfo } from '@nuraly/runtime/redux/store';
import { type PageElement } from '@nuraly/runtime/redux/handlers';
import { $applicationPages, $currentPage, $currentPageViewPort } from '@nuraly/runtime/redux/store';
import { html, LitElement, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { renderComponent, Logger, eventDispatcher, copyCpmponentToClipboard, pasteComponentFromClipboard, debounce } from '@nuraly/runtime/utils';
import { getVar } from '@nuraly/runtime/redux/store/context';
import { ViewMode } from '@nuraly/runtime/redux/store';
import { moveDraggedComponentIntoCurrentPageRoot, deleteComponentAction, updatePageInfo, setEnvirementMode } from '@nuraly/runtime/redux/actions';
import { ExecuteInstance } from '@nuraly/runtime';
import type { LogPanel } from '../../panels/log-panel/LogPanel';
import { Subscription } from "rxjs";
import Convert from "ansi-to-html";

const convert = new Convert();
const log = Logger;

@customElement("content-page")
export class PageContent extends LitElement {
  static styles = styles;

  @state() draggingComponentInfo: DraggingComponentInfo | null = null;
  @state() currentPage!: PageElement;
  @state() components: ComponentElement[] = [];

  @property({ type: Boolean }) isViewMode = false;
  mode: ViewMode = ViewMode.Edit;
  @state() zoomLevel = 100;
  @state() currentPlatform: any;

  /** RxJS subscription for cleanup */
  private subscription = new Subscription();

  @query("log-panel")
  private logPanel!: LogPanel;

  /** Event listener cleanup functions */
  private cleanupFunctions: Array<() => void> = [];

  constructor() {
    super();

    $draggingComponentInfo.subscribe(draggingComponentInfo => {
      this.draggingComponentInfo = draggingComponentInfo || null;
    });
      const globalVarHandler = (data: any) => {
      // Trigger refresh of the micro-app
      this.refreshComponent();
    };
    eventDispatcher.on('global:variable:changed', globalVarHandler);

  }

  /**
   * Refresh the page component and re-render all child components
   */
  refreshComponent(): void {
    const currentPlatform = ExecuteInstance.Vars.currentPlatform;
    if(currentPlatform?.platform !== this.currentPlatform?.platform) {
      this.currentPlatform = currentPlatform;
    }

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

    // Subscribe to application pages with debounced refresh
    const pagesSubscription = $applicationPages($currentApplication.get()?.uuid).subscribe(() => {
      this.refreshComponent();
    });
    this.subscription.add(pagesSubscription);

    // Set up event listeners with proper cleanup tracking
    const editModeHandler = () => {
      if(!ExecuteInstance.Vars.currentEditingMode){
        ExecuteInstance.Vars.currentEditingMode = ViewMode.Edit;
        this.mode = ViewMode.Edit;
        setEnvirementMode(this.mode);
      }
      if(ExecuteInstance.Vars.currentEditingMode !== this.mode){
        this.mode = ExecuteInstance.Vars.currentEditingMode;
        setEnvirementMode(this.mode);
      }
    };
    eventDispatcher.on('Vars:currentEditingMode', editModeHandler);
    this.cleanupFunctions.push(() => eventDispatcher.off('Vars:currentEditingMode', editModeHandler));

    const copyHandler = () => {
      this.handleCopy();
    };
    eventDispatcher.on('Copy', copyHandler);
    this.cleanupFunctions.push(() => eventDispatcher.off('Copy', copyHandler));

    const zoomHandler = () => {
      this.zoomLevel = ExecuteInstance.Vars.EditorZoom;
    };
    eventDispatcher.on('Vars:EditorZoom', zoomHandler);
    this.cleanupFunctions.push(() => eventDispatcher.off('Vars:EditorZoom', zoomHandler));

    const pageHandler = () => {
      this.refreshComponent();
      this.style.setProperty('--nuraly-page-background-color', this.currentPage?.style?.["--nuraly-page-background-color"]);
      this.style.setProperty('--nuraly-page-background-color-dark', this.currentPage?.style?.["--nuraly-page-background-color-dark"]);
    };
    eventDispatcher.on('Vars:currentPage', pageHandler);
    this.cleanupFunctions.push(() => eventDispatcher.off('Vars:currentPage', pageHandler));

    const deletedHandler = () => {
      this.refreshComponent();
    };
    eventDispatcher.on('component:deleted', deletedHandler);
    this.cleanupFunctions.push(() => eventDispatcher.off('component:deleted', deletedHandler));

    const updatedHandler = () => {
      this.refreshComponent();
    };
    eventDispatcher.on('component:updated', updatedHandler);
    this.cleanupFunctions.push(() => eventDispatcher.off('component:updated', updatedHandler));

    $currentPageViewPort.subscribe(() => {
      requestAnimationFrame(() => {
        // Placeholder for viewport updates
      });
    });

    const pageContainer = this.shadowRoot!.querySelector(".page-container") as HTMLElement | null;
    this.updatePageInfo(pageContainer?.clientWidth);

    // Use debounced resize handler
    const resizeHandler = debounce(() => {
      const container = this.shadowRoot!.querySelector(".page-container") as HTMLElement | null;
      this.updatePageInfo(container?.clientWidth);
    }, 200);
    window.addEventListener("resize", resizeHandler);
    this.cleanupFunctions.push(() => {
      window.removeEventListener("resize", resizeHandler);
      resizeHandler.cancel();
    });

    // Bind keydown handler once
    const boundKeyHandler = this.handleEscapeKey.bind(this);
    window.addEventListener("keydown", boundKeyHandler);
    this.cleanupFunctions.push(() => window.removeEventListener("keydown", boundKeyHandler));

    this.style.setProperty('--nuraly-page-background-color', this.currentPage?.style?.["--nuraly-page-background-color"]);
    this.style.setProperty('--nuraly-page-background-color-dark', this.currentPage?.style?.["--nuraly-page-background-color-dark"]);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // Clean up all event listeners
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];

    // Clean up RxJS subscriptions
    this.subscription.unsubscribe();
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {

    // Initialize currentPage if not set
    const currentPage = ExecuteInstance.Vars.currentPage;
    const currentApp = $currentApplication.get() as { uuid: string } | null;

    if (!currentPage && currentApp?.uuid) {
      const pages = $applicationPages(currentApp.uuid).get();

      if (pages && pages.length > 0) {
        // Try to find page by URL or UUID if available
        if ((window as any).__URL__) {
          const urlParam = (window as any).__URL__;

          // First try to match by URL (e.g., "blog1", "dashboard")
          let targetPage = pages.find((page: PageElement) => page.url === urlParam);

          // If not found by URL, try to match by UUID
          if (!targetPage) {
            targetPage = pages.find((page: PageElement) => page.uuid === urlParam);
          }
          if (targetPage) {
            ExecuteInstance.VarsProxy.currentPage = targetPage.uuid;
            return;
          }
        }

        // Otherwise, select the first page
        ExecuteInstance.VarsProxy.currentPage = pages[0].uuid;
      }
    }
  }

  handleEscapeKey(e: KeyboardEvent): void {
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

  handleEnterKey(_e: KeyboardEvent): void {
    // Placeholder for future implementation
    // try {
    //   const selectedComponents = ExecuteInstance.VarsProxy.selectedComponents ?? []
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

  updatePageInfo(containerWidth?: number): void {
    const pageContainer = this.shadowRoot!.querySelector(".page-container") as HTMLElement | null;
    const width = containerWidth || pageContainer?.clientWidth || 0;
    updatePageInfo({
      windowWidth: width,
      windowHeight: window.innerHeight,
      viewPort: this.determineViewportType(width)
    });
  }

  determineViewportType(width: number): string {
    if (width >= 1024) return "desktop";
    if (width >= 768) return "tablet";
    if (width >= 375) return "mobile";
    return "unknown";
  }

  isPreviewMode(): boolean {
    return this.mode === ViewMode.Preview || !this.mode || this.isViewMode;
  }

  render() {
    return html`
    <style>
      
      .page-container {
        --page-background-color : var(--nuraly-page-background-color);
        margin-top: 20px;

      }
      @media (prefers-color-scheme: dark) {
        .page-container {
          --page-background-color : var(--nuraly-page-background-color-dark);
        }
      }
    </style>
    <!-- <micro-app
      style=${styleMap({
        "z-index": 9999999,
        position: "absolute",
        bottom: "10px",
        left: "40%",
      })}
    uuid="1" componentToRenderUUID="app_insert_top_bar"> </micro-app> -->
      <style>
        :host{
          zoom: ${this.zoomLevel}%;
        }
      </style>
      <div
        class="page-container ${this.currentPlatform?.isMobile  ? "mobile" : ""} ${this.isPreviewMode() ? "viewer" : ""}"
        style=${styleMap({
          "overflow" : "scroll",
          "width": this.currentPlatform?.width || "auto",
          "height": this.currentPlatform?.height || "",
        
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
      <log-panel></log-panel>
    `;
  }

  handlePageClick(_e: MouseEvent): void {
    if (!$resizing.get()) {
      if (!this.isViewMode) {
        // Placeholder for selection clearing
        // setVar("global", "selectedComponents", []);
      }
    }
  }

  handleDrop(e: DragEvent): void {
    e.preventDefault();
    if (this.draggingComponentInfo) {
      moveDraggedComponentIntoCurrentPageRoot(this.draggingComponentInfo.componentId);
    }
  }

  preventDefault(e: Event): void {
    e.preventDefault();
  }
}
